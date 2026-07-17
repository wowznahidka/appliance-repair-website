# Appliance Repair — Demo Website

A static, no-build, no-backend demo website for an appliance repair business (potentially handling home warranty / insurance claim leads). Built with plain HTML, CSS and JavaScript so it runs anywhere, including GitHub Pages, with no server required. Installable as a PWA (Progressive Web App).

**This is a demo/template.** The company name, phone number, ZIP codes, and other business details are placeholders. Nothing in the copy claims licenses, insurance-partner status, certifications, 24/7 availability, or customer testimonials that haven't been verified — see the checklist at the bottom before publishing.

## Files

```
demo-appliance-repair/
├── index.html          Main page (all sections)
├── styles.css          All styling
├── script.js           All behavior: ZIP checker, booking form, FAQ, analytics
├── config.js           <-- EDIT THIS to customize the site for a real client
├── privacy.html         Privacy Policy template
├── terms.html            Terms of Service template
├── manifest.json        PWA manifest
├── service-worker.js    PWA offline/caching support
├── icons/                PWA icons (PNG + SVG)
├── README.md             This file
├── CLIENT_QUESTIONS.md   Discovery call script (Ukrainian)
└── ADS_PLAN.md           Google/Meta Ads plan outline (Ukrainian)
```

## Running locally

Opening `index.html` directly in a browser (double-click) works for most things, but the service worker and `fetch()`-based form submission require a real HTTP origin. Use a simple local server instead:

```bash
cd demo-appliance-repair
python3 -m http.server 8080
# then open http://localhost:8080
```

or, with Node:

```bash
npx serve .
```

## Publishing on GitHub Pages

1. Create a new GitHub repository (or a folder inside an existing one).
2. Push the contents of `demo-appliance-repair/` to the repo (e.g. to the `main` branch).
3. In the repo settings, go to **Pages** and set the source to the branch/folder containing these files (root, or `/docs` if you place them there).
4. GitHub will give you a URL like `https://<username>.github.io/<repo>/`. Update `canonical` links in `index.html`, `privacy.html`, and `terms.html`, and the `og:url` tag, once you know the final domain.

No build step, no `npm install`, nothing to compile — it's ready as-is.

## Editing `config.js`

All business-specific data lives in one file: `config.js`. Update these fields once you have real information from the client:

| Field | What to change it to |
|---|---|
| `companyName`, `shortCompanyName` | Real business name (currently "Appliance Repair Co." — a placeholder) |
| `phone`, `phoneFormatted` | Real phone number, in both E.164 (`+1...`) and display format |
| `email` | Real business email |
| `city`, `state` | Real city/state |
| `serviceAreaText` | A short, honest description of the area served |
| `serviceZipCodes` | Array of real ZIP codes served, e.g. `["55401", "55402"]`. Leave `[]` until confirmed — the ZIP checker shows a neutral "we'll confirm" message when empty instead of guessing |
| `businessHours` | Real hours |
| `googleMapsUrl`, `facebookUrl`, `instagramUrl` | Real profile links, or leave `""` to hide |
| `formEndpoint` | See "Connecting the booking form" below |
| `smsEnabled` | Set to `true` only once a real SMS consent program is in place — this toggles the SMS checkbox on the form |
| `acceptsWarrantyClaims`, `acceptsInsuranceClaims` | Whether to show the optional claim-number fields |
| `priorityAppliances` | List of appliance types shown in the booking form dropdown |
| `supportedBrands` | Array of real brands serviced, e.g. `["Whirlpool", "GE"]`. Leave `[]` until confirmed |
| `metaPixelId`, `googleAnalyticsId`, `googleAdsId` | See "Connecting analytics" below — leave blank to disable |

The rest of the site (header, footer, ZIP checker, service area section, brands section, form dropdown, structured data) pulls from these values automatically. You should not need to touch HTML/CSS/JS to update business info.

## Connecting the booking form

By default, `formEndpoint` in `config.js` is empty, so the form does **not** send data anywhere — it shows an honest "this is a demo" message and logs the would-be submission object to the browser console (open DevTools → Console to see it). Pick one of these to make it real:

