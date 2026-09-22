import { Container, Paper, Title, Text, Anchor, Alert } from '@mantine/core';
import { useLoaderData, useParams, Link, useRouteError, isRouteErrorResponse } from 'react-router';
import fs from 'fs/promises';
import path from 'path';
import { marked } from 'marked'; // Markdown parser
import classes from './blog.$articleId.module.css'; // CSS Modules for styling
import { AlertCircle } from 'lucide-react'; // Use lucide-react icon

// Configure marked (optional: add extensions, sanitize, etc.)
// Be cautious with sanitization if the Markdown source is not trusted.
// For now, we assume trusted content from the /blog directory.
marked.setOptions({
  gfm: true, // Enable GitHub Flavored Markdown
  breaks: true, // Convert single line breaks to <br>
});

// --- Custom Renderer for Marked ---
// Marked v5+ uses a token object instead of multiple arguments for renderers.
const renderer = new marked.Renderer();

renderer.link = function(token) { // Using `function` to get `this` context from marked
  let href = token.href;
  const title = token.title;

  // Check if the link text is bold to style it as a CTA button
  const isCta = token.tokens && token.tokens.length === 1 && token.tokens[0].type === 'strong';

  // `this.parser.parseInline` is needed to render the content of the link
  // If it's a CTA, we parse the content of the 'strong' token to avoid the nested <strong> tag
  // which has its own styling.
  const text = isCta
    ? this.parser.parseInline(token.tokens[0].tokens)
    : this.parser.parseInline(token.tokens);


  // Check if the link is relative (doesn't start with '/', '#', or a protocol)
  if (href && typeof href === 'string' && !href.startsWith('/') && !href.startsWith('#') && !/^[a-z]+:/i.test(href)) {
    // Prepend '/' to make it root-relative
    href = '/' + href;
  }

  // Manual reconstruction for robustness:
  let out = '<a href="' + href + '"';
  if (isCta) {
    out += ` class="${classes.ctaButton}"`;
  }
  if (title) {
    out += ' title="' + title + '"';
  }
  out += '>' + text + '</a>';
  return out;
};

renderer.paragraph = function(token) {
  // `this.parser.parseInline` renders the content of the paragraph.
  const text = this.parser.parseInline(token.tokens);

  // Check if the paragraph contains ONLY a link, and that link's text is ONLY bold.
  const isCtaPara = token.tokens.length === 1 &&
                    token.tokens[0].type === 'link' &&
                    token.tokens[0].tokens &&
                    token.tokens[0].tokens.length === 1 &&
                    token.tokens[0].tokens[0].type === 'strong';

  if (isCtaPara) {
    // If it's a CTA paragraph, wrap it in a div with a special class for centering.
    return `<div class="${classes.ctaContainer}">${text}</div>`;
  }

  // Otherwise, return a standard paragraph.
  return `<p>${text}</p>`;
};

renderer.strong = function(token) {
  // `this.parser.parseInline` is needed to render the content of the strong tag
  const text = this.parser.parseInline(token.tokens);
  // Use a specific class for styling bold text
  return `<strong class="${classes.boldText}">${text}</strong>`;
};
// --- End Custom Renderer ---

export function meta({ data }) {
  if (!data || !data.title) {
    return [
      { title: "Blog Article | Frugäast" },
      { name: "description", content: "Read our latest insights on AI-assisted coding." }
    ];
  }
  
  const articleUrl = `https://frugaast.dev/blog/${data.articleId}`;
  
  return [
    { title: `${data.title} | Frugäast Blog` },
    { name: "description", content: data.description },
    { property: "og:type", content: "article" },
    { property: "og:url", content: articleUrl },
    { property: "og:title", content: data.title },
    { property: "og:description", content: data.description },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: data.title },
    { name: "twitter:description", content: data.description }
  ];
}

export async function loader({ params }) {
  const articleId = params.articleId;

  // Basic security check for articleId to prevent path traversal
  if (!articleId || articleId.includes('..') || articleId.includes('/')) {
    throw new Response("Invalid article ID", { status: 400 });
  }

  const articlePath = path.resolve(`/blog/published/${articleId}.md`); // Absolute path inside the container

  try {
    let markdownContent = await fs.readFile(articlePath, 'utf-8');

    // Strip frontmatter from the content before parsing
    if (markdownContent.startsWith('---')) {
      const endOfFrontmatter = markdownContent.indexOf('---', 3);
      if (endOfFrontmatter !== -1) {
        markdownContent = markdownContent.substring(endOfFrontmatter + 3).trim();
      }
    }
    
    // Use the custom renderer when parsing
    const htmlContent = await marked.parse(markdownContent, { renderer });

    // Simple title extraction (assumes first H1 is the title)
    const titleMatch = markdownContent.match(/^#\s+(.*)/m);
    const title = titleMatch ? titleMatch[1] : 'Article'; // Default title

    // Extract a brief description from the first normal text paragraph
    const textLines = markdownContent.split('\n').filter(line => line.trim().length > 0 && !line.startsWith('#') && !line.startsWith('<') && !line.startsWith('>'));
    let description = `Read ${title} on the Frugäast blog.`;
    if (textLines.length > 0) {
      description = textLines[0].replace(/[\[\]*`_]/g, '').trim();
      if (description.length > 155) {
        description = description.substring(0, 155) + '...';
      }
    }

    return { htmlContent, title, description, articleId };
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File not found
      throw new Response("Article non trouvé", { status: 404 });
    } else {
      // Other errors (permissions, etc.)
      console.error(`Erreur lors de la lecture de l'article ${articleId}:`, error);
      throw new Response("Erreur lors du chargement de l'article", { status: 500 });
    }
  }
}

// Component to display loader errors that are Response objects
export function ErrorBoundary() {
    const error = useRouteError(); // Catches errors thrown from the loader

    // Check if it's a RouteErrorResponse to get status and statusText
    if (isRouteErrorResponse(error)) {
        return (
            <Container size="md" py="xl">
                <Alert icon={<AlertCircle size="1rem" />} title="Erreur" color="red" variant="light">
                    {error.status}: {error.statusText || "Une erreur est survenue"}
                    <Text mt="sm">Impossible de charger cet article. Veuillez vérifier l'URL ou retourner à la page du blog.</Text>
                    <Anchor component={Link} to="/blog" mt="md">
                        Retour au Blog
                    </Anchor>
                </Alert>
            </Container>
        );
    }

    // Handle other types of errors (less common if loader throws Responses)
    return (
        <Container size="md" py="xl">
            <Alert icon={<AlertCircle size="1rem" />} title="Erreur Inattendue" color="red">
                Une erreur inattendue s'est produite.
                 <Anchor component={Link} to="/blog" mt="md">
                    Retour au Blog
                </Anchor>
            </Alert>
        </Container>
    );
}


export default function ArticlePage() {
  const { htmlContent, title, articleId } = useLoaderData();

  return (
    <Container size="md" py={{ base: 'md', sm: 'xl' }} className={classes.pageContainer}>
       <Text component={Link} to="/blog" mb="lg" display="inline-block" className={classes.backLink}>
         &larr; Back to Blog
       </Text>
      <Paper shadow="sm" radius="md" className={classes.articleContainer}>
        {/* Title can be rendered here or rely on the H1 from Markdown */}
        {/* <Title order={1} mb="xl">{title}</Title> */}
        <div
          className={classes.markdownContent} // Apply styles to the rendered HTML
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </Paper>
       <div className={classes.footerNav}>
         <Text component={Link} to="/blog" display="inline-block" className={classes.backLink}>
           &larr; Back to Blog
         </Text>
       </div>
    </Container>
  );
}
