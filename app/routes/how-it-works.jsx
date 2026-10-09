import {
  Container, Title, Text, Button, Group, Stack, Grid, Card,
  ThemeIcon, Badge, Paper, Center, Box, SimpleGrid, Kbd, Table, List
} from '@mantine/core';
import {
  KeyRound, FolderGit2, Layers, MessageSquareCode, GitCommit, ShieldAlert,
  Sparkles, ChevronRight, ImageIcon, Server, Globe, History, BarChart3,
  Binary, Lock, Search, Network, Undo2, Eye, HardDrive, PanelLeft,
  PanelRight, LayoutPanelTop, Keyboard
} from 'lucide-react';
import { MarketingLayout } from '../components/MarketingLayout';

import sharedClasses from '../styles/shared.module.css';
import classes from './how-it-works.module.css';

// Required screenshot paths for the marketing page.
// Drop images in public/images/how-it-works/ with these exact file names.
const SCREENSHOT_PATHS = {
  main: '/images/how-it-works/main_screenshot.png',
  settings: '/images/how-it-works/settings_screenshot.png',
  workspace: '/images/how-it-works/workspace_screenshot.png',
  context: '/images/how-it-works/context_screenshot.png',
  assistant: '/images/how-it-works/assistant_screenshot.png',
  review: '/images/how-it-works/review_screenshot.png',
  webChatbot: '/images/how-it-works/web_chatbot_screenshot.png',
  remote: '/images/how-it-works/remote_screenshot.png',
  costs: '/images/how-it-works/costs_screenshot.png',
};

export const meta = () => {
  return [
    { title: "How it Works | Frugäast AI Coding Assistant" },
    { name: "description", content: "A tour of Frugäast: curate exactly the context your model sees, ask or code, then review every edit as a Git commit. Works on local repositories and remote hosts over SSH." }
  ];
};

// Screenshots: drop the files in public/images/how-it-works/ and set `src`.
// While `src` is null, a labelled placeholder is rendered instead.
const SCREENSHOTS = {
  overview:      { src: SCREENSHOT_PATHS.main, alt: "Frugäast main window with left sidebar, Assistant view and Git History" },
  settings:      { src: SCREENSHOT_PATHS.settings, alt: "Models dialog with a model ID, API base and context window" },
  workspace:     { src: SCREENSHOT_PATHS.workspace, alt: "Workspace menu with Open local workspace and Connect to host…" },
  context:       { src: SCREENSHOT_PATHS.context, alt: "Explorer with files added to the Prompt Builder, one marked read-only" },
  assistant:     { src: SCREENSHOT_PATHS.assistant, alt: "Assistant view in Code mode with the token and cost estimate" },
  review:        { src: SCREENSHOT_PATHS.review, alt: "File access approval and the resulting commit in Git History" },
  webChatbot:    { src: SCREENSHOT_PATHS.webChatbot, alt: "Web Chatbot view: copy context, copy prompt, paste and apply edits" },
  remote:        { src: SCREENSHOT_PATHS.remote, alt: "Connect to host dialog and the remote folder picker" },
  costs:         { src: SCREENSHOT_PATHS.costs, alt: "Costs view with spending over time stacked by model" },
};

function Screenshot({ shot, aspect = '16 / 10', className = '' }) {
  if (shot.src) {
    return (
      <div className={`${classes.screenshotFrame} ${className}`}>
        <img src={shot.src} alt={shot.alt} className={classes.screenshotImg} loading="lazy" />
      </div>
    );
  }
  return (
    <div className={`${classes.screenshotPlaceholder} ${className}`} style={{ aspectRatio: aspect }}>
      <Stack align="center" gap={6} px="lg">
        <ImageIcon size={32} strokeWidth={1.5} />
        <Text fw={700} size="sm" ta="center">Screenshot</Text>
        <Text size="xs" ta="center" maw={320}>{shot.alt}</Text>
      </Stack>
    </div>
  );
}

