# 🏙️ Vancouver Apartment Scraper

Hey! This is a project built with [Stagehand](https://github.com/browserbase/stagehand) that automates apartment hunting in Vancouver.

## 🏢 What it Does

This script automates searching apartments.com for Vancouver properties, filtering by price and bedroom count, and extracting detailed unit information into a structured CSV. It visits multiple property listings in sequence and extracts data from the "Pricing & Floor Plans" section of each property.

Key features:
- Automated filtering by price, bed type, and property type
- Multi-property scraping (visits up to 5 listings by default)
- Detailed unit data extraction (price, square footage, floor plan, availability)
- CSV export of all collected data

## 🚀 Setting Up

Get everything ready to run:

```bash
npm install
cp .env.example .env
nano .env # Add your Google Generative AI API key
```

## ⚙️ Configuration

You can customize your search by modifying these variables at the top of `main.ts`:

```javascript
// ======= CONFIGURATION =======
const UNIT_TYPE = "1 Bed";  // Options: "Studio", "1 Bed", "2 Beds", "3+ Beds"
const MIN_PRICE = "2000";   // Minimum price filter
const LOCATION = "mount-pleasant-vancouver-bc"; // Location to search
const MAX_LISTINGS = 5;     // Maximum number of properties to visit
// ============================
```

## 🏃‍♂️ Running the Scraper

Start the apartment search:

```bash
npm start
```

## 💡 Personal Note

I created this tool as part of my journey to bring modern technology to my traditional finance role in Real Estate. This script represents a step toward fully automating property research and analysis, allowing me to focus on higher-value activities while letting code handle the repetitive data collection tasks.

## 🔄 Run on Browserbase

To run on Browserbase, add your API keys to .env and change `env: "LOCAL"` to `env: "BROWSERBASE"` in [stagehand.config.ts](stagehand.config.ts).

## 🤖 Use Different AI Models

By default, this uses Google's Gemini model with their free API (1000 requests/month free), which I specifically customized to make this project accessible without cost. You can also modify [stagehand.config.ts](stagehand.config.ts) to use:

1. OpenAI: Update `model` to `"gpt-4o"` and use your `OPENAI_API_KEY`
2. Anthropic: Update `model` to `"claude-3-5-sonnet-latest"` and use your `ANTHROPIC_API_KEY`

## 🙏 Acknowledgements

This project wouldn't be possible without:
- [BrowserBase](https://www.browserbase.hq) and their browser automation platform
- [Stagehand](https://github.com/browserbaseHQ/stagehand) for AI-driven web automation
- Google's Generative AI APIs for intelligent extraction