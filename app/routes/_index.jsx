import { 
  Container, Title, Text, Button, Group, Stack, Grid, Box, ThemeIcon, Flex
} from '@mantine/core';
import { 
  CheckCircle2, ChevronRight, Zap, 
  TerminalSquare, ShieldAlert, Cpu, 
  FileWarning, CircleSlash
} from 'lucide-react';
import { MarketingLayout } from '../components/MarketingLayout';

import sharedClasses from '../styles/shared.module.css';
import classes from './_index.module.css';

export default function Index() {
  return (
    <MarketingLayout>
      {/* 1. HERO SECTION */}
      <section className={classes.heroSection}>
        <div className={classes.heroGridPattern} />
        <div className={classes.heroGlow} />
        
        <Container size="lg" className={classes.relativeZ}>
          <Title className={classes.heroTitle} ta="center" order={1}>
            Auto-mode is a <span className={classes.textGradient}>trap.</span>
          </Title>
          
          <Container size="md" p={0} mt="xl">
            <Text className={classes.heroSubtitle} ta="center" size="xl" mb="2xl" fw={500}>
              Stop burning tokens on internal AI monologues. <br/>
              Frugäast is a strictly non-agentic coding assistant. <br/>
              You steer. It types.
            </Text>
            
            <Group justify="center" gap="xl" mb="xl" mt="xl">
              <Group gap="sm"><CheckCircle2 size={20} className={classes.iconTeal}/><Text fw={600} size="md">No background loops</Text></Group>
              <Group gap="sm"><CheckCircle2 size={20} className={classes.iconTeal}/><Text fw={600} size="md">Zero unattended risks</Text></Group>
              <Group gap="sm"><CheckCircle2 size={20} className={classes.iconTeal}/><Text fw={600} size="md">Predictable token spend</Text></Group>
            </Group>
          </Container>
        </Container>

        {/* Hero UI Placeholder */}
        <Box w={{ base: "100%", xl: "80%" }} mx="auto" mt={80} className={classes.relativeZ}>
          <Box p="xl" bg="dark.8" style={{ border: '2px dashed var(--mantine-color-dark-4)', borderRadius: '12px' }}>
            <Text c="dimmed" ta="center" fs="italic" size="sm" mb="xs">[ Frugäast UI Screenshot ]</Text>
            <Text c="gray.4" ta="center" fw={500}>
              A minimalist, native Tauri app window. 
              Left side: A strict file picker. 
              Right side: A clean, unified diff ready for manual approval. 
              Bottom corner: "Edit cost: $0.02 - 1 API Call".
            </Text>
          </Box>
        </Box>

        <Container size="lg" className={classes.relativeZ}>
          <Container size="md" p={0}>
            <Box className={classes.promiseBox} mx="auto" maw={750} mt={40}>
              <Text c="dimmed" ta="center" size="lg" lh={1.7}>
                AI shouldn't be malware you pay for. Senior devs already know their architecture. 
                They just need boilerplate written fast. Get precise edits without giving up control.
              </Text>
            </Box>
          </Container>

          <Group justify="center" mt={50} gap="md">
            <Button 
              component="a" href="/download" size="lg" radius="md" 
              className={classes.buttonPrimary} rightSection={<ChevronRight size={18} />}
            >
              Get Frugäast Free
            </Button>
          </Group>
        </Container>
      </section>

      {/* 2. THE TOKEN BURN SECTION */}
      <section className={classes.sectionAlt}>
        <Container size="lg">
          <Grid gutter={{ base: 'xl', md: 'xl' }} align="center">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Title order={2} mb="xl" className={classes.sectionTitle} ta="left">
                20x Max limits mean nothing anymore.
              </Title>
              <Text size="lg" c="dimmed" mb="md" lh={1.7}>
                Hitting "Weekly Limit Reached" in two hours is absurd.
              </Text>
              <Text size="lg" c="dimmed" mb="xl" lh={1.7}>
                Limits disappear at crazy speeds. Why? The Fable orchestration tax. 
                Agents burn 100k tokens just deciding what tool to use.
              </Text>

              <Stack gap="xl">
                <Flex align="center" gap="md">
                  <ThemeIcon size={40} radius="md" color="violet.1" c="violet.7">
                    <CircleSlash size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={700} size="lg" mb={4}>Escape the orchestration tax.</Text>
                    <Text c="dimmed" lh={1.6}>No Fable loops. No hidden background prompts.</Text>
                  </div>
                </Flex>
                <Flex align="center" gap="md">
                  <ThemeIcon size={40} radius="md" color="violet.1" c="violet.7">
                    <Zap size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={700} size="lg" mb={4}>One prompt. One diff.</Text>
                    <Text c="dimmed" lh={1.6}>Frugäast is deterministic. You click. It calls the API once.</Text>
                  </div>
                </Flex>
              </Stack>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Box p="xl" bg="dark.7" h="100%" style={{ border: '2px dashed var(--mantine-color-red-9)', borderRadius: '12px' }}>
                <Text c="red.4" ta="center" fw={700} mb="md">The Agentic Drain</Text>
                <Text c="dimmed" ta="center" fs="italic" size="sm" mb="xs">[ Graphic Placeholder ]</Text>
                <Text c="gray.4" ta="center" size="sm" lh={1.6}>
                  A visual of a token counter spinning wildly out of control. 
                  A red error banner reading "Weekly Limit Reached". 
                  Next to it, a flat, calm, green line showing Frugäast's predictable, single-shot token usage.
                </Text>
              </Box>
            </Grid.Col>
          </Grid>
        </Container>
      </section>

      {/* 3. THE SAFETY SECTION */}
      <section className={classes.section}>
        <Container size="lg">
          <Grid align="center" gutter={{ base: 60, md: 80 }}>
            <Grid.Col span={{ base: 12, md: 6 }} order={{ base: 2, md: 1 }}>
              <Box p="xl" bg="dark.8" h="100%" style={{ border: '2px dashed var(--mantine-color-orange-6)', borderRadius: '12px' }}>
                <Text c="orange.4" ta="center" fw={700} mb="md">Unattended Liability</Text>
                <Text c="dimmed" ta="center" fs="italic" size="sm" mb="xs">[ Terminal Placeholder ]</Text>
                <Text c="gray.4" ta="center" size="sm" lh={1.6}>
                  A glowing red terminal executing 'shutil.rmtree("/")'. 
                  A padlock icon slams down over it, blocking the execution, replaced by a green button that says: "Awaiting Developer Approval".
                </Text>
              </Box>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }} order={{ base: 1, md: 2 }}>
              <Title order={2} mb="xl" className={classes.sectionTitle} ta="left">
                Never leave an agent unattended.
              </Title>
              <Text size="lg" c="dimmed" mb="xl" lh={1.7}>
                Agents are a massive liability. They modify tables they shouldn't touch. 
                They delete guardrails just to "test" them. 
                One hallucination, and a rogue <code>rmtree("/")</code> wipes your home directory and SSH keys.
              </Text>
              
              <Stack gap="xl">
                <Flex align="center" gap="md">
                  <ThemeIcon size={40} radius="md" color="violet.1" c="violet.7">
                    <ShieldAlert size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={700} size="lg" mb={4}>Zero auto-execution.</Text>
                    <Text c="dimmed" lh={1.6}>Frugäast cannot execute commands. It proposes a diff. You apply it.</Text>
                  </div>
                </Flex>
                <Flex align="center" gap="md">
                  <ThemeIcon size={40} radius="md" color="violet.1" c="violet.7">
                    <TerminalSquare size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={700} size="lg" mb={4}>Strict boundaries.</Text>
                    <Text c="dimmed" lh={1.6}>It only reads the files you select. It only writes where you permit.</Text>
                  </div>
                </Flex>
              </Stack>
            </Grid.Col>
          </Grid>
        </Container>
      </section>

      {/* 4. CONTEXT DEGRADATION SECTION */}
      <section className={classes.sectionAlt}>
        <Container size="lg">
          <Grid align="center" gutter={{ base: 60, md: 80 }}>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Title order={2} mb="xl" className={classes.sectionTitle} ta="left">
                200k context is a trap.
              </Title>
              <Text size="lg" c="dimmed" mb="xl" lh={1.7}>
                Don't dump your whole repository into the prompt. 
                After 10k tokens, LLM performance drops. It forgets logic. It hallucinates dependencies.
              </Text>
              
              <Stack gap="xl">
                <Flex align="center" gap="md">
                  <ThemeIcon size={40} radius="md" color="violet.1" c="violet.7">
                    <Cpu size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={700} size="lg" mb={4}>Stay in the sweet spot.</Text>
                    <Text c="dimmed" lh={1.6}>Explicit file selection keeps the model in its peak performance zone.</Text>
                  </div>
                </Flex>
                <Flex align="center" gap="md">
                  <ThemeIcon size={40} radius="md" color="violet.1" c="violet.7">
                    <FileWarning size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={700} size="lg" mb={4}>Clean code. No surprises.</Text>
                    <Text c="dimmed" lh={1.6}>Focused context means predictable, scalable output.</Text>
                  </div>
                </Flex>
              </Stack>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Box p="xl" bg="dark.7" h="100%" style={{ border: '2px dashed var(--mantine-color-dark-4)', borderRadius: '12px' }}>
                <Text c="dimmed" ta="center" fs="italic" size="sm" mb="xs">[ Context Funnel Graphic ]</Text>
                <Text c="gray.4" ta="center" size="sm" lh={1.6}>
                  A massive, overflowing funnel labeled "200k Context" spitting out garbage code. 
                  Next to it, a sharp, targeted laser beam labeled "Frugäast 10k Context" generating a perfect green diff.
                </Text>
              </Box>
            </Grid.Col>
          </Grid>
        </Container>
      </section>

      {/* 5. PRICING & FINAL CALL TO ACTION */}
      <section className={classes.ctaSection}>
        <Container size="md" className={classes.relativeZ}>
          <Title order={2} className={classes.ctaTitle}>
            Bring your own keys. Take back control.
          </Title>
          <Text size="xl" c="violet.1" maw={700} mx="auto" ta="center" lh={1.6} mt="lg" fw={400}>
            Built with a fast Tauri UI and a native Python sidecar. <br/><br/>
            Try the free version today (95% of features). <br/>
            Upgrade to a lifetime license later. No recurring subscriptions.
          </Text>

          <Group justify="center" mt={40}>
            <Button 
              component="a" href="/download" size="xl" radius="md" 
              className={classes.buttonCta} rightSection={<ChevronRight size={18} />}
            >
              Download Free Version
            </Button>
          </Group>
        </Container>
        
        {/* Decorative CTA glow */}
        <div className={classes.ctaGlow} />
        <div className={classes.ctaGrid} />
      </section>
    </MarketingLayout>
  );
}