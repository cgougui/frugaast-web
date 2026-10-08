import fs from 'fs/promises';
import path from 'path';

// Absolute path inside the container. Each subdirectory is a source:
//   /blog/<source>/articles.json
//   /blog/<source>/published/<id>.md
export const BLOG_ROOT = path.resolve('/blog');

// Loads articles from every /blog/<source>/articles.json.
// Each article gets a `source` field so its markdown can be found later.
// A source whose articles.json is missing or invalid is skipped, not fatal.
export async function loadAllArticles() {
  const entries = await fs.readdir(BLOG_ROOT, { withFileTypes: true });
  const sources = entries.filter(e => e.isDirectory()).map(e => e.name).sort();

  const perSource = await Promise.all(sources.map(async (source) => {
    const articlesPath = path.join(BLOG_ROOT, source, 'articles.json');
    try {
      const data = JSON.parse(await fs.readFile(articlesPath, 'utf-8'));
      return (data.articles || []).map(article => ({ ...article, source }));
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error(`Erreur lors de la lecture de ${articlesPath}:`, error);
      }
      return [];
    }
  }));

  return perSource.flat();
}

export function articleMarkdownPath(article) {
  return path.join(BLOG_ROOT, article.source, 'published', `${article.id}.md`);
}
