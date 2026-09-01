(() => {
  const measurementId = "G-BJ22G5X75Q";
  const consentKey = "kaloriAtlasAnalyticsConsent";

  function loadAnalytics() {
    if (window.googleAnalyticsLoaded) return;

    window.googleAnalyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];

    window.gtag = function () {
      window.dataLayer.push(arguments);
    };

    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      anonymize_ip: true
    });

    const script = document.createElement("script");
    script.async = true;
    script.src =
      "https://www.googletagmanager.com/gtag/js?id=" + measurementId;

    document.head.appendChild(script);
  }

  function saveChoice(choice) {
    localStorage.setItem(consentKey, choice);

    const banner = document.getElementById("cookie-consent-banner");

    if (banner) {
      banner.remove();
    }

    if (choice === "accepted") {
      loadAnalytics();
    }
  }

  function showConsentBanner() {
    const banner = document.createElement("div");
    banner.id = "cookie-consent-banner";

    banner.innerHTML = `
      <div class="cookie-consent-content">
        <p>
          Ziyaretçi trafiğini ölçmek ve siteyi geliştirmek için
          Google Analytics kullanmak istiyoruz.
          <a href="/gizlilik.html">Gizlilik Politikası</a>
        </p>

        <div class="cookie-consent-buttons">
          <button id="cookie-reject" type="button">
            Reddet
          </button>

          <button id="cookie-accept" type="button">
            Kabul Et
          </button>
        </div>
      </div>
    `;

    const style = document.createElement("style");

    style.textContent = `
      #cookie-consent-banner {
        position: fixed;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 9999;
        padding: 16px;
        background: #ffffff;
        border-top: 1px solid #d8e0ec;
        box-shadow: 0 -8px 25px rgba(15, 35, 70, 0.12);
      }

      .cookie-consent-content {
        width: min(1100px, 100%);
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
      }

      .cookie-consent-content p {
        margin: 0;
        color: #28364b;
        line-height: 1.6;
      }

      .cookie-consent-content a {
        color: #24539a;
        font-weight: 600;
      }

      .cookie-consent-buttons {
        display: flex;
        gap: 10px;
        flex-shrink: 0;
      }

      .cookie-consent-buttons button {
        padding: 10px 18px;
        border: 1px solid #294f8f;
        border-radius: 7px;
        cursor: pointer;
        font-size: 15px;
        font-weight: 600;
      }

      #cookie-reject {
        background: white;
        color: #294f8f;
      }

      #cookie-accept {
        background: #294f8f;
        color: white;
      }

      @media (max-width: 700px) {
        .cookie-consent-content {
          align-items: stretch;
          flex-direction: column;
        }

        .cookie-consent-buttons button {
          flex: 1;
        }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(banner);

    document
      .getElementById("cookie-reject")
      .addEventListener("click", () => saveChoice("rejected"));

    document
      .getElementById("cookie-accept")
      .addEventListener("click", () => saveChoice("accepted"));
  }

  function initialize() {
    const savedChoice = localStorage.getItem(consentKey);

    if (savedChoice === "accepted") {
      loadAnalytics();
      return;
    }

    if (savedChoice !== "rejected") {
      showConsentBanner();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})();
