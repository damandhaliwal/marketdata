/**
 * March 2, 2025
 * This script scrapes apartments.com for Vancouver, BC, Canada
 * It searches for apartments with a minimum price
 * Data extracted includes property name, price, bedrooms, bathrooms and square footage
 * Results are saved to a CSV file
 */

import { google } from "@ai-sdk/google";
import { z } from "zod";
import { Stagehand } from "@browserbasehq/stagehand";
import { AISdkClient } from "./external_clients/aisdk";
import StagehandConfig from "./stagehand.config.js";
import dotenv from "dotenv";
import fs from "fs/promises";

// Load environment variables
dotenv.config();

// ======= CONFIGURATION =======
// Set these parameters for your search
const UNIT_TYPE = "1 Bed";  // Options: "Studio", "1 Bed", "2 Beds", "3+ Beds"
const MIN_PRICE = "2000";
const LOCATION = "mount-pleasant-vancouver-bc"; // Location to search
const MAX_LISTINGS = 5; // Limit number of listings to process
// ============================

/**
 * Saves data to a CSV file
 */
async function saveToCSV(data, filename) {
  if (!data || data.length === 0) {
    console.log("No data to save");
    return;
  }

  // Get headers from the first object's keys
  const headers = Object.keys(data[0]);
  
  // Create CSV content with headers
  let csvContent = headers.join(",") + "\n";
  
  // Add each row of data
  data.forEach(item => {
    const row = headers.map(header => {
      // Handle commas in data by wrapping in quotes
      const value = item[header] || "";
      return `"${value.toString().replace(/"/g, '""')}"`;
    });
    csvContent += row.join(",") + "\n";
  });

  // Write to file
  await fs.writeFile(filename, csvContent);
  console.log(`✅ Data saved to ${filename}`);
}

/**
 * Main function to run the apartment scraper
 */
export async function main() {
  // Check if the API key is loaded
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    console.error("Error: GOOGLE_GENERATIVE_AI_API_KEY is not set in your .env file");
    process.exit(1);
  }

  console.log(`🏙️ Starting Vancouver apartment search for ${UNIT_TYPE} (Min: $${MIN_PRICE})`);
  
  // Initialize Stagehand with additional options
  const stagehand = new Stagehand({
    ...StagehandConfig,
    llmClient: new AISdkClient({
      model: google("gemini-2.0-flash", {
        apiKey: apiKey
      }),
    }),
    headless: false, // Use visible browser for debugging
    defaultNavigationTimeout: 60000, // Increase timeout for navigation
  });
  
// Store apartment data
const apartmentData = [];

  await stagehand.init();
  console.log("🌐 Browser initialized");
  
  // Navigate to apartments.com
  await stagehand.page.goto(`https://www.apartments.com/${LOCATION}`);
  console.log(`📄 Navigated to apartments.com for ${LOCATION}`);
  
  // Wait for page to load and handle cookie banner if present
  await new Promise((resolve) => setTimeout(resolve, 5000));
  
  // Click All Filters button - with retry mechanism
  const cookieBanner = await stagehand.page.observe({
    instruction: "find the 'accept all cookies' button",
  });
  await stagehand.page.act(cookieBanner[0]);

  await new Promise((resolve) => setTimeout(resolve, 5000));
  
  // Click All Filters button - with retry mechanism
  const observations1 = await stagehand.page.observe({
    instruction: "find the 'all filters' button",
  });
  await stagehand.page.act(observations1[0]);
  
  // Wait for filters to appear
  await new Promise((resolve) => setTimeout(resolve, 3000));
  
  // Set minimum price
  // Try to click and set the min price
  const minPriceField = await stagehand.page.observe({
    instruction: "find the minimum price input field in the filters",
  });
  await stagehand.page.act(minPriceField[0]);
  await new Promise((resolve) => setTimeout(resolve, 2500));
  
  const minPriceInput = await stagehand.page.observe({
    instruction: "type in the minimum price 2000",
  });
  await stagehand.page.act(minPriceInput[0]);
  console.log("✅ Set minimum price");
  
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const observations2 = await stagehand.page.observe({
    instruction: "find the '1+' button in the 'beds' section",
  });
  await stagehand.page.act(observations2[0]);
  await stagehand.page.act(observations2[0]);
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const observations3 = await stagehand.page.observe({
    instruction: "find the 'apartments' button in the 'home type' section",
  });
  await stagehand.page.act(observations3[0]);

  await new Promise((resolve) => setTimeout(resolve, 3000));
  // Look for the See Results button
  const seeResultsButton = await stagehand.page.observe({
    instruction: "find the 'see results' button",
  });

  if (seeResultsButton && seeResultsButton.length > 0) {
    await stagehand.page.act(seeResultsButton[0]);
    console.log("✅ Clicked See Results button");
    
    // Wait for modal to fully close
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
  const observations7 = await stagehand.page.observe({
    instruction: "find the 1st listing on the page and click it",
  });
  await stagehand.page.act(observations7[0]);

  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Use extract directly
  const propertyInfo = await stagehand.page.extract({
    instruction: "Extract the property name and full address",
    schema: z.object({
      propertyName: z.string(),
      address: z.string(),
    }),
    useTextExtract: true,
  });

  // Then destructure the result
  const { propertyName, address } = propertyInfo;
  console.log("Property Name:", propertyName);
  console.log("Address:", address);

  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Use extract to pull all unit information
  const unitsInfo = await stagehand.page.extract({
    instruction: "Extract all available units information from the table or listing. For each unit, get the unit number/ID, base price, and square footage.",
    schema: z.object({
      units: z.array(z.object({
        unitId: z.string().describe("The unit number or ID (e.g., 1511)"),
        basePrice: z.string().describe("The base price of the unit, including currency symbol (e.g., C$2,450)"),
        squareFeet: z.string().describe("The square footage of the unit (e.g., 615)"),
        availability: z.string().optional().describe("When the unit is available (e.g., Apr 1)"),
      }))
    }),
    useTextExtract: true,
  });

  console.log(`✅ Extracted information for ${unitsInfo.units.length} units`);

  // Add data for each unit to the collection
  unitsInfo.units.forEach(unit => {
    apartmentData.push({
      propertyName: propertyInfo.propertyName,
      address: propertyInfo.address,
      ...unit
    });
  });
  
  // Always close the browser
  await stagehand.close();
  console.log("🔒 Browser closed");

  // Save data to CSV
  await saveToCSV(apartmentData, "vancouver_apartments.csv");
  console.log(`📊 Saved data for ${apartmentData.length} units`);
}
