import { 
  Container, Group, Burger, Drawer, Stack, UnstyledButton, 
  ActionIcon, Accordion, Text, Divider, Box, Button 
} from '@mantine/core';
import { HypnocamentsLogo } from './HypnocamentsLogo'; // Consider renaming this component to SlyBotLogo
import { useDisclosure } from '@mantine/hooks';
import { useLocation, Link } from 'react-router-dom';
import { User, Twitter, Youtube, Instagram, ExternalLink } from 'lucide-react';
import siteMetadata from '@/data/siteMetadata.json';
import classes from './Header.module.css'; // Create this file or use inline styles below

export function Header() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const location = useLocation();
  const pathname = location.pathname;

  const items = siteMetadata.headerLinks.map((link) => {
    if (link.isCTA) {
      return (
        <Button
          key={link.label}
          component={Link}
          to={link.link}
          variant="filled"
          color="blue"
          radius="md"
          size="sm"
          onClick={close}
          style={{ fontWeight: 600 }}
        >
          {link.label}
        </Button>
      );
    }

    const isActive = pathname === link.link;

    return (
      <UnstyledButton
        key={link.label}
        component={Link}
        to={link.link}
        className={classes.navLink}
        data-active={isActive || undefined}
        onClick={close}
      >
        {link.label}
      </UnstyledButton>
    );
  });

  return (
    <header className={classes.header}>
      <Container size="lg" h="100%">
        <Group justify="space-between" h="100%" wrap="nowrap">
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <HypnocamentsLogo width={140} height={32} />
            <Text 
              fw={800} 
              fz="xl" 
              variant="gradient" 
              gradient={{ from: 'gray.9', to: 'gray.6', deg: 45 }}
              className={classes.websiteName} 
              style={{ marginLeft: '-40px', letterSpacing: '-0.5px' }}
            >
              Frugäast
            </Text>
          </Link>

          <Group gap="lg" visibleFrom="md">
            <Group gap="md">{items}</Group>
            
          </Group>

          <Burger opened={opened} onClick={toggle} hiddenFrom="md" size="sm" />
        </Group>
      </Container>

      <Drawer
        opened={opened}
        onClose={close}
        size="100%"
        padding="md"
        title={<HypnocamentsLogo width={120} height={30} />}
        hiddenFrom="md"
        zIndex={1000}
        styles={{
          header: { borderBottom: '1px solid var(--mantine-color-gray-2)' },
          body: { paddingTop: '20px' }
        }}
      >
        <Stack gap="xs">
          {siteMetadata.headerLinks.map((link) => (
            <UnstyledButton
              key={link.label}
              component={Link}
              to={link.link}
              onClick={close}
              className={classes.mobileLink}
              data-cta={link.isCTA || undefined}
              data-active={pathname === link.link || undefined}
            >
              <Group justify="space-between">
                <Text fw={500}>{link.label}</Text>
                {link.isCTA && <ExternalLink size={16} />}
              </Group>
            </UnstyledButton>
          ))}

        </Stack>

        <Box mt="xl">
          <Text size="xs" c="dimmed" mb="md" fw={700} tt="uppercase">Resources</Text>
          <Accordion variant="separated" radius="md">
            {siteMetadata.footerLinks.map((group) => (
              <Accordion.Item key={group.title} value={group.title}>
                <Accordion.Control>{group.title}</Accordion.Control>
                <Accordion.Panel>
                  <Stack gap="xs">
                    {group.links.map((l) => (
                      <Link key={l.label} to={l.link} style={{ color: 'inherit', textDecoration: 'none' }} onClick={close}>
                        <Text size="sm" py={4}>{l.label}</Text>
                      </Link>
                    ))}
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </Box>
      </Drawer>
    </header>
  );
}