**Formspree** (easiest, free tier available)
1. Create a form at [formspree.io](https://formspree.io).
2. Copy the endpoint URL (looks like `https://formspree.io/f/xxxxxxx`).
3. Paste it into `formEndpoint` in `config.js`.

**Google Apps Script (writes to a Google Sheet)**
1. Create a Google Sheet, open Extensions → Apps Script.
2. Write a `doPost(e)` function that parses `e.postData.contents` (JSON) and appends a row to the sheet.
3. Deploy as a Web App (execute as you, accessible to anyone).
4. Paste the deployment URL into `formEndpoint`.

**Telegram Bot** (instant notification to a chat)
1. Create a bot via @BotFather, get the bot token and your chat ID.
2. Set up a small relay (Apps Script, Cloudflare Worker, or similar) that receives the POST and forwards it to `https://api.telegram.org/bot<TOKEN>/sendMessage`. Do not call the Telegram API directly from client-side JS — it would expose the bot token.
3. Paste the relay URL into `telegramEndpoint` / `formEndpoint`.

**Custom API**
Point `formEndpoint` at any endpoint that accepts a JSON POST body. The payload shape is visible in `script.js` inside `initBookingForm()` (the `requestData` object).

## Connecting Google Analytics

1. Create a GA4 property, get the Measurement ID (looks like `G-XXXXXXXXXX`).
2. Paste it into `googleAnalyticsId` in `config.js`. The gtag.js script only loads if this is non-empty.

## Connecting Google Ads conversion tracking

1. Get your Conversion ID (looks like `AW-XXXXXXXXX`) from Google Ads.
2. Paste it into `googleAdsId` in `config.js`.

## Connecting Meta (Facebook) Pixel

1. Create a Pixel in Meta Events Manager, get the Pixel ID.
2. Paste it into `metaPixelId` in `config.js`. The Pixel script only loads if this is non-empty — until then, no Meta script is injected at all.

## Adding real customer reviews

Reviews are intentionally **not** faked. Find the "Customer Reviews" section in `index.html` (search for `class="reviews-placeholder"`). There's an HTML comment marking where to add real, verified review cards once the business provides them.

## Activating SMS consent

1. Set `smsEnabled: true` in `config.js`. This reveals the SMS consent checkbox on the booking form.
2. Confirm the consent language in `index.html` (search `f-sms-consent`) matches what the business's SMS provider/compliance requires — the wording included is a reasonable default, not a compliance guarantee.

## Claims that must be confirmed with the client before publishing

Do **not** publish this site with any of the following claims unless the business has explicitly confirmed them in writing:

- "Official Insurance Partner" / any insurance or warranty company partnership
- "Licensed and Insured"
- "Certified Technicians"
- "Same-Day Service"
- "24/7 Service"
- "Thousands of Happy Customers" or any customer count/statistic
- "#1 Appliance Repair Company" or similar superlative
- "Authorized Service Center"
- Any specific brand logos or insurance/warranty provider logos

The current copy avoids all of these deliberately.

## Parts that must not be published without review

- **ZIP codes** — the ZIP checker will confidently say "yes, we serve you" for any ZIP added to `serviceZipCodes`. Only add ZIP codes the business has actually confirmed it services.
- **Brands list** — same logic; only list brands the business actually repairs.
- **Structured data (schema.org)** — only injects automatically once `companyName`, `city`, and `phone` are changed from their placeholder values (see `script.js`, `applyConfigToPage()`), specifically to avoid publishing fake LocalBusiness data.
- **Privacy Policy / Terms** — both pages are templates, clearly marked as such, and should be reviewed by the business (and a legal professional if possible) before going live.

## Pre-launch checklist

- [ ] Real company name, phone, email, city/state entered in `config.js`
- [ ] Real ZIP codes confirmed and entered (or intentionally left empty)
- [ ] Real business hours entered
- [ ] Real brands list confirmed and entered (or intentionally left empty)
- [ ] `formEndpoint` connected to a real destination and tested end-to-end
- [ ] Analytics/Pixel IDs added only if the business has active ad accounts
- [ ] Any warranty/insurance claim language re-confirmed as non-promissory
- [ ] Privacy Policy and Terms reviewed (and ideally by counsel)
- [ ] Real domain set in canonical/OG tags
- [ ] Favicon/icons reviewed (currently generic tool-and-appliance icon)
- [ ] No placeholder text ("Your City", "(555) 555-0123", etc.) remains
- [ ] Real reviews added, or reviews section removed if none exist
- [ ] Tested at 375px, 768px, and 1440px widths, no horizontal scroll
- [ ] Tested the 2-step form, ZIP checker, FAQ accordion, and mobile menu
