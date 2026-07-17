/**
 * ============================================================================
 * SITE CONFIGURATION — Appliance Repair Demo
 * ============================================================================
 * This is the ONLY file you should need to edit to make this demo site
 * production-ready for a real client.
 *
 * IMPORTANT: Every value below marked as PLACEHOLDER / TEMPORARY must be
 * confirmed with the client before this site is published. See
 * CLIENT_QUESTIONS.md for the questions to ask, and README.md for a
 * pre-launch checklist.
 *
 * Nothing in this file (or the rest of the site) claims licenses,
 * insurance-partner status, certifications, guaranteed same-day service,
 * 24/7 availability, or customer counts/testimonials that have not been
 * verified by the business owner.
 * ============================================================================
 */

window.SITE_CONFIG = {

  // ---------------------------------------------------------------------
  // COMPANY IDENTITY (TEMPORARY — replace after client call)
  // ---------------------------------------------------------------------
  companyName: "Appliance Repair Co.",       // TEMPORARY NAME — replace with real business name
  shortCompanyName: "Appliance Repair Co.",  // Used in tight spaces (mobile header, footer)
  tagline: "Appliance Repair Service Requests",

  // ---------------------------------------------------------------------
  // CONTACT INFORMATION (PLACEHOLDER — replace with real values)
  // ---------------------------------------------------------------------
  phone: "+15555550123",            // E.164 format, used for tel: links
  phoneFormatted: "(555) 555-0123", // Human-readable display format
  email: "info@example.com",

  // ---------------------------------------------------------------------
  // LOCATION (PLACEHOLDER)
  // ---------------------------------------------------------------------
  city: "Your City",
  state: "ST",
  serviceAreaText:
    "We accept service requests in and around Your City, ST. Enter your ZIP code below to check availability.",

  // List of ZIP codes actually served. Leave EMPTY ([]) until confirmed by
  // the client — the ZIP checker will show a neutral "we'll confirm"
  // message instead of guessing coverage.
  serviceZipCodes: [
    // "55401", "55402", "55403"
  ],

  // ---------------------------------------------------------------------
  // BUSINESS HOURS (PLACEHOLDER)
  // ---------------------------------------------------------------------
  businessHours: [
    { days: "Monday – Friday", hours: "9:00 AM – 6:00 PM" },
    { days: "Saturday", hours: "9:00 AM – 2:00 PM" },
    { days: "Sunday", hours: "Closed" },
  ],

  // ---------------------------------------------------------------------
  // ONLINE PRESENCE (PLACEHOLDER — leave empty string "" to hide a link)
  // ---------------------------------------------------------------------
  googleMapsUrl: "",
  facebookUrl: "",
  instagramUrl: "",

  // ---------------------------------------------------------------------
  // FORM SUBMISSION
  // ---------------------------------------------------------------------
  // Leave EMPTY until a real endpoint is connected (Formspree, Google Apps
  // Script Web App, Telegram bot bridge, or a custom API). See README.md
  // "Connecting the booking form" for setup steps for each option.
  formEndpoint: "",
  telegramEndpoint: "",

  // ---------------------------------------------------------------------
  // SMS CONSENT
  // ---------------------------------------------------------------------
  // Only set to true once the business has a real SMS program / consent
  // language reviewed. When false, the SMS checkbox is hidden entirely.
  smsEnabled: false,

  // ---------------------------------------------------------------------
  // WARRANTY / INSURANCE CLAIM HANDLING
  // ---------------------------------------------------------------------
  // These flags only control whether the claim-related FORM FIELDS are
  // shown. They do NOT mean the business is an authorized partner of any
  // warranty or insurance company. See the Warranty & Insurance section
  // copy in index.html for the exact, careful language used.
  acceptsWarrantyClaims: true,
  acceptsInsuranceClaims: true,

  // ---------------------------------------------------------------------
  // APPLIANCES & BRANDS
  // ---------------------------------------------------------------------
  priorityAppliances: [
    "Refrigerator",
    "Washer",
    "Dryer",
    "Dishwasher",
    "Oven / Range",
    "Freezer",
    "Other",
  ],

  // Leave EMPTY until the client confirms which brands they actually
  // service. When empty, the Brands section shows a neutral placeholder
  // message instead of a list.
  supportedBrands: [
    // "Whirlpool", "GE", "Samsung", "LG", "Maytag", "KitchenAid"
  ],

  // ---------------------------------------------------------------------
  // ANALYTICS & ADS (leave blank to disable — no script loads if empty)
  // ---------------------------------------------------------------------
  metaPixelId: "",       // e.g. "123456789012345" — Meta Pixel ID
  googleAnalyticsId: "", // e.g. "G-XXXXXXXXXX" — GA4 Measurement ID
  googleAdsId: "",       // e.g. "AW-XXXXXXXXX" — Google Ads Conversion ID

};
