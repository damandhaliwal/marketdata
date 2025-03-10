// external_clients/aisdk.ts
import {
    CoreAssistantMessage,
    CoreMessage,
    CoreSystemMessage,
    CoreTool,
    CoreUserMessage,
    generateObject,
    generateText,
    ImagePart,
    LanguageModel,
    TextPart,
  } from "ai";
  import { ChatCompletion } from "openai/resources/chat/completions";
  import { CreateChatCompletionOptions, LLMClient, AvailableModel } from "@browserbasehq/stagehand";
  
  export class AISdkClient extends LLMClient {
    public type = "aisdk" as const;
    private model: LanguageModel;
    
    constructor({ model }: { model: LanguageModel }) {
      super(model.modelId as AvailableModel);
      this.model = model;
    }
    
    async createChatCompletion<T = ChatCompletion>({
      options,
      retries = 3,
      logger,
    }: CreateChatCompletionOptions): Promise<T> {
      // Log the request if logger is provided
      if (logger) {
        logger({
          category: "aisdk",
          message: "creating chat completion",
          level: 1,
          auxiliary: {
            options: {
              value: JSON.stringify(options),
              type: "object",
            },
            modelName: {
              value: this.modelName,
              type: "string",
            },
          },
        });
      }
      
      const formattedMessages: CoreMessage[] = options.messages.map((message) => {
        if (Array.isArray(message.content)) {
          if (message.role === "system") {
            const systemMessage: CoreSystemMessage = {
              role: "system",
              content: message.content
                .map((c) => ("text" in c ? c.text : ""))
                .join("\n"),
            };
            return systemMessage;
          }
          const contentParts = message.content.map((content) => {
            if ("image_url" in content) {
              const imageContent: ImagePart = {
                type: "image",
                image: content.image_url.url,
              };
              return imageContent;
            } else {
              const textContent: TextPart = {
                type: "text",
                text: content.text,
              };
              return textContent;
            }
          });
          if (message.role === "user") {
            const userMessage: CoreUserMessage = {
              role: "user",
              content: contentParts,
            };
            return userMessage;
          } else {
            const textOnlyParts = contentParts.map((part) => ({
              type: "text" as const,
              text: part.type === "image" ? "[Image]" : part.text,
            }));
            const assistantMessage: CoreAssistantMessage = {
              role: "assistant",
              content: textOnlyParts,
            };
            return assistantMessage;
          }
        }
        return {
          role: message.role,
          content: message.content,
        };
      });
      
      if (options.response_model) {
        const response = await generateObject({
          model: this.model,
          messages: formattedMessages,
          schema: options.response_model.schema,
        });
        return response.object;
      }
      
      const tools: Record<string, CoreTool> = {};
      if (options.tools) {
        for (const rawTool of options.tools) {
          tools[rawTool.name] = {
            description: rawTool.description,
            parameters: rawTool.parameters,
          };
        }
      }
      
      const response = await generateText({
        model: this.model,
        messages: formattedMessages,
        tools: Object.keys(tools).length > 0 ? tools : undefined,
      });
      
      // Log the response if logger is provided
      if (logger) {
        logger({
          category: "aisdk",
          message: "response",
          level: 1,
          auxiliary: {
            response: {
              value: JSON.stringify(response),
              type: "object",
            },
          },
        });
      }
      
      return response as T;
    }
  }