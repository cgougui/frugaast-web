import { Container, Title, Text, Card, Group, SimpleGrid, useMantineTheme, rem, Image, Flex } from '@mantine/core';
import { Link, useLoaderData } from 'react-router-dom';
import fs from 'fs/promises'; // Use promises API for async/await
import path from 'path';
import classes from './blog.module.css'; // Assuming you might want custom styles

export function meta() {
  return [
    { title: "Blog | Frugäast AI Coding Assistant" },
    { name: "description", content: "Insights, guides, and tutorials on AI-assisted coding, keeping your codebase clean, and maximizing productivity." },
    { property: "og:type", content: "website" },
    { property: "og:title", content: "Blog | Frugäast AI Coding Assistant" },
    { property: "og:description", content: "Insights, guides, and tutorials on AI-assisted coding, keeping your codebase clean, and maximizing productivity." },
    { property: "og:url", content: "https://frugaast.dev/blog" }
  ];
}

// Helper function to format date YYYYMMDD to DD MMMM YYYY (French)
const formatDate = (dateString) => {
  if (!/^\d{8}$/.test(dateString)) {
    return 'Date invalide'; // Handle invalid format
  }
  const year = dateString.substring(0, 4);
  const month = dateString.substring(4, 6);
  const day = dateString.substring(6, 8);
  // Note: Months are 0-indexed in JavaScript Date
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};


export async function loader() {
  const articlesPath = path.resolve('/blog/articles.json'); // Absolute path inside the container
  try {
    const fileContent = await fs.readFile(articlesPath, 'utf-8');
    const data = JSON.parse(fileContent);
    // Sort articles by date descending (most recent first)
    const sortedArticles = data.articles.sort((a, b) => parseInt(b.date, 10) - parseInt(a.date, 10));
    return { articles: sortedArticles };
  } catch (error) {
    console.error("Erreur lors de la lecture ou du parsing du fichier d'articles:", error);
    // Return empty array or throw an error depending on desired behavior
    // Returning empty allows the page to render without articles
    return { articles: [] };
    // Or throw new Error("Impossible de charger les articles du blog.");
  }
}

export default function Blog() {
  const { articles } = useLoaderData();
  const theme = useMantineTheme();

  // Palette de couleurs pastel pour un blog de bien-être
  const pastelColors = [
    '#F0F4F8', // Bleu pastel très clair
    '#E6F4EA', // Vert pastel très clair
    '#FEFBEA', // Jaune pastel très clair
    '#FBEAFE', // Violet pastel très clair
    '#FFF0E5', // Orange pastel très clair
  ];

  return (
    <Container size="lg" py="xl">
      <div className={classes.header}>
        <Title order={1} ta="center" className={classes.title}>
          AI-Assisted Coding Blog
        </Title>
        <Text c="dimmed" ta="center" size="lg" maw={580} mx="auto" mt="xl">
          Learn to code with AI effectively.
        </Text>
      </div>

      {articles.length === 0 ? (
        <Text ta="center" c="dimmed" mt="xl">Aucun article disponible pour le moment.</Text>
      ) : (
        <SimpleGrid
          cols={{ base: 1, sm: 2, lg: 3 }}
          spacing="xl"
          verticalSpacing="xl"
          mt="xl"
        >
          {articles.map((article, index) => {
            // Colorer environ 20% des cartes (une sur cinq) de manière déterministe.
            const shouldColor = (index + 2) % 5 === 0; // Le `+ 2` varie la position de départ
            let cardStyle = {};
            if (shouldColor) {
              // Utiliser une méthode déterministe (basée sur l'ID de l'article) pour choisir une couleur
              // "aléatoire" afin d'éviter les problèmes d'hydratation côté client.
              const hash = article.id.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
              const colorIndex = Math.abs(hash) % pastelColors.length;
              cardStyle = { backgroundColor: pastelColors[colorIndex] };
            }

            return (
              <Link to={`/blog/${article.id}`} key={article.id} className={classes.cardLink}>
                <Card shadow="sm" padding={0} radius="md" withBorder className={classes.card} style={cardStyle}>
                  {article.image && (
                    <Card.Section>
                    <Image
                      src={article.image}
                      height={180}
                      alt={article.title}
                      className={classes.cardImage}
                    />
                  </Card.Section>
                )}

                <Flex direction="column" justify="space-between" className={classes.cardContent}>
                  <div>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700} mt="md">
                      {formatDate(article.date)}
                    </Text>
                    <Title order={3} fw={600} className={classes.cardTitle} mt="xs">
                      {article.title}
                    </Title>
                    <Text size="sm" c="dimmed" lineClamp={3} mt="sm">
                      {article.subtitle}
                    </Text>
                  </div>
                </Flex>
              </Card>
            </Link>
            );
          })}
        </SimpleGrid>
      )}
    </Container>
  );
}
