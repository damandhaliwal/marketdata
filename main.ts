/**
 * March 1, 2025
 * This script is meant to scrape apartments.com for Vancouver, BC, Canada
 * It will search for each type of bedroom, set filters to show certain rent ranges, maybe certain amenities and then extract the data
 * Data extracted will include the property name, price range, number of bedrooms, and number of bathrooms and square footage
 * It will then save the data to a csv file
 */

// Import necessary libraries
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { Stagehand } from "@browserbasehq/stagehand";
import { AISdkClient } from "./external_clients/aisdk";
import StagehandConfig from "./stagehand.config.js";
import dotenv from "dotenv";
import fs from "fs/promises";

// Load environment variables
dotenv.config();

