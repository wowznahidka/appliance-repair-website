/**
 * ============================================================================
 * TELEGRAM LEAD BRIDGE — Google Apps Script Web App
 * ============================================================================
 * Receives form submissions from the website (client repair requests AND
 * technician applications) and instantly forwards them as Telegram messages
 * to every chat listed in CHAT_IDS.
 *
 * WHY THIS EXISTS: the site is static (GitHub Pages), so it needs a free
 * serverless endpoint to deliver leads. Apps Script gives us one in 5 minutes
 * at zero cost.
 *
 * ── SETUP (once, ~5 minutes) ────────────────────────────────────────────────
 * 1. Create a Telegram bot: message @BotFather → /newbot → copy the token.
 * 2. script.google.com → New project → paste this file.
 * 3. Project Settings → Script Properties → add:
 *      BOT_TOKEN = 123456:ABC-DEF...        (from BotFather)
 *      CHAT_IDS  = 8437428335               (comma-separated, see below)
 * 4. Deploy → New deployment → type "Web app" →
 *      Execute as: Me · Who has access: Anyone
 *    → copy the Web app URL.
 * 5. Put that URL into config.js → formEndpoint: "https://script.google.com/..."
 *    and push the site.
 *
 * ── ADDING PEOPLE TO THE BOT (owner + client + dispatchers) ─────────────────
 * Each person must OPEN the bot in Telegram and press START (bots cannot
 * message people first). Then find their chat_id:
 *   https://api.telegram.org/bot<BOT_TOKEN>/getUpdates
 * → look for "chat":{"id":XXXXXXX} → add that number to CHAT_IDS
 * (comma-separated), save Script Properties. No redeploy needed.
 *
 * ── TEST ────────────────────────────────────────────────────────────────────
 * Run testSend() from the editor (▶) — every chat in CHAT_IDS should get a
 * test message. If nothing arrives: the person didn't press START, or the
 * chat_id is wrong.
 * ============================================================================
 */

var PROPS = PropertiesService.getScriptProperties();

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    // Honeypot / spam guard — silently accept but do not forward.
    if (data.company_website || data.website) {
      return jsonResponse({ ok: true });
    }

    var text = data.type === "tech_application"
      ? formatTechApplication(data)
      : formatClientLead(data);

    var results = broadcast(text);

    return jsonResponse({ ok: true, delivered: results });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

/** Client repair request → message */
function formatClientLead(d) {
  var lines = [
    "🛠 NEW REPAIR REQUEST",
    "",
    "📍 ZIP: " + safe(d.zip),
    "🔧 Appliance: " + safe(d.appliance),
    "📱 Phone: " + safe(d.phone),
    "👤 Name: " + safe(d.name),
    "✉️ Email: " + safe(d.email),
    "🏠 Address: " + safe(d.address)
  ];
  if (d.brand) lines.push("🏷 Brand: " + d.brand);
  lines.push("❗️ Problem: " + safe(d.problem));
  if (d.preferredDate) lines.push("📅 Preferred date: " + d.preferredDate);
  if (d.warrantyCompany) lines.push("🛡 Warranty: " + d.warrantyCompany + (d.claimNumber ? " · Claim #" + d.claimNumber : ""));
  if (d.photoCount) lines.push("📷 Photos attached on site: " + d.photoCount);
  lines.push("☎️ Preferred contact: " + safe(d.contactMethod));
  return lines.join("\n");
}

/** Technician application → message */
function formatTechApplication(d) {
  var lines = [
    "👷 NEW TECHNICIAN APPLICATION",
    "",
    "👤 Name: " + safe(d.name),
    "📱 Phone: " + safe(d.phone),
    "✉️ Email: " + safe(d.email),
    "📍 Location: " + safe(d.cityState) + (d.zip ? " (" + d.zip + ")" : ""),
    "🔧 Experience: " + safe(d.experience),
    "🧰 Specialties: " + ((d.specialties || []).join(", ") || "—"),
    "🚐 Own tools & vehicle: " + (d.ownToolsVehicle ? "yes" : "no")
  ];
  if (d.notes) lines.push("📝 Notes: " + d.notes);
  return lines.join("\n");
}

/** Send a message to every configured chat. */
function broadcast(text) {
  var token = PROPS.getProperty("BOT_TOKEN");
  var chatIds = (PROPS.getProperty("CHAT_IDS") || "")
    .split(",")
    .map(function (s) { return s.trim(); })
    .filter(String);

  if (!token || !chatIds.length) {
    throw new Error("BOT_TOKEN or CHAT_IDS not set in Script Properties");
  }

  return chatIds.map(function (chatId) {
    var res = UrlFetchApp.fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({ chat_id: chatId, text: text }),
      muteHttpExceptions: true
    });
    return { chat: chatId, code: res.getResponseCode() };
  });
}

function safe(v) { return v ? String(v) : "—"; }

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Manual test — run from the editor. */
function testSend() {
  var results = broadcast("✅ Telegram Lead Bridge is connected. Leads from the website will arrive here.");
  Logger.log(results);
}
