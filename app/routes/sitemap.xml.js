export async function loader({ request }) {
  const baseUrl = "https://frugaast.dev"; // Change this

  // 1. Define your static routes
  const staticRoutes = [
    "", "/how-it-works", "/pricing", "/download", "/blog"
  ];

  // 2. Fetch your dynamic routes (e.g., from your Python API or database)
  // Example: const articles = await fetch('http://frugaast-api:4242/articles').then(res => res.json());
  // Mocking it for this example:
  const articles = [{ slug: "how-to-use-ai" }, { slug: "react-router-v7-seo" }];

  // 3. Construct the XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${staticRoutes.map((route) => `
        <url>
          <loc>${baseUrl}${route}</loc>
          <changefreq>weekly</changefreq>
          <priority>${route === "" ? "1.0" : "0.8"}</priority>
        </url>
      `).join("")}
      ${articles.map((article) => `
        <url>
          <loc>${baseUrl}/blog/${article.slug}</loc>
          <changefreq>monthly</changefreq>
          <priority>0.7</priority>
        </url>
      `).join("")}
    </urlset>
  `;

  // 4. Return as XML Response
  return new Response(sitemap.trim(), {
    headers: {
      "Content-Type": "application/xml",
      "Content-Length": String(Buffer.byteLength(sitemap)),
    },
  });
}