/**
 * Appliance Repair Demo — main script
 * Handles: config-driven content, mobile menu, ZIP checker, 2-step booking
 * form with validation, FAQ accordion, analytics event stubs, PWA service
 * worker registration.
 *
 * No external dependencies. No frameworks.
 */
(function () {
  "use strict";

  var CFG = window.SITE_CONFIG || {};
  var PLACEHOLDER_PHONE = "+15555550123";
  var PLACEHOLDER_CITY = "Your City";

  /* ------------------------------------------------------------------
   * ANALYTICS — dataLayer (Google) + fbq (Meta), only if IDs configured
   * ------------------------------------------------------------------ */
  window.dataLayer = window.dataLayer || [];

  function gaEvent(eventName, params) {
    window.dataLayer.push(Object.assign({ event: eventName }, params || {}));
  }

  function metaEvent(eventName, params) {
    if (typeof window.fbq === "function") {
      window.fbq("trackCustom", eventName, params || {});
    }
  }

  // Fields that must NEVER be sent to ad platforms.
  var PII_FIELDS = ["name", "phone", "email", "address", "claimNumber", "problem"];

  function stripPII(obj) {
    var safe = {};
    Object.keys(obj || {}).forEach(function (key) {
      if (PII_FIELDS.indexOf(key) === -1) safe[key] = obj[key];
    });
    return safe;
  }

  function track(eventName, params) {
    var safe = stripPII(params);
    gaEvent(eventName, safe);
    metaEvent(eventName, safe);
  }

  function loadAnalyticsScripts() {
    // Google Analytics (GA4) — only loads if a real Measurement ID is set.
    if (CFG.googleAnalyticsId) {
      var gaScript = document.createElement("script");
      gaScript.async = true;
      gaScript.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(CFG.googleAnalyticsId);
      document.head.appendChild(gaScript);
      window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", CFG.googleAnalyticsId);
    }

    // Google Ads conversion linking — only if configured.
    if (CFG.googleAdsId && window.gtag) {
      window.gtag("config", CFG.googleAdsId);
    }

    // Meta Pixel — only loads if a real Pixel ID is set.
    if (CFG.metaPixelId) {
      /* eslint-disable */
      (function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n; n.loaded = true; n.version = "2.0";
        n.queue = []; t = b.createElement(e); t.async = true;
        t.src = v; s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      window.fbq("init", CFG.metaPixelId);
      window.fbq("track", "PageView");
      /* eslint-enable */
    }
  }

  /* ------------------------------------------------------------------
   * CONFIG-DRIVEN CONTENT
   * ------------------------------------------------------------------ */
  function applyConfigToPage() {
    var telHref = "tel:" + (CFG.phone || "");
    document.querySelectorAll(".call-link").forEach(function (el) {
      el.setAttribute("href", telHref);
    });
    document.querySelectorAll("#header-mobile-call, .mobile-call-link").forEach(function (el) {
      el.setAttribute("href", telHref);
    });

    document.querySelectorAll("#header-company-name, #footer-company-name").forEach(function (el) {
      el.textContent = CFG.shortCompanyName || CFG.companyName || "";
    });
    if (document.body.getAttribute("data-page") !== "careers") {
      document.title = (CFG.companyName || "Appliance Repair") + " | Appliance Repair Service Requests";
    }

    var footerPhone = document.getElementById("footer-phone");
    if (footerPhone) footerPhone.textContent = CFG.phoneFormatted || "";
    var footerEmail = document.getElementById("footer-email");
    if (footerEmail) footerEmail.textContent = CFG.email || "";

    var footerArea = document.getElementById("footer-area");
    if (footerArea) footerArea.textContent = (CFG.city || "") + (CFG.state ? ", " + CFG.state : "");

    var footerHours = document.getElementById("footer-hours");
    if (footerHours && Array.isArray(CFG.businessHours)) {
      footerHours.innerHTML = "";
      CFG.businessHours.forEach(function (row) {
        var p = document.createElement("p");
        p.textContent = row.days + ": " + row.hours;
        footerHours.appendChild(p);
      });
    }

    var areaCityState = document.getElementById("area-city-state");
    if (areaCityState) areaCityState.textContent = (CFG.city || "Your City") + ", " + (CFG.state || "ST");

    var areaText = document.getElementById("area-text");
    if (areaText) areaText.textContent = CFG.serviceAreaText || "";

    var areaZipList = document.getElementById("area-zip-list");
    if (areaZipList) {
      if (CFG.serviceZipCodes && CFG.serviceZipCodes.length) {
        areaZipList.innerHTML = "";
        CFG.serviceZipCodes.forEach(function (zip) {
          var span = document.createElement("span");
          span.className = "zip-chip";
          span.textContent = zip;
          areaZipList.appendChild(span);
        });
      } else {
        areaZipList.innerHTML = '<p class="fine-print">Submit your ZIP code and we’ll confirm service availability.</p>';
      }
    }

    // Brands
    var brandsContent = document.getElementById("brands-content");
    if (brandsContent) {
      if (CFG.supportedBrands && CFG.supportedBrands.length) {
        var ul = document.createElement("ul");
        ul.className = "brand-chip-list";
        CFG.supportedBrands.forEach(function (brand) {
          var li = document.createElement("li");
          li.className = "brand-chip";
          li.textContent = brand;
          ul.appendChild(li);
        });
        brandsContent.appendChild(ul);
      } else {
        brandsContent.innerHTML = '<p class="brands-empty">Brand availability will be confirmed when your request is reviewed.</p>';
      }
    }

    // FAQ answer for "What areas do you serve?"
    var faqArea = document.getElementById("faq-area-answer");
    if (faqArea && CFG.serviceAreaText) {
      faqArea.textContent = CFG.serviceAreaText;
    }

    // Appliance select options
    var applianceSelect = document.getElementById("f-appliance");
    if (applianceSelect && Array.isArray(CFG.priorityAppliances)) {
      CFG.priorityAppliances.forEach(function (item) {
        var opt = document.createElement("option");
        opt.value = item;
        opt.textContent = item;
        applianceSelect.appendChild(opt);
      });
    }

    // SMS consent field visibility
    var smsField = document.getElementById("sms-consent-field");
    if (smsField) smsField.hidden = !CFG.smsEnabled;

    // Structured data — only when core company info is actually filled in.
    var hasRealData =
      CFG.companyName && CFG.companyName !== "Appliance Repair Co." &&
      CFG.city && CFG.city !== PLACEHOLDER_CITY &&
      CFG.phone && CFG.phone !== PLACEHOLDER_PHONE;

    if (hasRealData) {
      var schema = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: CFG.companyName,
        telephone: CFG.phone,
        email: CFG.email,
        address: {
          "@type": "PostalAddress",
          addressLocality: CFG.city,
          addressRegion: CFG.state
        }
      };
      var script = document.createElement("script");
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    }
  }

  /* ------------------------------------------------------------------
   * MOBILE MENU
   * ------------------------------------------------------------------ */
  function initMobileMenu() {
    var toggle = document.getElementById("menu-toggle");
    var nav = document.getElementById("mobile-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      nav.hidden = isOpen;
      toggle.setAttribute("aria-label", isOpen ? "Open menu" : "Close menu");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
        nav.hidden = true;
      });
    });
  }

  /* ------------------------------------------------------------------
   * CALL / SCHEDULE TRACKING
   * ------------------------------------------------------------------ */
  function initCtaTracking() {
    document.querySelectorAll("[data-track]").forEach(function (el) {
      el.addEventListener("click", function () {
        track(el.getAttribute("data-track"), {});
      });
    });
  }

  /* ------------------------------------------------------------------
   * ZIP CODE CHECKER
   * ------------------------------------------------------------------ */
  var lastCheckedZip = "";

  function initZipChecker() {
    var form = document.getElementById("zip-form");
    var input = document.getElementById("zip-input");
    var result = document.getElementById("zip-result");
    if (!form || !input || !result) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var zip = (input.value || "").trim();

      if (!/^\d{5}$/.test(zip)) {
        result.className = "zip-result is-negative";
        result.textContent = "Please enter a valid 5-digit ZIP code.";
        return;
      }

      lastCheckedZip = zip;
      track("ZipCheck", { zip_prefix: zip.slice(0, 3) });

      var zipList = CFG.serviceZipCodes || [];

      if (zipList.length === 0) {
        result.className = "zip-result is-neutral";
        result.textContent = "Submit your ZIP code and we’ll confirm service availability.";
        prefillBookingZip(zip);
        return;
      }

      if (zipList.indexOf(zip) !== -1) {
        result.className = "zip-result is-positive";
        result.innerHTML = "";
        var msg = document.createElement("span");
        msg.textContent = "Good news — we currently accept service requests in ZIP code " + zip + ". ";
        var bookBtn = document.createElement("a");
        bookBtn.href = "#booking";
        bookBtn.className = "btn btn-accent";
        bookBtn.style.marginTop = "0.75rem";
        bookBtn.style.display = "inline-flex";
        bookBtn.textContent = "Book Service";
        result.appendChild(msg);
        result.appendChild(document.createElement("br"));
        result.appendChild(bookBtn);
        prefillBookingZip(zip);
      } else {
        result.className = "zip-result is-negative";
        result.textContent = "We don’t currently show ZIP code " + zip + " as covered. Submit a request and we’ll confirm.";
        prefillBookingZip(zip);
      }
    });
  }

  function prefillBookingZip(zip) {
    var bookingZip = document.getElementById("f-zip");
    if (bookingZip) bookingZip.value = zip;
  }

  /* ------------------------------------------------------------------
   * BOOKING FORM (2-step)
   * ------------------------------------------------------------------ */
  var MAX_PHOTOS = 3;
  var MAX_PHOTO_MB = 5;
  var ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
  var formStartTracked = false;
  var isSubmitting = false;

  function initBookingForm() {
    var form = document.getElementById("booking-form");
    if (!form) return;

    var step1 = document.getElementById("form-step-1");
    var step2 = document.getElementById("form-step-2");
    var continueBtn = document.getElementById("step1-continue");
    var backBtn = document.getElementById("step2-back");
    var statusEl = document.getElementById("form-status");
    var progressSteps = form.querySelectorAll(".progress-step");

    function trackFormStart() {
      if (!formStartTracked) {
        formStartTracked = true;
        track("FormStart", {});
      }
    }
    form.addEventListener("focusin", trackFormStart, { once: true });

    function showStatus(message, type) {
      statusEl.textContent = message;
      statusEl.className = "form-status is-visible is-" + type;
    }
    function clearStatus() {
      statusEl.textContent = "";
      statusEl.className = "form-status";
    }

    function setError(fieldId, message) {
      var el = document.getElementById("err-" + fieldId);
      if (el) el.textContent = message || "";
    }

    function validateStep1() {
      var valid = true;
      var zip = document.getElementById("f-zip").value.trim();
      var appliance = document.getElementById("f-appliance").value;
      var phone = document.getElementById("f-phone").value.trim();

      setError("zip", ""); setError("appliance", ""); setError("phone", "");

      if (!/^\d{5}$/.test(zip)) {
        setError("zip", "Enter a valid 5-digit ZIP code.");
        valid = false;
      }
      if (!appliance) {
        setError("appliance", "Please select an appliance type.");
        valid = false;
      }
      if (!/^[\d\s()+.-]{7,20}$/.test(phone)) {
        setError("phone", "Enter a valid phone number.");
        valid = false;
      }
      return valid;
    }

    function validatePhotos() {
      var input = document.getElementById("f-photo");
      var err = document.getElementById("err-photo");
      err.textContent = "";
      if (!input.files || input.files.length === 0) return true;

      if (input.files.length > MAX_PHOTOS) {
        err.textContent = "Please upload a maximum of " + MAX_PHOTOS + " photos.";
        return false;
      }
      for (var i = 0; i < input.files.length; i++) {
        var file = input.files[i];
        if (ALLOWED_TYPES.indexOf(file.type) === -1) {
          err.textContent = "Only JPG, PNG or WEBP images are allowed.";
          return false;
        }
        if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
          err.textContent = "Each photo must be " + MAX_PHOTO_MB + "MB or smaller.";
          return false;
        }
      }
      return true;
    }

    function validateStep2() {
      var valid = true;
      var name = document.getElementById("f-name").value.trim();
      var email = document.getElementById("f-email").value.trim();
      var address = document.getElementById("f-address").value.trim();
      var problem = document.getElementById("f-problem").value.trim();
      var privacyConsent = document.getElementById("f-privacy-consent").checked;

      setError("name", ""); setError("email", ""); setError("address", "");
      setError("problem", ""); setError("privacy", "");

      if (name.length < 2) { setError("name", "Please enter your full name."); valid = false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("email", "Enter a valid email address."); valid = false; }
      if (address.length < 5) { setError("address", "Please enter your service address."); valid = false; }
      if (problem.length < 5) { setError("problem", "Please describe the problem."); valid = false; }
      if (!privacyConsent) { setError("privacy", "You must agree to the Privacy Policy."); valid = false; }
      if (!validatePhotos()) valid = false;

      return valid;
    }

    continueBtn.addEventListener("click", function () {
      if (!validateStep1()) return;
      step1.hidden = true;
      step2.hidden = false;
      progressSteps[0].classList.remove("active");
      progressSteps[1].classList.add("active");
      var firstField = document.getElementById("f-name");
      if (firstField) firstField.focus();
    });

    backBtn.addEventListener("click", function () {
      step2.hidden = true;
      step1.hidden = false;
      progressSteps[1].classList.remove("active");
      progressSteps[0].classList.add("active");
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearStatus();

      if (isSubmitting) return;
      if (!validateStep2()) return;

      // Honeypot check — if filled, silently treat as spam.
      var honeypot = document.getElementById("company-website").value;
      if (honeypot) {
        showStatus("Thank you. Your request has been received.", "success");
        form.reset();
        return;
      }

      isSubmitting = true;
      var submitBtn = document.getElementById("submit-request");
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting…";
      showStatus("Submitting your request…", "info");

      var requestData = {
        zip: document.getElementById("f-zip").value.trim(),
        appliance: document.getElementById("f-appliance").value,
        phone: document.getElementById("f-phone").value.trim(),
        name: document.getElementById("f-name").value.trim(),
        email: document.getElementById("f-email").value.trim(),
        address: document.getElementById("f-address").value.trim(),
        brand: document.getElementById("f-brand").value.trim(),
        problem: document.getElementById("f-problem").value.trim(),
        preferredDate: document.getElementById("f-date").value,
        warrantyCompany: document.getElementById("f-warranty-company").value.trim(),
        claimNumber: document.getElementById("f-claim-number").value.trim(),
        contactMethod: (form.querySelector('input[name="contactMethod"]:checked') || {}).value || "",
        smsConsent: CFG.smsEnabled ? document.getElementById("f-sms-consent").checked : false,
        photoCount: (document.getElementById("f-photo").files || []).length,
        submittedAt: new Date().toISOString()
      };

      function finishSuccess() {
        track("Lead", { appliance: requestData.appliance, zip_prefix: requestData.zip.slice(0, 3) });
        track("FormSubmit", { appliance: requestData.appliance });
        showStatus("Thank you! Your service request has been received. We’ll contact you using your preferred contact method to confirm details.", "success");
        form.reset();
        step2.hidden = true;
        step1.hidden = false;
        progressSteps[1].classList.remove("active");
        progressSteps[0].classList.add("active");
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Request";
        isSubmitting = false;
      }

      function finishError(message) {
        showStatus(message || "Something went wrong. Please try again or call us directly.", "error");
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Request";
        isSubmitting = false;
      }

      if (!CFG.formEndpoint) {
        // No real endpoint configured — this is a demo. Do not send data
        // anywhere. Log the would-be payload to the console instead.
        // eslint-disable-next-line no-console
        console.log("[DEMO FORM SUBMISSION] No formEndpoint configured. Request payload:", requestData);
        setTimeout(function () {
          showStatus("This is a demonstration form. No data was sent anywhere. In production this request would be delivered to " + (CFG.companyName || "the business") + ". See README.md to connect a real endpoint.", "info");
          track("Lead", { appliance: requestData.appliance, zip_prefix: requestData.zip.slice(0, 3) });
          track("FormSubmit", { appliance: requestData.appliance });
          form.reset();
          step2.hidden = true;
          step1.hidden = false;
          progressSteps[1].classList.remove("active");
          progressSteps[0].classList.add("active");
          submitBtn.disabled = false;
          submitBtn.textContent = "Submit Request";
          isSubmitting = false;
        }, 700);
        return;
      }

      // text/plain avoids a CORS preflight, which Apps Script endpoints
      // cannot answer; the bridge parses the JSON body regardless.
      fetch(CFG.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(requestData)
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Request failed");
          finishSuccess();
        })
        .catch(function () {
          finishError("We couldn’t submit your request. Please try again or call us directly.");
        });
    });
  }

  /* ------------------------------------------------------------------
   * FAQ ACCORDION
   * ------------------------------------------------------------------ */
  function initAccordion() {
    document.querySelectorAll(".accordion-trigger").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var expanded = btn.getAttribute("aria-expanded") === "true";
        var panel = document.getElementById(btn.getAttribute("aria-controls"));
        btn.setAttribute("aria-expanded", String(!expanded));
        if (panel) panel.hidden = expanded;
      });
    });
  }

  /* ------------------------------------------------------------------
   * SERVICE WORKER REGISTRATION (PWA)
   * ------------------------------------------------------------------ */
  function initServiceWorker() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("service-worker.js").catch(function () {
          /* ignore registration failures (e.g. running from file://) */
        });
      });
    }
  }

  /* ------------------------------------------------------------------
   * HERO APP DEMO — a phone that books a repair by itself, on loop
   * ------------------------------------------------------------------ */
  function initHeroDemo() {
    var screens = document.querySelectorAll(".demo-screen");
    if (!screens.length) return;

    var zipText = document.getElementById("demo-zip-text");
    var zipOk = document.getElementById("demo-zip-ok");
    var toast = document.getElementById("demo-toast");
    var washerTile = document.querySelector('.demo-app[data-app="2"]');
    var DEMO_ZIP = "60614";
    var timers = [];

    function at(ms, fn) { timers.push(setTimeout(fn, ms)); }

    function show(step) {
      screens.forEach(function (s) {
        s.classList.toggle("active", s.getAttribute("data-demo") === String(step));
      });
    }

    function runLoop() {
      timers.forEach(clearTimeout);
      timers = [];

      // Reset
      show(1);
      if (zipText) zipText.textContent = "";
      if (zipOk) zipOk.classList.remove("show");
      if (toast) toast.classList.remove("show");
      if (washerTile) washerTile.classList.remove("selected");

      // Screen 1 — type the ZIP
      for (var i = 0; i < DEMO_ZIP.length; i++) {
        (function (idx) {
          at(600 + idx * 260, function () {
            if (zipText) zipText.textContent = DEMO_ZIP.slice(0, idx + 1);
          });
        })(i);
      }
      at(2300, function () { if (zipOk) zipOk.classList.add("show"); });

      // Screen 2 — pick an appliance
      at(4200, function () { show(2); });
      at(5100, function () { if (washerTile) washerTile.classList.add("selected"); });

      // Screen 3 — details fill in (CSS transition delays do the work)
      at(6600, function () { show(3); });

      // Screen 4 — success + notification toast
      at(10200, function () { show(4); });
      at(11200, function () { if (toast) toast.classList.add("show"); });
      at(13800, function () { if (toast) toast.classList.remove("show"); });

      // Loop
      at(14600, runLoop);
    }

    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      show(1);
      if (zipText) zipText.textContent = DEMO_ZIP;
      if (zipOk) zipOk.classList.add("show");
      return;
    }
    runLoop();
  }

  /* ------------------------------------------------------------------
   * PWA INSTALL BANNER — custom, pretty, dismissible
   * ------------------------------------------------------------------ */
  var deferredInstallPrompt = null;

  function initInstallBanner() {
    var banner = document.getElementById("install-banner");
    if (!banner) return;
    var installBtn = document.getElementById("install-banner-btn");
    var dismissBtn = document.getElementById("install-banner-dismiss");
    var subText = document.getElementById("install-banner-sub");

    var DISMISS_KEY = "pwa-banner-dismissed";
    var isStandalone =
      (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
      window.navigator.standalone === true;

    if (isStandalone) return;
    try { if (localStorage.getItem(DISMISS_KEY)) return; } catch (e) { /* private mode */ }

    function showBanner() {
      banner.hidden = false;
      track("InstallBannerShown", {});
    }

    function hideBanner(remember) {
      banner.hidden = true;
      if (remember) {
        try { localStorage.setItem(DISMISS_KEY, "1"); } catch (e) { /* ignore */ }
      }
    }

    // Chromium browsers: real install prompt
    window.addEventListener("beforeinstallprompt", function (e) {
      e.preventDefault();
      deferredInstallPrompt = e;
      setTimeout(showBanner, 4000);
    });

    // iOS Safari: no install prompt API — show gentle instructions instead
    var isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    var isSafari = /safari/i.test(navigator.userAgent) && !/crios|fxios|chrome/i.test(navigator.userAgent);
    if (isIos && isSafari) {
      if (subText) subText.textContent = "Tap Share, then “Add to Home Screen” — book repairs in one tap.";
      if (installBtn) installBtn.hidden = true;
      setTimeout(showBanner, 6000);
    }

    if (installBtn) {
      installBtn.addEventListener("click", function () {
        if (!deferredInstallPrompt) { hideBanner(true); return; }
        deferredInstallPrompt.prompt();
        deferredInstallPrompt.userChoice.then(function (choice) {
          track("InstallPromptResult", { outcome: choice.outcome });
          deferredInstallPrompt = null;
          hideBanner(choice.outcome === "accepted");
        });
      });
    }
    if (dismissBtn) {
      dismissBtn.addEventListener("click", function () { hideBanner(true); });
    }
  }

  /* ------------------------------------------------------------------
   * SCROLL REVEAL — subtle rise-in for cards
   * ------------------------------------------------------------------ */
  function initReveal() {
    if (!("IntersectionObserver" in window)) return;
    var targets = document.querySelectorAll(
      ".service-card, .why-card, .step, .perk-card, .problem-item"
    );
    if (!targets.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    targets.forEach(function (el, idx) {
      el.classList.add("reveal");
      el.style.transitionDelay = (idx % 4) * 0.07 + "s";
      observer.observe(el);
    });
  }

  /* ------------------------------------------------------------------
   * CAREERS FORM (careers.html) — technician application, demo mode
   * ------------------------------------------------------------------ */
  function initCareersForm() {
    var form = document.getElementById("careers-form");
    if (!form) return;
    var statusEl = document.getElementById("careers-status");

    function showStatus(message, type) {
      statusEl.textContent = message;
      statusEl.className = "form-status is-visible is-" + type;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var honeypot = document.getElementById("c-website");
      if (honeypot && honeypot.value) {
        showStatus("Thank you. Your application has been received.", "success");
        form.reset();
        return;
      }

      var name = document.getElementById("c-name").value.trim();
      var phone = document.getElementById("c-phone").value.trim();
      var cityState = document.getElementById("c-city").value.trim();
      var experience = document.getElementById("c-experience").value;
      var consent = document.getElementById("c-privacy").checked;

      if (name.length < 2 || !/^[\d\s()+.-]{7,20}$/.test(phone) || cityState.length < 2 || !experience || !consent) {
        showStatus("Please fill in your name, a valid phone number, city, experience level and accept the Privacy Policy.", "error");
        return;
      }

      var specialties = [];
      form.querySelectorAll('input[name="specialty"]:checked').forEach(function (cb) {
        specialties.push(cb.value);
      });

      var payload = {
        name: name,
        phone: phone,
        email: document.getElementById("c-email").value.trim(),
        cityState: cityState,
        zip: document.getElementById("c-zip").value.trim(),
        experience: experience,
        specialties: specialties,
        ownToolsVehicle: document.getElementById("c-tools").checked,
        notes: document.getElementById("c-notes").value.trim(),
        submittedAt: new Date().toISOString()
      };

      track("TechApplication", { experience: experience, specialtyCount: specialties.length });

      if (!CFG.formEndpoint) {
        // eslint-disable-next-line no-console
        console.log("[DEMO CAREERS SUBMISSION] No formEndpoint configured. Payload:", payload);
        showStatus("This is a demonstration form. No data was sent anywhere. In production this application would be delivered to " + (CFG.companyName || "the business") + ".", "info");
        form.reset();
        return;
      }

      fetch(CFG.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(Object.assign({ type: "tech_application" }, payload))
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Request failed");
          showStatus("Thank you! Your application has been received. We'll be in touch soon.", "success");
          form.reset();
        })
        .catch(function () {
          showStatus("We couldn't submit your application. Please try again or call us directly.", "error");
        });
    });
  }

  /* ------------------------------------------------------------------
   * INIT
   * ------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    applyConfigToPage();
    initMobileMenu();
    initCtaTracking();
    initZipChecker();
    initBookingForm();
    initAccordion();
    initHeroDemo();
    initInstallBanner();
    initReveal();
    initCareersForm();
    loadAnalyticsScripts();
    initServiceWorker();
    track("ViewContent", { page: document.body.getAttribute("data-page") || "home" });
  });
})();