const STEPS = [
  {
    icon: KeyRound,
    color: 'violet',
    title: 'Bring your own keys and models',
    body: (
      <>
        From the gear menu, add your provider keys under <b>API Keys</b> (e.g. <code>OPENAI_API_KEY</code>) and list
        the models you want under <b>Models</b>. Any LiteLLM model ID works, such as <code>gemini/gemini-2.5-flash-lite</code>.
        Point the API base at a compatible server on your machine to use a local model.
      </>
    ),
    callout: {
      icon: HardDrive,
      title: 'Your keys stay on your computer',
      text: 'Keys, models and settings live in your local Frugäast config directory, never in the repository and never on a remote host.',
    },
    shot: SCREENSHOTS.settings,
  },
  {
    icon: FolderGit2,
    color: 'indigo',
    title: 'Open a workspace',
    body: (
      <>
        Open any Git repository from the workspace menu, or choose <b>Connect to host…</b> to work on a repository
        on another machine over SSH. Each repository gets its own tab with its own chat, context and operations,
        so you can run tasks in several projects side by side.
      </>
    ),
    callout: {
      icon: Server,
      title: 'Local or remote, same interface',
      text: 'Remote workspaces use the same Explorer, Assistant and Git panels. Model calls still go out from your desktop, so the remote host needs no credentials or internet access.',
    },
    shot: SCREENSHOTS.workspace,
  },
  {
    icon: Layers,
    color: 'blue',
    title: 'Pick the context, file by file',
    body: (
      <>
        In the left sidebar, find files by name in <b>Explorer</b>, by content in <b>Search</b>, or by symbol in <b>Extend</b>,
        which ranks related files from the repository map. Click <b>+</b> to add a file to the Prompt Builder.
        The lock icon marks a file as <b>read-only</b>: the model can read it but not edit it.
      </>
    ),
    callout: {
      icon: Network,
      title: 'Optional sources',
      text: 'Add a token-budgeted repository map, a workspace tree, or static reference files such as AGENTS.md that come with every prompt.',
    },
    shot: SCREENSHOTS.context,
  },
  {
    icon: MessageSquareCode,
    color: 'cyan',
    title: 'Ask, or let it code',
    body: (
      <>
        Choose <b>Ask</b> for questions without edits, or <b>Code</b> for changes. Pick the main or weak model and type your
        request. Type a few characters to autocomplete file paths and symbols, or <Kbd>`</Kbd> for a longer list.
        The Prompt Builder shows the estimated tokens and cost before you press <Kbd>Enter</Kbd>.
      </>
    ),
    callout: {
      icon: Eye,
      title: 'Nothing hidden',
      text: 'Preview Prompt shows the exact system, user and assistant messages that will be sent, without calling the model.',
    },
    shot: SCREENSHOTS.assistant,
  },
  {
    icon: GitCommit,
    color: 'teal',
    title: 'Approve, review, undo',
    body: (
      <>
        If the model needs a file you didn't include, it asks, and you <b>Allow</b> or <b>Deny</b>.
        In Code mode, edits are applied as precise SEARCH/REPLACE blocks and committed to Git.
        Review them in <b>Git History</b>, stage and commit your own changes there, and use <b>Undo</b> to revert the last assistant commit.
      </>
    ),
    callout: {
      icon: Undo2,
      title: 'Every change is a commit',
      text: 'No silent rewrites across your repository. Each edit is a Git commit you can inspect, diff, or roll back.',
    },
    shot: SCREENSHOTS.review,
  },
];

const LAYOUT = [
  {
    icon: PanelLeft,
    title: 'Left sidebar',
    items: ['Explorer, Search and Extend to find files', 'Prompt Builder: your context, optional sources, token and cost estimate'],
  },
  {
    icon: LayoutPanelTop,
    title: 'Main area',
    items: ['Assistant: chat in Ask or Code mode', 'Web Chatbot, Costs, Code Explore, Files and diffs'],
  },
  {
    icon: PanelRight,
    title: 'Right sidebar',
    items: ['Chat History: continue any past session', 'Git History: changes, commit, branch graph'],
  },
];

const EXTRAS = [
  {
    icon: Globe,
    color: 'grape',
    title: 'Use a chatbot you already pay for',
    text: 'The Web Chatbot view copies your curated context and a SEARCH/REPLACE prompt for ChatGPT, Claude.ai or any other chatbot. Paste the reply back and click Apply Edits: same edit and commit pipeline as Code mode, no API cost.',
    shot: SCREENSHOTS.webChatbot,
  },
  {
    icon: Server,
    color: 'indigo',
    title: 'Work on remote machines over SSH',
    text: 'Connect using your existing ~/.ssh/config. Frugäast installs a small offline helper on the host that reads files and performs Git changes there. History, costs and settings stay on your desktop.',
    shot: SCREENSHOTS.remote,
  },
  {
    icon: BarChart3,
    color: 'orange',
    title: 'Know exactly what you spend',
    text: 'The Costs view breaks down spending by model and over time, lists your most expensive sessions, compares response times, and shows the per-million-token price of each model you use.',
    shot: SCREENSHOTS.costs,
  },
];

const SMALL_FEATURES = [
  { icon: History, title: 'Continue any session', text: 'Chat History groups sessions by day with their cost. Continue one in the Assistant, or re-add the files it used.' },
  { icon: Binary, title: 'Code Explore', text: 'Browse every symbol definition and reference in the repository map, then jump straight to the line.' },
  { icon: Search, title: 'Respects your ignores', text: 'File listing and search honour .gitignore and .frugaastignore. .git/ and .frugaast/ are always hidden.' },
  { icon: Lock, title: 'One task per workspace', text: 'Each workspace runs one operation at a time, so edits never collide. Other tabs keep working in the background.' },
];

const SHORTCUTS = [
  [['Ctrl/⌘', 'B'], 'Toggle left sidebar'],
  [['Ctrl/⌘', 'J'], 'Toggle right sidebar'],
  [['Ctrl', 'Alt', 'A'], 'Focus “Find files by name”'],
  [['Enter'], 'Send message'],
  [['Shift', 'Enter'], 'New line in the chat input'],
  [['`'], 'Symbol autocomplete in the chat input'],
  [['Ctrl/⌘', 'Enter'], 'Commit from the message box'],
  [['Ctrl/⌘', 'W'], 'Close the active file tab'],
  [['Esc'], 'Close dialogs, deny file access, clear filter'],
];

export default function HowItWorks() {
  return (
    <MarketingLayout>

      {/* 1. HERO SECTION */}
      <section className={sharedClasses.hero}>
        <div className={classes.gridBackground} />

        <Container size="md" className={classes.heroContent} ta="center">
          <Badge className={sharedClasses.pillBadge} color="violet" variant="outline" size="lg" radius="xl" mb="lg">
            How it works
          </Badge>
          <Title className={sharedClasses.heroTitle} order={1}>
            You choose the context. <br />
            <span className={sharedClasses.textGradient}>The model writes the code.</span>
          </Title>

          <Text className={sharedClasses.heroSubtitle} size="xl" mt="xl" lh={1.6}>
            Frugäast is a desktop coding assistant for Git repositories, local or over SSH.
            Instead of letting an agent roam your codebase, you hand the model exactly the files it needs,
            see the cost up front, and review every edit as a Git commit.
          </Text>
        </Container>

        <Container size="lg" mt={60} className={classes.heroContent}>
          <Screenshot shot={SCREENSHOTS.overview} className={classes.heroShot} />
        </Container>
      </section>

      {/* 2. LAYOUT AT A GLANCE */}
      <section className={sharedClasses.section}>
        <Container size="lg">
          <Stack align="center" mb={50} ta="center">
            <Title order={2} className={sharedClasses.sectionTitle}>One window, three columns</Title>
            <Text size="lg" c="dimmed" maw={680} lh={1.6}>
              Each open repository is a tab. Inside it, everything sits side by side, so you never lose sight of what the model sees or what it changed.
            </Text>
          </Stack>
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
            {LAYOUT.map(({ icon: Icon, title, items }) => (
              <Paper key={title} radius="xl" p="xl" className={classes.layoutCard}>
                <ThemeIcon size={48} radius="md" color="violet" variant="light" mb="md">
                  <Icon size={24} />
                </ThemeIcon>
                <Text fw={800} size="lg" mb="sm" c="dark.9">{title}</Text>
                <List spacing={6} size="sm" c="dimmed">
                  {items.map((item) => <List.Item key={item}>{item}</List.Item>)}
                </List>
              </Paper>
            ))}
          </SimpleGrid>
        </Container>
      </section>

      {/* 3. THE STEP-BY-STEP SECTION (Zig-Zag Layout) */}
      <section className={sharedClasses.sectionAlt}>
        <Container size="lg">
          <Stack align="center" mb={20} ta="center">
            <Badge color="dark" variant="outline" size="lg" radius="sm" fw={700}>The workflow</Badge>
            <Title order={2} className={sharedClasses.sectionTitle}>From request to commit in five steps</Title>
          </Stack>

          {STEPS.map((step, i) => {
            const reversed = i % 2 === 1;
            const Icon = step.icon;
            const CalloutIcon = step.callout.icon;
            return (
              <Box key={step.title} className={classes.stepBlock}>
                <div className={reversed ? classes.watermarkNumberRight : classes.watermarkNumber}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <Grid gutter={60} align="center" className={classes.stepContent}>
                  <Grid.Col span={{ base: 12, md: 6 }} order={{ base: 2, md: reversed ? 2 : 1 }}>
                    <Group gap="sm" mb="md">
                      <ThemeIcon size={40} radius="md" color={step.color} variant="light">
                        <Icon size={22} />
                      </ThemeIcon>
                      <Text fw={700} c={`${step.color}.6`} tt="uppercase" size="sm">Step {i + 1}</Text>
                    </Group>
                    <Title order={3} fw={900} mb="md" size="h2" c="dark.9">{step.title}</Title>
                    <Text size="lg" c="dimmed" lh={1.7} mb="xl">{step.body}</Text>
                    <Paper radius="lg" p="xl" className={classes.featureAlert} style={{ borderLeftColor: `var(--mantine-color-${step.color}-5)` }}>
                      <Group gap="sm" mb="xs">
                        <CalloutIcon size={20} color={`var(--mantine-color-${step.color}-6)`} />
                        <Text fw={800} c="dark.9">{step.callout.title}</Text>
                      </Group>
                      <Text c="dimmed" lh={1.6}>{step.callout.text}</Text>
                    </Paper>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }} order={{ base: 1, md: reversed ? 1 : 2 }}>
                    <Screenshot shot={step.shot} />
                  </Grid.Col>
                </Grid>
              </Box>
            );
          })}
        </Container>
      </section>

      {/* 4. MORE WAYS TO WORK */}
      <section className={sharedClasses.section}>
        <Container size="lg">
          <Stack align="center" mb={60} ta="center">
            <Title order={2} className={sharedClasses.sectionTitle}>More ways to work</Title>
            <Text size="lg" c="dimmed" maw={680} lh={1.6}>
              The same context and the same Git pipeline, wherever your model and your code live.
            </Text>
          </Stack>

          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
            {EXTRAS.map(({ icon: Icon, color, title, text, shot }) => (
              <Card key={title} radius="xl" p="lg" className={classes.extraCard}>
                <Card.Section>
                  <Screenshot shot={shot} aspect="4 / 3" className={classes.cardShot} />
                </Card.Section>
                <Group gap="sm" mt="lg" mb="sm" wrap="nowrap">
                  <ThemeIcon size={36} radius="md" color={color} variant="light"><Icon size={20} /></ThemeIcon>
                  <Text fw={800} size="lg" c="dark.9" lh={1.3}>{title}</Text>
                </Group>
                <Text c="dimmed" size="sm" lh={1.6}>{text}</Text>
              </Card>
            ))}
          </SimpleGrid>

          <Box className={classes.imperfectionsBox}>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing={40}>
              {SMALL_FEATURES.map(({ icon: Icon, title, text }) => (
                <Group key={title} wrap="nowrap" align="flex-start">
                  <ThemeIcon size={40} radius="xl" color="dark" variant="white" className={classes.smallIcon}><Icon size={20} /></ThemeIcon>
                  <div>
                    <Text fw={800} mb={4}>{title}</Text>
                    <Text c="dimmed" lh={1.5} size="sm">{text}</Text>
                  </div>
                </Group>
              ))}
            </SimpleGrid>
          </Box>
        </Container>
      </section>

      {/* 5. WHY NOT AN AGENT */}
      <section className={sharedClasses.sectionAlt}>
        <Container size="md">
          <Stack align="center" mb={60} ta="center">
            <Badge color="dark" variant="outline" size="lg" radius="sm" fw={700}>Why it's built this way</Badge>
            <Title order={2} className={sharedClasses.sectionTitle}>
              Agents are for prototypes. Frugäast is for production.
            </Title>
          </Stack>

          <Stack gap="xl">
            <Card radius="2rem" p={0} className={classes.comparisonCardBad}>
              <Grid gutter={0}>
                <Grid.Col span={{ base: 12, sm: 4 }} className={classes.badSidebar}>
                  <Center h="100%" p="xl">
                    <Stack align="center">
                      <ShieldAlert size={64} color="var(--mantine-color-red-5)" />
                      <Title order={4} c="white" fw={800} ta="center">The agentic loop</Title>
                    </Stack>
                  </Center>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 8 }} p={40}>
                  <Text c="dark.7" size="lg" lh={1.6}>
                    Agents grep your whole repository, flood the context window, and edit autonomously. Without your architectural context,
                    they reinvent helpers, touch files they shouldn't, and burn through API budget in error-correction loops.
                  </Text>
                </Grid.Col>
              </Grid>
            </Card>

            <Card radius="2rem" p={0} className={classes.comparisonCardGood}>
              <Grid gutter={0}>
                <Grid.Col span={{ base: 12, sm: 4 }} className={classes.goodSidebar}>
                  <Center h="100%" p="xl">
                    <Stack align="center">
                      <Sparkles size={64} color="white" />
                      <Title order={4} c="white" fw={800} ta="center">The Frugäast way</Title>
                    </Stack>
                  </Center>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 8 }} p={40}>
                  <Text c="dark.7" size="lg" lh={1.6} mb="md">
                    You define the boundaries: which files are in, which are read-only, how big the repository map is.
                    The model can ask for more, but only you can say yes.
                  </Text>
                  <Paper bg="teal.0" p="md" radius="md">
                    <Text c="teal.9" size="md" fw={700} lh={1.6}>
                      A high-signal prompt, a known cost, and a reviewable commit. You keep ownership of the design.
                    </Text>
                  </Paper>
                </Grid.Col>
              </Grid>
            </Card>
          </Stack>
        </Container>
      </section>

      {/* 6. KEYBOARD SHORTCUTS */}
      <section className={sharedClasses.section}>
        <Container size="sm">
          <Stack align="center" mb={40} ta="center">
            <ThemeIcon size={56} radius="md" color="violet" variant="light"><Keyboard size={28} /></ThemeIcon>
            <Title order={2} className={sharedClasses.sectionTitle}>Keyboard first</Title>
          </Stack>
          <Paper radius="xl" p="md" className={classes.layoutCard}>
            <Table verticalSpacing="sm" horizontalSpacing="md">
              <Table.Tbody>
                {SHORTCUTS.map(([keys, action]) => (
                  <Table.Tr key={action}>
                    <Table.Td className={classes.keysCell}>
                      {keys.map((k, j) => (
                        <span key={k}>{j > 0 && ' + '}<Kbd>{k}</Kbd></span>
                      ))}
                    </Table.Td>
                    <Table.Td c="dimmed">{action}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
          <Text size="sm" c="dimmed" ta="center" mt="lg">
            The free version lets you keep up to 3 workspaces open at once. <a href="/pricing" className={classes.inlineLink}>See pricing</a> for Pro.
          </Text>
        </Container>
      </section>

      {/* 7. THE CTA SECTION */}
      <section className={sharedClasses.ctaSection}>
        <Container size="md" className={sharedClasses.ctaContainer}>
          <Title order={2} className={sharedClasses.ctaTitle} mb="sm">
            Ready to take back control of your codebase?
          </Title>
          <Text size="xl" c="white" maw={700} lh={1.6} mt="xl" mb="xl" opacity={0.9}>
            You are the senior developer. The AI is an exceptionally fast typist. Give it the right context and explicit instructions, and review what it ships.
          </Text>

          <Button
            component="a"
            href="/download"
            size="xl"
            radius="xl"
            className={classes.buttonCta}
            mt="md"
            rightSection={<ChevronRight size={20} />}
          >
            Download Frugäast
          </Button>
          <Text size="sm" mt="lg" c="violet.2" fw={500} opacity={0.8}>
            Available for Windows, macOS and Linux. Bring your own API key.
          </Text>
        </Container>

        <div className={classes.ctaGlow} />
      </section>

    </MarketingLayout>
  );
}
