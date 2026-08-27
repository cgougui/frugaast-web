import { 
  Container, Title, Text, Button, Group, Stack, Grid, Card, 
  ThemeIcon, Badge, Paper, Center, Box, Avatar
} from '@mantine/core';
import { 
  Search, FileCode2, GitCommit, ShieldAlert, 
  TerminalSquare, Settings2, Cpu, History, ChevronRight, 
  Sparkles, Layers, DollarSign, Zap, GitPullRequest
} from 'lucide-react';
import { MarketingLayout } from '../components/MarketingLayout';

import sharedClasses from '../styles/shared.module.css';
import classes from './how-it-works.module.css';

export default function HowItWorks() {
  return (
    <MarketingLayout>
      
      {/* 1. HERO SECTION */}
      <section className={sharedClasses.hero}>
        <div className={classes.gridBackground} />
        
        <Container size="md" className={sharedClasses.relativeZ} ta="center">          
          <Title className={sharedClasses.heroTitle} order={1}>
            Surgical edits. Zero bloat. <br />
            <span className={sharedClasses.textGradient}>Complete control.</span>
          </Title>
          
          <Title order={2} size="h3" c="dark.8" mt="xl" fw={700}>
            No autonomous loops. No API bankruptcy.
          </Title>

          <Text className={sharedClasses.heroSubtitle} size="xl" mt="md" lh={1.6}>
            Agentic AI tools act like hyperactive junior developers: they read your entire repository, hallucinate dependencies, and rewrite code they shouldn't touch. 
          </Text>
          <Text className={sharedClasses.heroSubtitle} size="xl" mt="sm" lh={1.6}>
            Frugaast is different. It’s a Tauri-based desktop app that keeps you in the driver's seat. Here is how you ship clean code in three precise steps.
          </Text>
        </Container>
      </section>

      {/* 2. THE STEP-BY-STEP SECTION (Zig-Zag Layout) */}
      <section className={sharedClasses.sectionAlt}>
        <Container size="lg">
          
          {/* STEP 1 */}
          <Box className={classes.stepBlock}>
            <div className={classes.watermarkNumber}>01</div>
            <Grid gutter={60} align="center" className={classes.stepContent}>
              <Grid.Col span={{ base: 12, md: 6 }} order={{ base: 2, md: 1 }}>
                <Title order={3} fw={900} mb="md" size="h2" c="dark.9">
                  Step 1: Curate context with fuzzy search
                </Title>
                <Text size="lg" c="dimmed" lh={1.7} mb="xl">
                  Don't dump your entire <code>src/</code> directory into the prompt window. Use the left sidebar to quickly fuzzy-find and add only the specific files relevant to your current task. You control the context window, which means you control the output quality.
                </Text>
                <Paper radius="lg" p="xl" className={classes.featureAlert} style={{ borderLeftColor: 'var(--mantine-color-violet-5)' }}>
                  <Group gap="sm" mb="xs">
                    <Zap size={20} color="var(--mantine-color-violet-6)" />
                    <Text fw={800} c="dark.9">High Signal, Low Noise:</Text>
                  </Group>
                  <Text c="dimmed" lh={1.6}>Curated context means fewer hallucinated variables, strict adherence to your existing architecture, and an immediate drop in your token costs.</Text>
                </Paper>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }} order={{ base: 1, md: 2 }}>
                <div className={`${classes.visualPanel} ${classes.bgGradientViolet}`}>
                  <Paper radius="xl" p="xl" shadow="xl" className={classes.floatingElement}>
                    <Stack align="center" gap="sm">
                      <ThemeIcon size={64} radius="xl" color="violet" variant="light">
                        <Search size={32} />
                      </ThemeIcon>
                      <Text fw={800} size="lg">⌘ + P to add files</Text>
                      <Badge color="violet" variant="light">app/routes/api.ts added</Badge>
                    </Stack>
                  </Paper>
                </div>
              </Grid.Col>
            </Grid>
          </Box>

          {/* STEP 2 */}
          <Box className={classes.stepBlock}>
            <div className={classes.watermarkNumberRight}>02</div>
            <Grid gutter={60} align="center" className={classes.stepContent}>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <div className={`${classes.visualPanel} ${classes.bgGradientBlue}`}>
                  <Paper radius="xl" p="xl" shadow="xl" className={classes.floatingElement}>
                    <Group wrap="nowrap" gap="lg">
                      <Avatar size="xl" radius="xl" color="blue"><Layers size={28} /></Avatar>
                      <div>
                        <Text fw={800} size="lg">Building prompt...</Text>
                        <Text size="sm" c="dimmed">+ Repomap injected</Text>
                        <Badge color="blue" variant="light" mt="sm">Cost Est: $0.002</Badge>
                      </div>
                    </Group>
                  </Paper>
                </div>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Title order={3} fw={900} mb="md" size="h2" c="dark.9">
                  Step 2: Type your request
                </Title>
                <Text size="lg" c="dimmed" lh={1.7} mb="xl">
                  In the central chat view, tell the LLM exactly what you want it to build or refactor. Frugaast automatically bundles your selected files and injects a highly compressed repomap, giving the LLM deep awareness of your project structure without the token bloat.
                </Text>
                <Paper radius="lg" p="xl" className={classes.featureAlert} style={{ borderLeftColor: 'var(--mantine-color-blue-5)' }}>
                  <Group gap="sm" mb="xs">
                    <DollarSign size={20} color="var(--mantine-color-blue-6)" />
                    <Text fw={800} c="dark.9">Total Cost Transparency:</Text>
                  </Group>
                  <Text c="dimmed" lh={1.6}>See the exact token count and estimated API cost <i>before</i> you hit send. Want to use a web interface instead? The prompt builder lets you copy the optimized context to your clipboard in one click.</Text>
                </Paper>
              </Grid.Col>
            </Grid>
          </Box>

          {/* STEP 3 */}
          <Box className={classes.stepBlock}>
            <div className={classes.watermarkNumber}>03</div>
            <Grid gutter={60} align="center" className={classes.stepContent}>
              <Grid.Col span={{ base: 12, md: 6 }} order={{ base: 2, md: 1 }}>
                <Title order={3} fw={900} mb="md" size="h2" c="dark.9">
                  Step 3: Send, Review, and Commit
                </Title>
                <Text size="lg" c="dimmed" lh={1.7} mb="xl">
                  Hit send to your preferred model (Claude, GPT-4, or Local Ollama). The assistant streams the diffs back and perfectly applies the edits to your local files. Every change is instantly wrapped in a clean Git commit.
                </Text>
                <Paper radius="lg" p="xl" className={classes.featureAlert} style={{ borderLeftColor: 'var(--mantine-color-teal-5)' }}>
                  <Group gap="sm" mb="xs">
                    <GitPullRequest size={20} color="var(--mantine-color-teal-6)" />
                    <Text fw={800} c="dark.9">Smart File Fetching:</Text>
                  </Group>
                  <Text c="dimmed" lh={1.6}>If the LLM realizes it needs to see a missing file (like a schema or utility function), it can securely request it. Frugaast adds it to the context and continues—without triggering an uncontrolled agentic loop.</Text>
                </Paper>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }} order={{ base: 1, md: 2 }}>
                <div className={`${classes.visualPanel} ${classes.bgGradientTeal}`}>
                  <Paper radius="xl" p="xl" shadow="xl" className={classes.floatingElement}>
                    <Stack align="center" gap="sm">
                      <ThemeIcon size={64} radius="xl" color="teal" variant="light">
                        <GitCommit size={32} />
                      </ThemeIcon>
                      <Text fw={800} size="lg">Edits Applied</Text>
                      <Badge color="teal" variant="dot" size="lg">git commit -m "feat: added auth"</Badge>
                    </Stack>
                  </Paper>
                </div>
              </Grid.Col>
            </Grid>
          </Box>

        </Container>
      </section>

      {/* 3. UNDER THE HOOD SECTION */}
      <section className={sharedClasses.section}>
        <Container size="md">
          <Stack align="center" mb={60} ta="center">
            <Badge color="dark" variant="outline" mb="sm" size="lg" radius="sm" fw={700}>Under the Hood</Badge>
            <Title order={2} className={sharedClasses.sectionTitle}>
              Why Frugaast keeps your codebase maintainable.
            </Title>
            <Text c="dark.5" size="xl" fw={600}>
              Agents are for prototypes. Frugaast is for production.
            </Text>
            <Text size="lg" c="dimmed" maw={800} mt="md" lh={1.6}>
              If you are tired of AI generating spaghetti code, you should be. The hype demands autonomy, but mature codebases demand precision. Here is why curating context beats autonomous agents every time.
            </Text>
          </Stack>

          {/* Stacked Comparison Panels */}
          <Stack gap="xl" mb={80}>
            
            {/* The Old Way */}
            <Card radius="2rem" p={0} className={classes.comparisonCardBad}>
              <Grid gutter={0}>
                <Grid.Col span={{ base: 12, sm: 4 }} className={classes.badSidebar}>
                  <Center h="100%" p="xl">
                    <Stack align="center">
                      <ShieldAlert size={64} color="var(--mantine-color-red-5)" />
                      <Title order={4} c="white" fw={800} ta="center">The Agentic Loop</Title>
                    </Stack>
                  </Center>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 8 }} p={40}>
                  <Title order={4} fw={800} mb="sm" c="red.9">How agents generate tech debt:</Title>
                  <Text c="dark.7" size="lg" lh={1.6}>
                    They grep your entire repo, flood the context window with hundreds of thousands of tokens, and attempt to write code autonomously. Because they lack your architectural context, they reinvent the wheel, hallucinate dependencies, edit random files, and quickly burn through your API limits while stuck in error-correction loops.
                  </Text>
                </Grid.Col>
              </Grid>
            </Card>

            {/* The Frugaast Way */}
            <Card radius="2rem" p={0} className={classes.comparisonCardGood}>
              <Grid gutter={0}>
                <Grid.Col span={{ base: 12, sm: 4 }} className={classes.goodSidebar}>
                  <Center h="100%" p="xl">
                    <Stack align="center">
                      <Sparkles size={64} color="white" />
                      <Title order={4} c="white" fw={800} ta="center">The Frugaast Way</Title>
                    </Stack>
                  </Center>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 8 }} p={40}>
                  <Title order={4} fw={800} mb="sm" c="teal.9">Surgical strikes, guided by you:</Title>
                  <Text c="dark.7" size="lg" lh={1.6} mb="md">
                    You know what you want to build. You define the exact boundaries. Frugaast’s Nuitka-compiled Python sidecar parses your code at blistering speeds, generating a precise AST-based repomap. 
                  </Text>
                  <Paper bg="teal.0" p="md" radius="md">
                    <Text c="teal.9" size="md" fw={700} lh={1.6}>
                      The LLM gets a high-signal, low-noise prompt. It executes exactly what you asked for, and nothing else. You maintain ownership of the design.
                    </Text>
                  </Paper>
                </Grid.Col>
              </Grid>
            </Card>

          </Stack>

          {/* Imperfections Divider/List */}
          <Box className={classes.imperfectionsBox}>
            <Title order={3} ta="center" mb="xl" fw={800} size="h2">
              A UI built for developers, not tourists:
            </Title>
            
            <Grid gutter={40} mt={40}>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Group wrap="nowrap" align="flex-start">
                  <ThemeIcon size={40} radius="xl" color="dark" variant="white" shadow="sm"><History size={20}/></ThemeIcon>
                  <div>
                    <Text fw={800} size="lg" mb="4px">Session Time-Travel:</Text>
                    <Text c="dimmed" lh={1.5} size="sm">The right sidebar tracks your chat history. Re-add files from a previous session or copy old prompts in a single click.</Text>
                  </div>
                </Group>
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Group wrap="nowrap" align="flex-start">
                  <ThemeIcon size={40} radius="xl" color="dark" variant="white" shadow="sm"><Cpu size={20}/></ThemeIcon>
                  <div>
                    <Text fw={800} size="lg" mb="4px">Native Performance:</Text>
                    <Text c="dimmed" lh={1.5} size="sm">Built with Tauri for a lightweight UI, powered by a compiled Python sidecar for heavy lifting. No sluggish Electron wrappers.</Text>
                  </div>
                </Group>
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Group wrap="nowrap" align="flex-start">
                  <ThemeIcon size={40} radius="xl" color="dark" variant="white" shadow="sm"><Settings2 size={20}/></ThemeIcon>
                  <div>
                    <Text fw={800} size="lg" mb="4px">Multi-Model & Tabbed:</Text>
                    <Text c="dimmed" lh={1.5} size="sm">Juggle multiple tasks in tabbed workspaces. Instantly swap between OpenAI, Anthropic, or local open-source models.</Text>
                  </div>
                </Group>
              </Grid.Col>
            </Grid>
          </Box>
        </Container>
      </section>

      {/* 4. THE CTA SECTION */}
      <section className={sharedClasses.ctaSection}>
        <Container size="md" className={sharedClasses.ctaContainer}>
          <Title order={2} className={sharedClasses.ctaTitle} mb="sm">
            Ready to take back control of your codebase?
          </Title>
          <Title order={3} size="h2" c="violet.2" fw={700}>
            Stop exploring. Start shipping.
          </Title>
          
          <Text size="xl" c="white" maw={700} lh={1.6} mt="xl" opacity={0.9}>
            You are the senior developer. The AI is just an exceptionally fast typist. Keep it that way by giving it the right boundaries, the right context, and explicit instructions.
          </Text>
          <Text size="xl" c="white" maw={700} lh={1.6} mt="sm" mb="xl" fw={600}>
            Get the 3x speed boost without the agentic tech debt.
          </Text>

          <Button 
            size="xl" 
            radius="xl" 
            className={classes.buttonCta} 
            mt="md"
            rightSection={<ChevronRight size={20} />}
          >
            Download Frugaast
          </Button>
          <Text size="sm" mt="lg" c="violet.2" fw={500} opacity={0.8}>
            Available for Mac, Windows, and Linux. Bring your own API key.
          </Text>
        </Container>
        
        {/* Decorative CTA glow */}
        <div className={classes.ctaGlow} />
      </section>

    </MarketingLayout>
  );
}