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

module.exports = function handler(request, response) {
  const siteUrl = "https://www.kaloriatlas.com";

  const lastModified =
    new Date().toISOString().split("T")[0];

  const foodSlugs = [
    ...new Set(
      foods.map((food) => slugify(food.name))
    )
  ];

   const staticPages = [
    {
      url: `${siteUrl}/`,
      priority: "1.0"
    },
    {
      url: `${siteUrl}/hesaplayici.html`,
      priority: "0.8"
    },
      {
    url: `${siteUrl}/kaynaklar.html`,
    priority: "0.7"
  },
  {
    url: `${siteUrl}/hakkimizda.html`,
    priority: "0.7"
  },
  {
    url: `${siteUrl}/gizlilik.html`,
    priority: "0.5"
  },
       {
    url: `${siteUrl}/gunluk-takip.html`,
    priority: "0.8"
  }
];
  const foodPages = foodSlugs.map((slug) => ({
    url: `${siteUrl}/besin/${slug}`,
    priority: "0.7"
  }));

  const allPages = [
    ...staticPages,
    ...foodPages
  ];

  const sitemapItems = allPages
    .map(
      (page) => `
  <url>
    <loc>${page.url}</loc>
    <lastmod>${lastModified}</lastmod>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join("");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapItems}
</urlset>`;

  response.setHeader(
    "Content-Type",
    "application/xml; charset=utf-8"
  );

  response.setHeader(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400"
  );

  response.status(200).send(sitemap);
};
