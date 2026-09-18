import { 
  Container, Title, Text, Button, Group, Stack, Grid, Box, ThemeIcon, Flex
} from '@mantine/core';
import { 
  CheckCircle2, ChevronRight, Zap, 
  Wallet, Cpu, FileCode, Search, ShieldAlert
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
            The deterministic <br />
            <span className={classes.textGradient}>coding assistant.</span>
          </Title>
          
          <Container size="md" p={0} mt="xl">
            <Text className={classes.heroSubtitle} ta="center" size="xl" mb="2xl" fw={500}>
              Frugäast is a lightning-fast Tauri UI over a native sidecar. 
              No autonomous loops. No hidden background prompts. 
              Just precise, context-aware code generation that you entirely control.
            </Text>
            
            <Group justify="center" gap="xl" mb="xl" mt="xl">
              <Group gap="sm"><CheckCircle2 size={20} className={classes.iconTeal}/><Text fw={600} size="md">Deterministic output</Text></Group>
              <Group gap="sm"><CheckCircle2 size={20} className={classes.iconTeal}/><Text fw={600} size="md">Zero token waste</Text></Group>
              <Group gap="sm"><CheckCircle2 size={20} className={classes.iconTeal}/><Text fw={600} size="md">Absolute local control</Text></Group>
            </Group>
          </Container>
        </Container>

        {/* Hero Image Replacement */}
        <Box w={{ base: "100%", xl: "80%" }} mx="auto" mt={80} className={classes.relativeZ}>
          <Box p="xl" bg="dark.8" style={{ border: '2px dashed var(--mantine-color-dark-4)', borderRadius: '12px' }}>
            <Text c="dimmed" ta="center" fs="italic" size="sm" mb="xs">[ Ideal Hero Image / UI Mockup ]</Text>
            <Text c="gray.4" ta="center" fw={500}>
              A clean, dark-mode macOS application window (Tauri). 
              The left pane shows a crisp, explicit file-selection tree with checkboxes. 
              The right pane displays a unified diff viewer (red/green highlights) pending user approval. 
              At the bottom right, a small, subtle badge reads: "Est. Cost: $0.003 — 1 API Call".
            </Text>
          </Box>
        </Box>

        <Container size="lg" className={classes.relativeZ}>
          <Container size="md" p={0}>
            <Box className={classes.promiseBox} mx="auto" maw={750} mt={40}>
              <Text c="dimmed" ta="center" size="lg" lh={1.7}>
                Autonomous agents are great for prototypes, but a liability for production codebases. 
                Stop paying LLMs to wander around your repository generating technical debt. 
                Get surgical, predictable edits <Text span fw={700} c="violet.6">without giving up the steering wheel.</Text>
              </Text>
            </Box>
          </Container>

          <Group justify="center" mt={50} gap="md">
            <Button 
              component="a" href="/download" size="lg" radius="md" 
              className={classes.buttonPrimary} rightSection={<ChevronRight size={18} />}
            >
              Download Frugäast
            </Button>
          </Group>
        </Container>
      </section>

      {/* 2. AGENTIC VS FRUGAAST WORKFLOW */}
      <section className={classes.sectionAlt}>
        <Container size="lg">
          <Stack align="center" mb={60}>
            <Title order={2} ta="center" className={classes.sectionTitle}>
              AI shouldn't be a black box that deletes your SSH keys.
            </Title>
            <Text c="dimmed" size="lg" ta="center" maw={700} lh={1.7}>
              Leave "Auto-mode" to the script kiddies. Senior engineers need tools that respect their architecture, 
              don't arbitrarily mutate local tables, and don't wipe out directories to "test" a guardrail.
            </Text>
          </Stack>

          <Grid gutter={{ base: 'xl', md: 'xl' }}>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Box h="100%" className={`${classes.splitCompareCard} ${classes.compareColBefore}`} p="xl" bg="dark.7">
                <Text c="red.4" ta="center" fw={700} mb="md">The "Agentic" Workflow</Text>
                <Text c="dimmed" ta="center" fs="italic" size="sm" mb="xs">[ Conceptual Diagram ]</Text>
                <Text c="gray.4" ta="center" size="sm" lh={1.6}>
                  A chaotic, circular flowchart showing an agentic loop: "Think → Search → Fail → Retry → Execute Command". 
                  Next to it, a token counter spins wildly out of control, terminating abruptly in a harsh red system alert: 
                  "Weekly Limit Reached". A background terminal shows an unattended `shutil.rmtree("/")` executing.
                </Text>
              </Box>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Box h="100%" className={`${classes.splitCompareCard} ${classes.compareColAfter}`} p="xl" bg="dark.7">
                <Text c="teal.4" ta="center" fw={700} mb="md">The Frugäast Workflow</Text>
                <Text c="dimmed" ta="center" fs="italic" size="sm" mb="xs">[ Conceptual Diagram ]</Text>
                <Text c="gray.4" ta="center" size="sm" lh={1.6}>
                  A straight, linear flowchart: "Developer selects context → Single optimized prompt → LLM returns unified diff → Developer approves". 
                  The flow is green, predictable, and finite. An overlay of a padlock icon over the local filesystem signifies that zero code executes without explicit human approval.
                </Text>
              </Box>
            </Grid.Col>
          </Grid>
        </Container>
      </section>

      {/* WHY FRUGAAST TITLE */}
      <section className={classes.section}>
        <Container size="lg">
          <Title order={4} ta="center" mb="xl" className={classes.sectionSubtitle}>
            Tired of burning your 20x Max limit in two hours?
          </Title>
          <Title order={1} ta="center" className={classes.heroTitle}>
            Frugäast is <span className={classes.textGradient}>fundamentally different.</span>
          </Title>
        </Container>
      </section>

      {/* 3. EXCEPTIONALLY CLEAN CODE */}
      <section className={classes.section}>
        <Container size="lg">
          <Grid align="center" gutter={{ base: 60, md: 80 }}>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Title order={2} mb="xl" className={classes.sectionTitle} ta="left">
                Stop feeding noise to the context window.
              </Title>
              <Text size="lg" c="dimmed" mb="md" lh={1.7}>
                Your LLM boasts a 200k context window. That's a trap. Its peak retrieval performance drops exponentially after 10k tokens. 
              </Text>
              <Text size="lg" c="dimmed" mb="xl" lh={1.7}>
                Dumping your entire repository into an agent guarantees hallucinated dependencies and dropped logic. Frugäast forces explicit, curated context.
              </Text>
              
              <Stack gap="xl">
                <Flex align="center" gap="md">
                  <ThemeIcon size={40} radius="md" color="violet.1" c="violet.7">
                    <Search size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={700} size="lg" mb={4}>Curated, surgical context.</Text>
                    <Text c="dimmed" lh={1.6}>Fuzzy search files. Build a precise repomap on the fly. Send only what matters.</Text>
                  </div>
                </Flex>
                <Flex align="center" gap="md">
                  <ThemeIcon size={40} radius="md" color="violet.1" c="violet.7">
                    <Zap size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={700} size="lg" mb={4}>One pass to rule them all.</Text>
                    <Text c="dimmed" lh={1.6}>No agentic loops. We send the exact context once, and apply a strict diff. That's it.</Text>
                  </div>
                </Flex>
                <Flex align="center" gap="md">
                  <ThemeIcon size={40} radius="md" color="violet.1" c="violet.7">
                    <ShieldAlert size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={700} size="lg" mb={4}>Safeguard your architecture.</Text>
                    <Text c="dimmed" lh={1.6}>By explicitly selecting files, you guarantee the LLM cannot mutate files it shouldn't touch.</Text>
                  </div>
                </Flex>
              </Stack>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Box p="xl" bg="dark.8" h="100%" style={{ border: '2px dashed var(--mantine-color-dark-4)', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Text c="dimmed" ta="center" fs="italic" size="sm" mb="xs">[ Context Degradation Visual ]</Text>
                <Text c="gray.4" ta="center" size="sm" lh={1.6}>
                  A visualization of LLM context degradation. On the left, a massive, blurry funnel labeled "200k Agent Context" spits out red "garbage/hallucinated" code blocks. On the right, a sharp, narrow, focused laser beam labeled "10k Frugäast Context" perfectly illuminates a glowing, syntax-highlighted diff.
                </Text>
              </Box>
            </Grid.Col>
          </Grid>
        </Container>
      </section>

      {/* 4. COST CONTROL SECTION */}
      <section className={classes.sectionAlt}>
        <Container size="lg">
          <Grid align="center" gutter={{ base: 60, md: 80 }}>
            <Grid.Col span={{ base: 12, md: 6 }} order={{ base: 2, md: 1 }}>
              <Box p="xl" bg="dark.8" h="100%" style={{ border: '2px dashed var(--mantine-color-dark-4)', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Text c="dimmed" ta="center" fs="italic" size="sm" mb="xs">[ Token Consumption Graph ]</Text>
                <Text c="gray.4" ta="center" size="sm" lh={1.6}>
                  A split-screen line graph comparing token consumption. 
                  Top line (Red): An exponential curve labeled "Agentic Orchestration Tax", skyrocketing upwards as the agent "thinks" about what tool to use. 
                  Bottom line (Blue): A flat, predictable staircase labeled "Frugäast", showing tiny, discrete jumps representing intentional, single-shot prompts.
                </Text>
              </Box>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }} order={{ base: 1, md: 2 }}>
              <Title order={2} mb="xl" className={classes.sectionTitle} ta="left">
                Escape the orchestration tax.
              </Title>
              <Text size="lg" c="dimmed" mb="xl" lh={1.7}>
                Agents quietly burn 100K+ tokens having internal monologues about what tool to use while you grab a coffee. 
                Frugäast cuts out the middleman: predictable token usage for predictable edits.
              </Text>
              
              <Stack gap="xl">
                <Flex align="center" gap="md">
                  <ThemeIcon size={40} radius="md" color="violet.1" c="violet.7">
                    <FileCode size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={700} size="lg" mb={4}>No hidden prompts.</Text>
                    <Text c="dimmed" lh={1.6}>If Frugäast makes an API call, it's because you clicked a button. Period.</Text>
                  </div>
                </Flex>
                <Flex align="center" gap="md">
                  <ThemeIcon size={40} radius="md" color="violet.1" c="violet.7">
                    <Cpu size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={700} size="lg" mb={4}>Bring your own keys.</Text>
                    <Text c="dimmed" lh={1.6}>Route complex logic to Sonnet 3.5, and offload boilerplate to cheaper models.</Text>
                  </div>
                </Flex>
                <Flex align="center" gap="md">
                  <ThemeIcon size={40} radius="md" color="violet.1" c="violet.7">
                    <Wallet size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={700} size="lg" mb={4}>Telemetry on your spend.</Text>
                    <Text c="dimmed" lh={1.6}>See the exact cost of every diff before you apply it. No more billing surprises.</Text>
                  </div>
                </Flex>
              </Stack>
            </Grid.Col>
          </Grid>
        </Container>
      </section>

      {/* 5. PHILOSOPHY / BUILT FOR DEVS */}
      <section className={classes.section}>
        <Container size="lg">
          <Grid align="center" gutter={{ base: 60, md: 80 }}>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Title order={2} mb="xl" className={classes.sectionTitle} ta="left">
                Built for developers who own their environment.
              </Title>
              <Text size="lg" c="dimmed" mb="xl" lh={1.7}>
                You already know what the architecture should look like. You don't need AI to "figure it out" for you—you just need it to write the boilerplate fast.
              </Text>
              <Text size="lg" c="dimmed" mb="md" lh={1.7}>
                Powered by a Nuitka-compiled Python sidecar, Frugäast runs entirely local. It patches your files only when you tell it to. It is a power tool, not an intern.
              </Text>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Box p="xl" bg="dark.8" h="100%" style={{ border: '2px dashed var(--mantine-color-dark-4)', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Text c="dimmed" ta="center" fs="italic" size="sm" mb="xs">[ Architecture Schematic ]</Text>
                <Text c="gray.4" ta="center" size="sm" lh={1.6}>
                  A sleek isometric diagram showing data flow. It starts at a brain icon ("Your Intent"), flows through the "Tauri UI", out to "API", and back down as a "Unified Diff". The core visual element is a massive locked vault over the "Local Filesystem / Home Directory", explicitly showing the AI has zero write-access without passing through your manual approval gate.
                </Text>
              </Box>
            </Grid.Col>
          </Grid>
        </Container>
      </section>

      {/* 6. FINAL CALL TO ACTION */}
      <section className={classes.ctaSection}>
        <Container size="md" className={classes.relativeZ}>
          <Title order={2} className={classes.ctaTitle}>
            Take back control of your codebase.
          </Title>
          <Text size="xl" c="violet.1" maw={700} mx="auto" ta="center" lh={1.6} mt="lg" fw={400}>
            Try the free version today. 95% of features, fully unlocked. <br/>
            Upgrade to a lifetime license only when you're ready. <br/>
            No subscriptions. No agents. Just clean code.
          </Text>

          <Group justify="center" mt={40}>
            <Button 
              component="a" href="/download" size="xl" radius="md" 
              className={classes.buttonCta} rightSection={<ChevronRight size={18} />}
            >
              Get Frugäast Free
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