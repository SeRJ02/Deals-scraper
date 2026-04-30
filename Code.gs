 * PARATROOPERZ - Deal Scraper & Telegram Broadcaster
 * ---------------------------------------------------------
 * Scrapes deals from DesiDime, converts links via EarnKaro,
 * and broadcasts them to a Telegram channel.
 *
 * Platform : Google Apps Script (cloud-based, no server needed)
 * Trigger  : Time-driven (recommended: every 15–30 minutes)
 * Author   : Your Name / @YourHandle
 * Repo     : https://github.com/yourusername/Deals-scraper
 */


// ============================================================
//  CONFIGURATION — Replace these before deploying
// ============================================================

const TELEGRAM_TOKEN  = 'YOUR_TELEGRAM_BOT_TOKEN';   // BotFather token
const CHAT_ID         = 'YOUR_CHAT_ID';               // Channel / group chat ID
const EARNKARO_TOKEN  = 'YOUR_EARNKARO_TOKEN';        // EarnKaro affiliate bearer token


// ============================================================
//  MAIN ENTRY POINT
// ============================================================

/**
 * Scrapes the DesiDime "discussed" feed change for yourself, converts deal links to
 * affiliate links via EarnKaro, and sends new deals to Telegram.
 * Attach this function to a time-driven trigger in Apps Script.
 */
function scrapeDesiDimeProduction() {
  const SOURCE_URL = 'https://www.desidime.com/discussed';
  const sheet      = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  try {
    // --- Fetch page HTML ---
    const response = UrlFetchApp.fetch(SOURCE_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0' },
      muteHttpExceptions: true
    });
    const html = response.getContentText();

    // --- Load existing tracked links to avoid duplicates ---
    const lastRow      = sheet.getLastRow();
    const existingLinks = lastRow > 1
      ? sheet.getRange('D1:D' + lastRow).getValues().flat()
      : [];

    // --- Locate deals section ---
    const startIdx  = html.indexOf('class="deals-list"') !== -1
      ? html.indexOf('class="deals-list"')
      : html.indexOf('<article');
    const feedHtml  = html.substring(startIdx);
    const articles  = feedHtml.split('</article>');

    const newDeals  = [];
    const timestamp = new Date().toLocaleString();

    for (let i = 0; i < articles.length; i++) {
      const content = articles[i];
      if (!content.includes('data-permalink')) continue;

      // --- Extract raw visit link ---
      const visitLinkMatch = content.match(/href="(https:\/\/visit\.desidime\.com\/visit\/[^"]*)"/);
      const rawLink        = visitLinkMatch ? visitLinkMatch[1] : 'N/A';
      if (rawLink === 'N/A' || existingLinks.indexOf(rawLink) !== -1) continue;

      // --- Extract product title (multiple fallbacks) ---
      let productTitle = 'Product Title Unavailable';
      const gtmLabel   = content.match(/data-gtm-label="([^"]*)"/);
      const ariaLabel  = content.match(/aria-label="New Deal buy now button ([^"]*)"/);
      const permalink  = content.match(/data-permalink="\/deals\/([^"]*)"/);

      if (gtmLabel && gtmLabel[1])        productTitle = gtmLabel[1];
      else if (ariaLabel && ariaLabel[1]) productTitle = ariaLabel[1];
      else if (permalink)                 productTitle = permalink[1].replace(/-/g, ' ').toUpperCase();

      // --- Extract store and price ---
      const store      = (content.match(/data-gtm-store="([^"]*)"/) || [0, 'Retailer'])[1];
      const priceMatch = content.match(/₹\s?([\d,]+)/);
      const price      = priceMatch ? '₹' + priceMatch[1] : 'N/A';

      // --- Convert to EarnKaro affiliate link (with fallback) ---
      const affiliateLink = convertToEarnKaro(rawLink);

      // --- Build and send Telegram message ---
      const message =
        `🛍 *New Deal Alert!* 🛍\n\n` +
        `🏷 *Product:* ${productTitle}\n` +
        `🏪 *Store:* ${store.toUpperCase()}\n` +
        `💰 *Deal Price:* ${price}\n\n` +
        `🔗 ${affiliateLink}`;

      sendTelegramMessage(message);

      // --- Queue for sheet logging ---
      newDeals.push([timestamp, productTitle, store, rawLink, price]);
    }

    // --- Write new deals to sheet ---
    if (newDeals.length > 0) {
      sheet.insertRowsAfter(1, newDeals.length);
      sheet.getRange(2, 1, newDeals.length, 5).setValues(newDeals);
    }

    // --- Trim sheet to last 1000 rows to prevent bloat ---
    if (sheet.getLastRow() > 1000) {
      sheet.deleteRows(1001, sheet.getLastRow() - 1000);
    }

  } catch (e) {
    Logger.log('Main Script Error: ' + e.toString());
  }
}


// ============================================================
//  EARNKARO AFFILIATE LINK CONVERTER
// ============================================================

/**
 * Sends a raw DesiDime redirect URL to the EarnKaro API and returns
 * an affiliate link. Falls back to the original URL on any error.
 *
 * @param  {string} rawUrl - Original visit.desidime.com redirect URL
 * @return {string}         Affiliate link or original URL as fallback
 */
function convertToEarnKaro(rawUrl) {
  const API_ENDPOINT = 'https://ekaro-api.affiliaters.in/api/converter/public';

  const options = {
    method        : 'post',
    contentType   : 'application/json',
    headers       : { Authorization: 'Bearer ' + EARNKARO_TOKEN },
    payload       : JSON.stringify({ deal: rawUrl, convert_option: 'convert_only' }),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(API_ENDPOINT, options);
    const result   = JSON.parse(response.getContentText());

    // Validate response: must have data and must NOT be an error/verification page
    if (result && result.data && !result.data.toLowerCase().includes('verify')) {
      return result.data;
    }
    return rawUrl; // Graceful fallback to raw DesiDime redirect link

  } catch (e) {
    Logger.log('EarnKaro Conversion Error: ' + e.toString());
    return rawUrl;
  }
}


// ============================================================
//  TELEGRAM MESSENGER
// ============================================================

/**
 * Sends a formatted Markdown message to the configured Telegram chat.
 *
 * @param {string} text - Message body (supports Telegram Markdown v1)
 */
function sendTelegramMessage(text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

  UrlFetchApp.fetch(url, {
    method     : 'post',
    contentType: 'application/json',
    payload    : JSON.stringify({
      chat_id                : CHAT_ID,
      text                   : text,
      parse_mode             : 'Markdown',
      disable_web_page_preview: false
    })
  });
}
