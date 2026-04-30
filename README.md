<div align="center">

   ███████╗ ██████╗██████╗  █████╗ ██████╗ ███████╗██████╗ 
  ██╔════╝██╔════╝██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔══██╗
  ███████╗██║     ██████╔╝███████║██████╔╝█████╗  ██████╔╝
   ╚════██║██║     ██╔══██╗██╔══██║██╔═══╝ ██╔══╝  ██╔══██╗
   ███████║╚██████╗██║  ██║██║  ██║██║     ███████╗██║  ██║
   ╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚══════╝╚═╝  ╚═╝

**Automated deal scraper → affiliate link converter → Telegram broadcaster**

[![Platform](https://img.shields.io/badge/Platform-Google%20Apps%20Script-4285F4?style=flat-square&logo=google)](https://script.google.com)
[![Source](https://img.shields.io/badge/Source-DesiDime-orange?style=flat-square)](https://www.desidime.com)
[![Affiliate](https://img.shields.io/badge/Affiliate-EarnKaro-green?style=flat-square)](https://earnkaro.com)
[![Channel](https://img.shields.io/badge/Broadcast-Telegram-26A5E4?style=flat-square&logo=telegram)](https://telegram.org)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

---

## 🪂 What is This?

It is a fully cloud-based deal automation bot. It scrapes the latest deals from Deals Websites, converts product links into affiliate links, and broadcasts each deal to a Telegram channel — all without any server or infrastructure. It runs entirely on **Google Apps Script** with a time-driven trigger.

---

## ✨ Features

- 🔍 **Auto-scrapes** new deals from DesiDime's discussed feed
- 🔗 **Affiliate conversion** via EarnKaro API (with graceful fallback to original link)
- 📢 **Telegram broadcasting** with rich Markdown-formatted messages
- 📋 **Google Sheets logging** — tracks every deal with timestamp, title, store, link, price
- 🚫 **Duplicate prevention** — skips already-posted links automatically
- 🧹 **Sheet auto-trimming** — keeps only the latest 1000 rows to prevent bloat
- ☁️ **Zero infrastructure** — runs 100% on Google's cloud, no hosting required

---

## 🏗️ Architecture

```
┌─────────────────────┐
│   Google Apps       │
│   Script Trigger    │  ← Runs every 15–30 min (time-driven)
│   (Cloud Cron)      │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐     ┌──────────────────────┐
│     (HTML Parser)   │────▶│  Google Sheets Log   │
│                     │     │  (Dedup + History)   │
└────────┬────────────┘     └──────────────────────┘
         │
         ▼
┌─────────────────────┐
│           Affiliate │  ← Converts raw links to affiliate links
│  API Converter      │    Falls back to original URL on failure
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Telegram Bot API   │  ← Sends formatted deal message to channel
└─────────────────────┘
```

---

## 🚀 Setup Guide

### Prerequisites

- A Google account (for Google Sheets + Apps Script)
- A Telegram Bot token ([create one via @BotFather](https://t.me/BotFather))
- Your Telegram channel/group Chat ID
- An [EarnKaro](https://earnkaro.com) affiliate account and API token

---

### Step 1 — Copy the Script

1. Open [Google Apps Script](https://script.google.com) → **New Project**
2. Delete the default `myFunction` code
3. Paste the contents of [`Code.gs`](Code.gs) into the editor
4. Rename the project to **Paratrooperz** (or anything you like)

---

### Step 2 — Link a Google Sheet

1. In the Apps Script editor, go to **Services** (left sidebar)  
   — OR — open a new Google Sheet and go to **Extensions → Apps Script**
2. The script uses `SpreadsheetApp.getActiveSpreadsheet()`, so it must be bound to a sheet

> 💡 **Recommended:** Create a new Google Sheet first, then open Apps Script from **Extensions → Apps Script** inside that sheet. This auto-binds them.

The sheet will be auto-populated with columns:

| A — Timestamp | B — Product Title | C — Store | D — Raw Link | E — Price |
|---------------|------------------|-----------|--------------|-----------|

---

### Step 3 — Add Your Credentials

At the top of `Code.gs`, replace the placeholder values:

```javascript
const TELEGRAM_TOKEN  = 'YOUR_TELEGRAM_BOT_TOKEN';   // From @BotFather
const CHAT_ID         = 'YOUR_CHAT_ID';               // e.g. -100xxxxxxxxxx
const EARNKARO_TOKEN  = 'YOUR_EARNKARO_TOKEN';        // From EarnKaro dashboard
```

---

### Step 4 — Set Up the Trigger

1. In Apps Script, click **Triggers** (clock icon in the left sidebar)
2. Click **+ Add Trigger**
3. Configure:
   - **Function:** `scrapeDesiDimeProduction`
   - **Event source:** Time-driven
   - **Type:** Minutes timer
   - **Interval:** Every **15 minutes** (or 30 minutes)
4. Save — Google will ask for permissions, grant them

That's it. The bot is now live and running on Google's cloud. ✅

---

## 📱 Telegram Message Format

Each deal is sent in this format:

```
🛍 New Deal Alert! 🛍

🏷 Product: boAt Rockerz 255 Pro+ Bluetooth Earphones
🏪 Store: AMAZON
💰 Deal Price: ₹999

🔗 https://ekaro.in/enkr123456789
```

---

Script Properties 

Store secrets in Apps Script's built-in properties store:

```javascript
// Run this ONCE to save your secrets
function saveSecrets() {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('TELEGRAM_TOKEN', 'your_token_here');
  props.setProperty('CHAT_ID', 'your_chat_id_here');
  props.setProperty('EARNKARO_TOKEN', 'your_earnkaro_token_here');
}

// Then in Code.gs, replace the const declarations with:
const TELEGRAM_TOKEN  = PropertiesService.getScriptProperties().getProperty('TELEGRAM_TOKEN');
const CHAT_ID         = PropertiesService.getScriptProperties().getProperty('CHAT_ID');
const EARNKARO_TOKEN  = PropertiesService.getScriptProperties().getProperty('EARNKARO_TOKEN');
```


## 📁 Project Structure

```
paratrooperz/
├── Code.gs          # Main Apps Script file (scraper + converter + broadcaster)
├── README.md        # This file
├── .gitignore       # Ignores sensitive/local files
└── LICENSE          # MIT License
```

---

## 🛠️ Customization

| What to change | Where |
|---|---|
| Scrape a different DesiDime page | Change `SOURCE_URL` in `scrapeDesiDimeProduction()` |
| Change message format | Edit the `message` template string |
| Add more deal metadata (discount %, votes) | Extend the regex extraction block |
| Post to multiple Telegram channels | Call `sendTelegramMessage()` with different `CHAT_ID`s |
| Store more columns in the sheet | Extend the `newDeals.push([...])` array |

---

## ⚙️ How It Works

1. **Fetch** — The script fetches the HTML of `desidime.com/discussed` with a browser-like User-Agent
2. **Parse** — It splits the HTML on `</article>` tags and extracts deal metadata using regex
3. **Dedup** — It reads column D of the Google Sheet to skip any links already posted
4. **Convert** — Each raw `visit.desidime.com` link is sent to EarnKaro's API to get an affiliate link. If the API fails or returns an error, the original link is used instead
5. **Broadcast** — A formatted Markdown message is sent to Telegram via the Bot API
6. **Log** — New deals are prepended to the Google Sheet for future dedup checks
7. **Trim** — If the sheet exceeds 1000 rows, old rows are deleted

---

## 🐛 Troubleshooting

| Issue | Fix |
|---|---|
| No messages sent | Check `TELEGRAM_TOKEN` and `CHAT_ID`. Ensure the bot is an admin in the channel |
| Affiliate links not converting | Verify `EARNKARO_TOKEN` is valid. The bot will fall back to raw links |
| `Product Title Unavailable` showing | DesiDime may have changed their HTML structure. Update the regex patterns |
| Script hits execution time limit | Reduce scrape frequency or add `Utilities.sleep(500)` between iterations |
| Duplicate deals appearing | Ensure the script is bound to the correct Google Sheet |

---



This project is licensed under the [MIT License](LICENSE). Use it freely, modify it, and build on it.

---

<div align="center">
Built with ☕ and Google Apps Script · No servers harmed in the making of this bot
</div>
