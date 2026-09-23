import fs from 'fs/promises';
import path from 'path';
import siteMetadata from '@/data/siteMetadata.json'; // Utilizing your Vite alias

export async function loader({ request }) {
  const baseUrl = "https://frugaast.dev";

  // 1. Extract static routes dynamically from siteMetadata
  const routeSet = new Set();
  
  // Always include the homepage (using an empty string to avoid trailing slash on the root domain)
  routeSet.add("");

  // Helper function to safely add internal links
  const addLink = (url) => {
    // Only add internal paths (starts with '/')
    if (url && url.startsWith('/')) {
      // Normalize "/" to "" for the homepage to match our formatting
      routeSet.add(url === '/' ? "" : url);
    }
  };

  // Grab links from Header
  if (siteMetadata.headerLinks) {
    siteMetadata.headerLinks.forEach(item => addLink(item.link));
  }

  // Grab links from Footer
  if (siteMetadata.footerLinks) {
    siteMetadata.footerLinks.forEach(group => {
      if (group.links) {
        group.links.forEach(item => addLink(item.link));
      }
    });
  }

  // Convert the Set back to an Array
  const staticRoutes = Array.from(routeSet);

  // 2. Fetch your dynamic routes dynamically from articles.json
  let articles = [];
  try {
    const articlesPath = path.resolve('/blog/articles.json');
    const fileContent = await fs.readFile(articlesPath, 'utf-8');
    const data = JSON.parse(fileContent);
    articles = data.articles || [];
  } catch (error) {
    console.error("Erreur lors de la lecture des articles pour le sitemap:", error);
  }

  // 3. Construct the XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${staticRoutes.map((route) => `
        <url>
          <loc>${baseUrl}${route}</loc>
          <changefreq>${route === "" || route === "/blog" ? "weekly" : "monthly"}</changefreq>
          <priority>${route === "" ? "1.0" : route === "/blog" ? "0.9" : "0.8"}</priority>
        </url>
      `).join("")}
      ${articles.map((article) => `
        <url>
          <loc>${baseUrl}/blog/${article.id}</loc>
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
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}