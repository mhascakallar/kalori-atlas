const foods = require("../foods.json");

function slugify(text) {
  return text
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getBaseWeight(portion) {
  const match = String(portion).match(
    /(\d+(?:[.,]\d+)?)\s*g\b/i
  );

  if (!match) {
    return null;
  }

  return Number(match[1].replace(",", "."));
}

module.exports = function handler(request, response) {
  const requestedSlug = Array.isArray(request.query.slug)
    ? request.query.slug[0]
    : request.query.slug;

  const food = foods.find(
    (item) => slugify(item.name) === requestedSlug
  );

  if (!food) {
    response.status(404).send(`
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="robots" content="noindex">
        <title>Besin Bulunamadı | Kalori Atlası</title>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
          rel="stylesheet"
        >
        <link rel="stylesheet" href="/style.css">
      </head>

      <body>
        <main class="container py-5 text-center">
          <h1>Besin bulunamadı</h1>

          <p class="text-muted">
            Aradığınız besin kaydı mevcut değil.
          </p>

          <a href="/" class="btn btn-primary">
            Kalori Atlası'na Dön
          </a>
        </main>
      </body>
      </html>
    `);

    return;
  }

  const safeName = escapeHtml(food.name);
  const safeCategory = escapeHtml(food.category);
  const safePortion = escapeHtml(food.portion);

  const canonicalUrl =
    `https://www.kaloriatlas.com/besin/${requestedSlug}`;

  const description =
    `${food.name} kaç kalori? ${food.portion} ` +
    `${food.name} ${food.calories} kcal, ` +
    `${food.protein} g protein, ${food.carbs} g karbonhidrat ` +
    `ve ${food.fat} g yağ içerir.`;

  const baseWeight = getBaseWeight(food.portion);
  const relatedFoods = foods
    .filter(
      (item) =>
        item.category === food.category &&
        slugify(item.name) !== requestedSlug
    )
    .slice(0, 6);

  const relatedFoodsHtml = relatedFoods
    .map(
      (item) => `
        <a
          href="/besin/${slugify(item.name)}"
          class="related-food-link"
        >
          <span>${escapeHtml(item.name)}</span>
          <strong>${item.calories} kcal</strong>
        </a>
      `
    )
    .join("");
  const quantityCalculator = baseWeight
    ? `
      <section class="quantity-card mt-4">
        <h2 class="h4 mb-3">Miktara göre hesapla</h2>

        <label for="gramInput" class="form-label fw-semibold">
          Miktar (gram)
        </label>

        <div class="input-group">
          <input
            type="number"
            id="gramInput"
            class="form-control"
            min="1"
            max="5000"
            step="1"
            value="${baseWeight}"
          >
          <span class="input-group-text">g</span>
        </div>

        <p class="text-muted small mt-2 mb-0">
          Değerler girdiğiniz miktara göre otomatik hesaplanır.
        </p>
      </section>
    `
    : "";

  const calculatorScript = baseWeight
    ? `
      <script>
        const baseWeight = ${baseWeight};

        const baseValues = {
          calories: ${Number(food.calories)},
          protein: ${Number(food.protein)},
          carbs: ${Number(food.carbs)},
          fat: ${Number(food.fat)}
        };

        const gramInput =
          document.getElementById("gramInput");

        function formatValue(value) {
          return Number(value.toFixed(1)).toLocaleString("tr-TR");
        }

        function updateNutritionValues() {
          const grams = Number(gramInput.value);

          if (!grams || grams < 1) {
            return;
          }

          const multiplier = grams / baseWeight;

          document.getElementById("calorieValue").textContent =
            Math.round(baseValues.calories * multiplier);

          document.getElementById("proteinValue").textContent =
            formatValue(baseValues.protein * multiplier);

          document.getElementById("carbValue").textContent =
            formatValue(baseValues.carbs * multiplier);

          document.getElementById("fatValue").textContent =
            formatValue(baseValues.fat * multiplier);
        }

        gramInput.addEventListener(
          "input",
          updateNutritionValues
        );
      </script>
    `
    : "";

  response.setHeader(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400"
  );

  response.status(200).send(`
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">

      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
      >

      <title>${safeName} Kaç Kalori? | Kalori Atlası</title>

      <meta
        name="description"
        content="${escapeHtml(description)}"
      >

      <meta name="robots" content="index, follow">

      <link
        rel="canonical"
        href="${canonicalUrl}"
      >

      <meta property="og:locale" content="tr_TR">
      <meta property="og:type" content="article">
      <meta property="og:site_name" content="Kalori Atlası">

      <meta
        property="og:title"
        content="${safeName} Kaç Kalori?"
      >

      <meta
        property="og:description"
        content="${escapeHtml(description)}"
      >

      <meta
        property="og:url"
        content="${canonicalUrl}"
      >

      <meta name="twitter:card" content="summary">

      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
        rel="stylesheet"
      >

      <link rel="stylesheet" href="/style.css">

      <style>
        .food-hero {
          padding: 32px 0;
        }

        .food-page {
          max-width: 900px;
          margin: 40px auto 60px;
        }

        .food-card,
        .quantity-card,
        .information-card {
          padding: 28px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          box-shadow: 0 12px 30px rgba(30, 60, 114, 0.1);
        }

        .food-category {
          display: inline-block;
          padding: 6px 12px;
          color: #1e3c72;
          background: #eef3fc;
          border-radius: 999px;
          font-weight: 600;
        }

        .nutrition-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-top: 25px;
        }

        .nutrition-item {
          padding: 20px 12px;
          text-align: center;
          background: #f7f9fd;
          border: 1px solid #e1e7f1;
          border-radius: 14px;
        }

        .nutrition-item span {
          display: block;
          margin-bottom: 6px;
          color: #667085;
          font-size: 0.9rem;
        }

        .nutrition-item strong {
          color: #1e3c72;
          font-size: 1.45rem;
        }

        .calorie-item {
          color: white;
          background: linear-gradient(135deg, #1e3c72, #2a5298);
          border: none;
        }

        .calorie-item span,
        .calorie-item strong {
          color: white;
        }

        @media (max-width: 768px) {
          .food-page {
            margin-top: 24px;
          }

          .food-card,
          .quantity-card,
          .information-card {
            padding: 20px;
          }

          .nutrition-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
                .related-foods-card {
          padding: 28px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          box-shadow: 0 12px 30px rgba(30, 60, 114, 0.1);
        }

        .related-foods-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .related-food-link {
          display: flex;
          padding: 14px 16px;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          color: #1f2937;
          background: #f7f9fd;
          border: 1px solid #e1e7f1;
          border-radius: 12px;
          text-decoration: none;
          transition:
            transform 0.15s ease,
            border-color 0.15s ease;
        }

        .related-food-link:hover {
          color: #1e3c72;
          border-color: #9fb5dd;
          transform: translateY(-1px);
        }

        .related-food-link strong {
          flex: 0 0 auto;
          color: #1e3c72;
        }

        @media (max-width: 600px) {
          .related-foods-card {
            padding: 20px;
          }

          .related-foods-grid {
            grid-template-columns: 1fr;
          }
        }
                .faq-card {
          padding: 28px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          box-shadow: 0 12px 30px rgba(30, 60, 114, 0.1);
        }

        .faq-card details {
          border-top: 1px solid #e5e7eb;
        }

        .faq-card details:last-child {
          border-bottom: 1px solid #e5e7eb;
        }

        .faq-card summary {
          padding: 17px 4px;
          color: #1f2937;
          font-weight: 700;
          cursor: pointer;
        }

        .faq-card details[open] summary {
          color: #1e3c72;
        }

        .faq-card details p {
          margin: 0;
          padding: 0 4px 18px;
          color: #4b5563;
          line-height: 1.7;
        }

        @media (max-width: 600px) {
          .faq-card {
            padding: 20px;
          }
        }
                .food-breadcrumb {
          display: flex;
          margin-bottom: 16px;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          color: #667085;
          font-size: 0.95rem;
        }

        .food-breadcrumb a {
          color: #2a5298;
          font-weight: 600;
          text-decoration: none;
        }

        .food-breadcrumb a:hover {
          text-decoration: underline;
        }

        .food-breadcrumb strong {
          color: #1f2937;
        }
      </style>

      <script type="application/ld+json">
        ${JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: `${food.name} Kaç Kalori?`,
          url: canonicalUrl,
          description,
                    breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Kalori Atlası",
                item: "https://www.kaloriatlas.com/"
              },
              {
                "@type": "ListItem",
                position: 2,
                name: food.name,
                item: canonicalUrl
              }
            ]
          },
          mainEntity: {
            "@type": "NutritionInformation",
            calories: `${food.calories} kcal`,
            proteinContent: `${food.protein} g`,
            carbohydrateContent: `${food.carbs} g`,
            fatContent: `${food.fat} g`
          }
        })}
      </script>
    </head>

    <body>
      <header class="hero-section food-hero">
        <div class="container">
          <div class="d-flex justify-content-between align-items-center">
            <a
              href="/"
              class="text-white text-decoration-none fw-bold"
            >
              Kalori Atlası
            </a>

            <a
              href="/hesaplayici.html"
              class="btn btn-outline-light btn-sm"
            >
              Kalori Hesapla
            </a>
          </div>
        </div>
      </header>

      <main class="container food-page">
              <nav
          class="food-breadcrumb"
          aria-label="Sayfa yolu"
        >
          <a href="/">Kalori Atlası</a>
          <span aria-hidden="true">›</span>
          <span>${safeCategory}</span>
          <span aria-hidden="true">›</span>
          <strong>${safeName}</strong>
        </nav>
        <article>
          <section class="food-card">
            <span class="food-category">
              ${safeCategory}
            </span>

            <h1 class="mt-3 mb-2">
              ${safeName} Kaç Kalori?
            </h1>

            <p class="text-muted mb-0">
              ${safePortion} için besin ve makro değerleri
            </p>

            <div class="nutrition-grid">
              <div class="nutrition-item calorie-item">
                <span>Kalori</span>
                <strong>
                  <span id="calorieValue">${food.calories}</span>
                  kcal
                </strong>
              </div>

              <div class="nutrition-item">
                <span>Protein</span>
                <strong>
                  <span id="proteinValue">${food.protein}</span>
                  g
                </strong>
              </div>

              <div class="nutrition-item">
                <span>Karbonhidrat</span>
                <strong>
                  <span id="carbValue">${food.carbs}</span>
                  g
                </strong>
              </div>

              <div class="nutrition-item">
                <span>Yağ</span>
                <strong>
                  <span id="fatValue">${food.fat}</span>
                  g
                </strong>
              </div>
            </div>
          </section>

          ${quantityCalculator}

          <section class="information-card mt-4">
            <h2 class="h4">
              ${safeName} besin değerleri
            </h2>

            <p class="mb-0">
              ${safePortion} ${safeName};
              <strong>${food.calories} kcal</strong>,
              <strong>${food.protein} g protein</strong>,
              <strong>${food.carbs} g karbonhidrat</strong> ve
              <strong>${food.fat} g yağ</strong> içerir.
              Değerler kullanılan ürün ve hazırlanma yöntemine göre
              değişiklik gösterebilir.
            </p>
          </section>
                    <section class="faq-card mt-4">
            <h2 class="h4 mb-3">
              ${safeName} hakkında sık sorulan sorular
            </h2>

            <details open>
              <summary>
                ${safeName} kaç kalori?
              </summary>

              <p>
                ${safePortion} ${safeName},
                <strong>${food.calories} kcal</strong> içerir.
              </p>
            </details>

            <details>
              <summary>
                ${safeName} ne kadar protein içerir?
              </summary>

              <p>
                ${safePortion} ${safeName},
                <strong>${food.protein} gram protein</strong> içerir.
              </p>
            </details>

            <details>
              <summary>
                ${safeName} karbonhidrat ve yağ miktarı nedir?
              </summary>

              <p>
                ${safePortion} ${safeName},
                <strong>${food.carbs} gram karbonhidrat</strong> ve
                <strong>${food.fat} gram yağ</strong> içerir.
              </p>
            </details>
          </section>
                    <section class="related-foods-card mt-4">
            <h2 class="h4 mb-3">
              Benzer ${safeCategory} besinleri
            </h2>

            <div class="related-foods-grid">
              ${relatedFoodsHtml}
            </div>
          </section>
        </article>
      </main>

      <footer class="text-center py-4 text-muted border-top">
        <p class="mb-0">
          © 2026 Kalori Atlası — Tüm Hakları Saklıdır.
        </p>
                <div class="mt-2">
          <a
            href="/kaynaklar.html"
            class="text-muted"
          >
            Kaynaklar ve Metodoloji
          </a>
        </div>
      </footer>

      ${calculatorScript}
    </body>
    </html>
  `);
};
