import { Github, Twitter } from 'lucide-react';
import { ActionIcon, Container, Group, Text, SimpleGrid, Stack, Divider } from '@mantine/core';
import { HypnocamentsLogo } from './HypnocamentsLogo';
import classes from './Footer.module.css';
import siteMetadata from '@/data/siteMetadata.json';
import { Link } from 'react-router-dom';

export function Footer() {
  const groups = siteMetadata.footerLinks.map((group) => {
    const links = group.links.map((link, index) => (
      <Text
        key={index}
        className={classes.link}
        component={Link}
        to={link.link}
      >
        {link.label}
      </Text>
    ));

    return (
      <div className={classes.wrapper} key={group.title}>
        <Text className={classes.title}>{group.title}</Text>
        {links}
      </div>
    );
  });

  return (
    <footer className={classes.footer}>
      <Container size="lg">
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing={40}>
          <Stack gap="md" className={classes.logoSection}>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <HypnocamentsLogo width={140} height={32} />
              <Text 
                fw={800} 
                fz="xl" 
                variant="gradient" 
                gradient={{ from: 'gray.9', to: 'gray.6', deg: 45 }}
                style={{ marginLeft: '-40px', letterSpacing: '-0.5px' }}
              >
                Frugäast
              </Text>
            </Link>
            <Text size="sm" c="dimmed" className={classes.description}>
              {siteMetadata.description}
            </Text>
          </Stack>
          
          {groups}
        </SimpleGrid>

        <Divider my={40} opacity={0.5} />

        <div className={classes.afterFooter}>
          <Stack gap={4}>
            <Text c="dimmed" size="xs">
              {siteMetadata.copyright.replace('{year}', new Date().getFullYear())}
            </Text>
            <Group gap="sm">
              <Text size="xs" c="dimmed">{siteMetadata.email}</Text>
              <Text size="xs" c="dimmed">•</Text>
              <Text size="xs" c="dimmed">{siteMetadata.phone}</Text>
            </Group>
          </Stack>

          <Group gap="xs" justify="flex-end" wrap="nowrap">
            <ActionIcon size="lg" color="gray" variant="subtle" radius="xl" component="a" href={siteMetadata.social.github}>
              <Github size={18} strokeWidth={1.5} />
            </ActionIcon>
            <ActionIcon size="lg" color="gray" variant="subtle" radius="xl" component="a" href={siteMetadata.social.twitter}>
              <Twitter size={18} strokeWidth={1.5} />
            </ActionIcon>
          </Group>
        </div>
      </Container>
    </footer>
  );
}
