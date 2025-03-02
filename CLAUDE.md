# CLAUDE.md - Agent Assistance Guide

## Commands
- Build: `npm run build`
- Start: `npm run start` or `tsx index.ts`
- Lint: No formal linting setup (consider adding ESLint)
- Format: No formal formatting setup (consider adding Prettier)
- Test: No formal test setup (consider adding Playwright test)

## Code Style
- **TypeScript**: Use proper typing for all functions and variables
- **Modules**: ES modules with import/export (not CommonJS)
- **Naming**: camelCase for variables/functions, PascalCase for classes/types
- **Async**: Use async/await pattern for browser automation
- **Error Handling**: Try/catch with fallbacks to Stagehand when direct selectors fail
- **Environment**: Use utils.ts getEnv() for environment variable access
- **Caching**: Leverage cached browser actions for performance

## Architecture
- Browser automation via Stagehand/Playwright
- LLM integration (Ollama locally, cloud options available)
- Visual recognition of UI elements using AI models
- Support for both local and cloud execution