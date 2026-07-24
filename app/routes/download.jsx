import {
  Container, Title, Text, Button, Stack, List, ThemeIcon, 
  Card, Grid, Anchor, Divider, Group, Badge, SimpleGrid, Paper, Center
} from "@mantine/core";
import { Link } from "react-router";
import {
  Download as DownloadIcon, ShieldCheck, CheckCircle2, Monitor, 
  Smartphone, Cable, Instagram, AlertTriangle, LifeBuoy, 
  MessageSquare, Mail, ChevronRight, Sparkles, FileText
} from "lucide-react";
import { MarketingLayout } from '../components/MarketingLayout';
import sharedClasses from '../styles/shared.module.css';
import classes from "./download.module.css";

export default function Download() {
  return (
    <MarketingLayout>
      {/* 1. HERO SECTION */}
      <section className={sharedClasses.hero}>
        <Container size="lg">
          <Stack align="center" ta="center">
            <Badge variant="outline" color="blue.4" size="lg" radius="xl" className={sharedClasses.pillBadge}>
              Verified Secure • v1.2.4
            </Badge>
            <Title className={sharedClasses.heroTitle}>
              Your journey to <span className={sharedClasses.textGradient}>organic growth</span> starts here.
            </Title>
            <Text className={sharedClasses.heroSubtitle} size="xl" maw={700}>
              No accounts. No credit cards. No strings attached. <br />Just the software you need to scale.
            </Text>
            
            <div className={classes.downloadBox}>
              <Button
                size="xl"
                radius="xl"
                className={sharedClasses.buttonPrimary}
                leftSection={<DownloadIcon size={24} />}
                component="a"
                href="#"
              >
                Download SlyBot for Windows
              </Button>
              <Text size="xs" mt="md" c="dimmed" fw={500}>
                Windows 10/11 • 42MB • MD5: 4f2a...9b1e
              </Text>
            </div>
          </Stack>
        </Container>
      </section>

      {/* 2. THE PRIVACY PROMISE (GLASS CARD) */}
      <section className={sharedClasses.section}>
        <Container size="lg">
          <Paper radius="3rem" p={{ base: 'xl', md: 50 }} className={sharedClasses.glassCard}>
            <Grid gutter={50} align="center">
              <Grid.Col span={{ base: 12, md: 7 }}>
                <Group mb="md">
                  <div className={`${sharedClasses.iconCircleLarge} ${sharedClasses.bgPastelBlue}`}>
                    <ShieldCheck size={32} />
                  </div>
                  <Title order={2} className={sharedClasses.sectionTitleSmall}>The Privacy Promise</Title>
                </Group>
                <Text size="lg" mb="xl">
                  We don't ask for your email because we believe in the product, not in building spam lists. 
                  SlyBot runs entirely on your hardware.
                </Text>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                  <Group wrap="nowrap">
                    <CheckCircle2 size={18} color="var(--mantine-color-teal-6)" />
                    <Text size="sm" fw={600}>Zero Data Collection</Text>
                  </Group>
                  <Group wrap="nowrap">
                    <CheckCircle2 size={18} color="var(--mantine-color-teal-6)" />
                    <Text size="sm" fw={600}>100% Local Execution</Text>
                  </Group>
                  <Group wrap="nowrap">
                    <CheckCircle2 size={18} color="var(--mantine-color-teal-6)" />
                    <Text size="sm" fw={600}>No Cloud Storage</Text>
                  </Group>
                  <Group wrap="nowrap">
                    <CheckCircle2 size={18} color="var(--mantine-color-teal-6)" />
                    <Text size="sm" fw={600}>Direct USB Connection</Text>
                  </Group>
                </SimpleGrid>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 5 }}>
                <Paper bg="white" p="xl" radius="2rem" withBorder>
                   <Stack align="center" ta="center" gap="xs">
                      <Sparkles size={40} color="var(--mantine-color-blue-3)" />
                      <Text fw={800} size="xl">Ready in 2 min</Text>
                      <Text size="sm" c="dimmed">Our setup wizard handles the technical heavy lifting for you.</Text>
                   </Stack>
                </Paper>
              </Grid.Col>
            </Grid>
          </Paper>
        </Container>
      </section>

      {/* 3. REQUIREMENTS & LICENSE BENTO */}
      <section className={sharedClasses.section}>
        <Container size="lg">
          <Grid gutter="xl">
            {/* Requirements Card */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card className={sharedClasses.bentoCard}>
                <Title order={3} mb="xl">The Growth Kit</Title>
                <Stack gap="lg">
                  <div className={classes.kitItem}>
                    <Monitor size={24} className={classes.kitIcon} />
                    <div>
                      <Text fw={700}>Windows PC</Text>
                      <Text size="sm" c="dimmed">Windows 10 or 11 (64-bit)</Text>
                    </div>
                  </div>
                  <div className={classes.kitItem}>
                    <Smartphone size={24} className={classes.kitIcon} />
                    <div>
                      <Text fw={700}>Android Device</Text>
                      <Text size="sm" c="dimmed">OS 8.0 to 14.0 (Phone or Tablet)</Text>
                    </div>
                  </div>
                  <div className={classes.kitItem}>
                    <Cable size={24} className={classes.kitIcon} />
                    <div>
                      <Text fw={700}>USB Data Cable</Text>
                      <Text size="sm" c="dimmed">Standard high-speed data cable</Text>
                    </div>
                  </div>
                </Stack>
              </Card>
            </Grid.Col>

            {/* License Card */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card className={`${sharedClasses.bentoCard} ${sharedClasses.bgPastelPurpleLight}`}>
                <Title order={3} mb="xl">Free-Forever License</Title>
                <List spacing="sm" icon={<ThemeIcon color="grape" size={20} radius="xl"><Check size={12} /></ThemeIcon>}>
                  <List.Item><Text fw={500}>Unlimited Competitor Targeting</Text></List.Item>
                  <List.Item><Text fw={500}>Full Hardware Automation</Text></List.Item>
                  <List.Item><Text fw={500}>Standard Daily Safety Limits</Text></List.Item>
                  <List.Item><Text fw={500}>Single Instagram Account</Text></List.Item>
                </List>
                <Divider my="xl" />
                <Text size="sm" c="dimmed">
                  Need unlimited accounts? <Anchor component={Link} to="/minor/pro" fw={700}>Check out SlyBot Pro →</Anchor>
                </Text>
              </Card>
            </Grid.Col>
          </Grid>
        </Container>
      </section>

      {/* 4. ONBOARDING STEPS */}
      <section className={sharedClasses.sectionAlt}>
        <Container size="lg">
          <Stack align="center" mb={50}>
            <Title order={2} className={sharedClasses.sectionTitleSmall}>What happens next?</Title>
          </Stack>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
            {[
              { t: 'Run Installer', d: 'Open SlyBot_Setup.exe and bypass SmartScreen.', c: 'blue' },
              { t: 'Enable Dev Mode', d: 'Tap Build Number 7x in your phone settings.', c: 'grape' },
              { t: 'USB Debugging', d: 'Toggle USB Debugging to ON in Dev Options.', c: 'teal' },
              { t: 'Connect & Grow', d: 'Plug in and watch the magic happen.', c: 'pink' }
            ].map((step, i) => (
              <div key={i} className={`${sharedClasses.bentoCard} ${sharedClasses.hoverCard}`}>
                <Badge variant="light" color={step.c} mb="md">Step 0{i+1}</Badge>
                <Text fw={800} mb="xs">{step.t}</Text>
                <Text size="sm" c="dimmed">{step.d}</Text>
              </div>
            ))}
          </SimpleGrid>
        </Container>
      </section>

      {/* 5. SAFETY & SUPPORT */}
      <section className={sharedClasses.section}>
        <Container size="lg">
          <Grid gutter={40}>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <div className={`${sharedClasses.bentoCard} ${sharedClasses.bgPastelOrangeLight}`}>
                 <Group mb="md">
                    <AlertTriangle color="var(--mantine-color-orange-6)" />
                    <Text fw={800}>Safety First</Text>
                 </Group>
                 <Text size="sm" c="dimmed">
                   SlyBot includes human-like delays. We recommend starting with a low "Actions Per Hour" 
                   setting for the first 48 hours to warm up your account safely.
                 </Text>
              </div>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <div className={`${sharedClasses.bentoCard} ${sharedClasses.bgPastelBlueLight}`}>
                 <Group mb="md">
                    <LifeBuoy color="var(--mantine-color-blue-6)" />
                    <Text fw={800}>Need Help?</Text>
                 </Group>
                 <Group gap="xs">
                   <Button variant="subtle" size="xs" leftSection={<MessageSquare size={14}/>}>Discord</Button>
                   <Button variant="subtle" size="xs" leftSection={<Mail size={14}/>}>Email Support</Button>
                 </Group>
              </div>
            </Grid.Col>
          </Grid>
        </Container>
      </section>

      {/* 6. FINAL CTA */}
      <section className={sharedClasses.ctaSection}>
        <Container size="md">
          <div className={sharedClasses.ctaContainer}>
            <Title order={2} className={sharedClasses.ctaTitle}>Ready to automate?</Title>
            <Button size="xl" radius="xl" className={sharedClasses.buttonPrimary} leftSection={<DownloadIcon size={24} />}>
              Download Now
            </Button>
          </div>
        </Container>
      </section>
    </MarketingLayout>
  );
}

// Simple internal helper for icon
function Check({ size }) {
  return <CheckCircle2 size={size} />;
}
