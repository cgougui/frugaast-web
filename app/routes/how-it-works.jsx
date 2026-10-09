import { useState } from 'react';
import {
  Container, Title, Text, Button, Group, Stack, Grid, Card,
  ThemeIcon, Badge, Paper, Center, Box, SimpleGrid, Kbd, Table, List, Modal
} from '@mantine/core';
import {
  KeyRound, FolderGit2, Layers, MessageSquareCode, GitCommit, ShieldAlert,
  Sparkles, ChevronRight, ImageIcon, Server, Globe, History, BarChart3,
  Binary, Lock, Search, Network, Undo2, Eye, HardDrive, PanelLeft,
  PanelRight, LayoutPanelTop, Keyboard, ZoomIn, ZoomOut
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
    { name: "description", content: "Choose files, estimate cost, and review AI edits as Git commits. Frugäast works with your models on local repositories or remote hosts over SSH." }
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

function Screenshot({ shot, onOpen, aspect = '16 / 10', className = '' }) {
  if (shot.src) {
    return (
      <button
        type="button"
        className={`${classes.screenshotFrame} ${className}`}
        onClick={() => onOpen(shot)}
        aria-label={`Enlarge screenshot: ${shot.alt}`}
        aria-haspopup="dialog"
      >
        <img src={shot.src} alt={shot.alt} className={classes.screenshotImg} loading="lazy" />
        <span className={classes.screenshotHint} aria-hidden="true">
          <ZoomIn size={16} /> View full size
        </span>
      </button>
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

function ScreenshotViewer({ shot, opened, onClose }) {
  const [actualSize, setActualSize] = useState(false);

  return (
    <Modal.Root
      opened={opened}
      onClose={onClose}
      onExitTransitionEnd={() => setActualSize(false)}
      size="calc(100vw - 2rem)"
      xOffset="1rem"
      yOffset="1rem"
      centered
      padding="md"
      radius="lg"
      classNames={{
        content: classes.viewerContent,
        header: classes.viewerHeader,
        body: classes.viewerBody,
      }}
    >
      <Modal.Overlay backgroundOpacity={0.85} blur={6} />
      <Modal.Content>
        <Modal.Header>
          <Modal.Title fw={600}>Screenshot</Modal.Title>
          <Group gap="sm" wrap="nowrap">
            <Button
              size="xs"
              variant="light"
              color="gray"
              leftSection={actualSize ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
              onClick={() => setActualSize((value) => !value)}
              aria-pressed={actualSize}
            >
              {actualSize ? 'Fit to screen' : 'Actual size'}
            </Button>
            <Modal.CloseButton aria-label="Close screenshot" data-autofocus />
          </Group>
        </Modal.Header>
        <Modal.Body>
          <div className={`${classes.viewerViewport} ${actualSize ? classes.viewerActualSize : ''}`}>
            {shot && (
              <button
                type="button"
                className={classes.viewerImageButton}
                onClick={() => setActualSize((value) => !value)}
                aria-label={actualSize ? 'Fit screenshot to screen' : 'View screenshot at actual size'}
                aria-pressed={actualSize}
              >
                <img src={shot.src} alt={shot.alt} className={classes.viewerImage} draggable="false" />
              </button>
            )}
          </div>
          <Text size="sm" className={classes.viewerCaption}>{shot?.alt}</Text>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}

const STEPS = [
  {
    icon: KeyRound,
    color: 'violet',
    title: 'Configure keys and models',
    items: [
      <><strong>API Keys:</strong> add provider keys from the gear menu, e.g. <code>OPENAI_API_KEY</code>.</>,
      <><strong>Models:</strong> use any LiteLLM model ID, e.g. <code>gemini/gemini-2.5-flash-lite</code>.</>,
      <><strong>Local models:</strong> set the API base to a compatible server on your machine.</>,
    ],
    callout: {
      icon: HardDrive,
      title: 'Local configuration',
      text: <>Keys, model definitions and settings stay in your <strong>local Frugäast config directory</strong>, outside repositories and remote hosts.</>,
    },
    shot: SCREENSHOTS.settings,
  },
  {
    icon: FolderGit2,
    color: 'indigo',
    title: 'Open a workspace',
    items: [
      <><strong>Local:</strong> open any Git repository from the workspace menu.</>,
      <><strong>Remote:</strong> choose <strong>Connect to host…</strong> to open a repository over SSH.</>,
      <><strong>One tab per repository:</strong> separate chat, context and operations. Run projects side by side.</>,
    ],
    callout: {
      icon: Server,
      title: 'Same panels over SSH',
      text: <>Use the same Explorer, Assistant and Git panels. <strong>Model calls run from your desktop</strong>; the host needs no model credentials or internet access.</>,
    },
    shot: SCREENSHOTS.workspace,
  },
  {
    icon: Layers,
    color: 'blue',
    title: 'Select context',
    items: [
      <><strong>Find files:</strong> Explorer by name, Search by content, or Extend by symbol, with related files ranked from the repository map.</>,
      <><strong>Add context:</strong> click <strong>+</strong> to add a file to the Prompt Builder.</>,
      <><strong>Read-only:</strong> lock a file to allow reading and prevent edits.</>,
    ],
    callout: {
      icon: Network,
      title: 'Optional sources',
      text: <>Include a <strong>repository map</strong> with a token budget, a workspace tree, or reference files such as <code>AGENTS.md</code> in every prompt.</>,
    },
    shot: SCREENSHOTS.context,
  },
  {
    icon: MessageSquareCode,
    color: 'cyan',
    title: 'Send a request',
    items: [
      <><strong>Mode:</strong> Ask answers questions without edits; Code makes changes.</>,
      <><strong>Model:</strong> choose the main or weak model, then write your request.</>,
      <><strong>Autocomplete:</strong> type to find paths and symbols; use <Kbd>`</Kbd> for a longer list.</>,
      <><strong>Estimate:</strong> check tokens and cost in the Prompt Builder before pressing <Kbd>Enter</Kbd>.</>,
    ],
    callout: {
      icon: Eye,
      title: 'Inspect the prompt',
      text: <><strong>Preview Prompt</strong> shows the exact system, user and assistant messages before any model call.</>,
    },
    shot: SCREENSHOTS.assistant,
  },
  {
    icon: GitCommit,
    color: 'teal',
    title: 'Review changes',
    items: [
      <><strong>File access:</strong> Allow or Deny requests for files outside your selected context.</>,
      <><strong>Edits:</strong> Code mode applies SEARCH/REPLACE blocks and commits the changes to Git.</>,
      <><strong>Git History:</strong> inspect diffs, or stage and commit your own changes.</>,
      <><strong>Undo:</strong> revert the last assistant commit.</>,
    ],
    callout: {
      icon: Undo2,
      title: 'Changes you can trace',
      text: <>Assistant changes become <strong>Git commits</strong> you can inspect, diff and roll back.</>,
    },
    shot: SCREENSHOTS.review,
  },
];

const LAYOUT = [
  {
    icon: PanelLeft,
    title: 'Left sidebar: build you context',
    items: [
      <><strong>Find files:</strong> by name, via search, via code exploration.</>,
      <><strong>Prompt Builder:</strong> control context size and estimate the cost.</>,
    ],
  },
  {
    icon: LayoutPanelTop,
    title: 'Main area: call the LLM',
    items: [
      <><strong>Assistant:</strong> Ask or Code mode via API.</>,
      <><strong>Web Chatboot:</strong> copy files and apply edits easily.</>,
      <><strong>Cost:</strong> dashboard analysis of all your costs.</>,
    ],
  },
  {
    icon: PanelRight,
    title: 'Right sidebar: inspect the results',
    items: [
      <><strong>Chat History:</strong> view costs, resume sessions.</>,
      <><strong>Git History:</strong> changes, commits and branch graph.</>,
    ],
  },
];

const EXTRAS = [
  {
    icon: Globe,
    color: 'grape',
    title: 'Use a web chatbot',
    items: [
      <><strong>Copy:</strong> selected context and a SEARCH/REPLACE prompt from Web Chatbot into ChatGPT, Claude.ai or another chatbot.</>,
      <><strong>Apply:</strong> paste the reply back and click Apply Edits. Same edit and commit pipeline as Code mode.</>,
      <><strong>No API cost:</strong> use your existing chatbot plan.</>,
    ],
    shot: SCREENSHOTS.webChatbot,
  },
  {
    icon: Server,
    color: 'indigo',
    title: 'Work over SSH',
    items: [
      <><strong>Connect:</strong> use your existing <code>~/.ssh/config</code>.</>,
      <><strong>Remote helper:</strong> Frugäast installs a small offline helper to read files and perform Git operations on the host.</>,
      <><strong>Local data:</strong> history, costs and settings stay on your desktop.</>,
    ],
    shot: SCREENSHOTS.remote,
  },
  {
    icon: BarChart3,
    color: 'orange',
    title: 'Track costs',
    items: [
      <><strong>Spending:</strong> totals by model and over time; most expensive sessions.</>,
      <><strong>Performance:</strong> compare response times.</>,
      <><strong>Pricing:</strong> cost per million tokens for each model you use.</>,
    ],
    shot: SCREENSHOTS.costs,
  },
];

const SMALL_FEATURES = [
  { icon: History, title: 'Resume sessions', text: <>Browse <strong>Chat History</strong> by day and cost. Resume a chat or restore its file context.</> },
  { icon: Binary, title: 'Code Explore', text: <>Browse <strong>symbol definitions and references</strong> in the repository map. Jump to the source line.</> },
  { icon: Search, title: 'Ignore rules', text: <>Listing and search respect <code>.gitignore</code> and <code>.frugaastignore</code>. <code>.git/</code> and <code>.frugaast/</code> stay hidden.</> },
  { icon: Lock, title: 'Workspace isolation', text: <><strong>One operation per workspace</strong> prevents edit collisions. Other tabs continue in the background.</> },
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
  const [selectedShot, setSelectedShot] = useState(null);
  const [viewerOpened, setViewerOpened] = useState(false);

  const openScreenshot = (shot) => {
    setSelectedShot(shot);
    setViewerOpened(true);
  };

  return (
    <MarketingLayout>
      <ScreenshotViewer shot={selectedShot} opened={viewerOpened} onClose={() => setViewerOpened(false)} />

      {/* 1. HERO SECTION */}
      <section className={sharedClasses.hero}>
        <div className={classes.gridBackground} />

        <Container size="md" className={classes.heroContent} ta="center">
          <Badge className={sharedClasses.pillBadge} color="violet" variant="outline" size="lg" radius="xl" mb="lg">
            How it works
          </Badge>
          <Title className={sharedClasses.heroTitle} order={1}>
            Select context. Generate code. <br />
            <span className={sharedClasses.textGradient}>Review the diff.</span>
          </Title>

          <Text className={sharedClasses.heroSubtitle} size="xl" mt="xl" lh={1.6}>
            A desktop AI coding assistant for <strong>Git repositories</strong>, local or over SSH.
            Control the <strong>file context</strong>, check the <strong>cost estimate</strong>,
            and review changes as <strong>Git commits</strong>.
          </Text>
        </Container>

        <Container size="lg" mt={60} className={classes.heroContent}>
          <Screenshot shot={SCREENSHOTS.overview} onOpen={openScreenshot} className={classes.heroShot} />
        </Container>
      </section>

      {/* 2. LAYOUT AT A GLANCE */}
      <section className={sharedClasses.section}>
        <Container size="lg">
          <Stack align="center" mb={50} ta="center">
            <Title order={2} className={sharedClasses.sectionTitle}>One tab per repository. Three panels.</Title>
            <Text size="lg" c="dimmed" maw={680} lh={1.6}>
              Context, conversation and changes, side by side.
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
                  {items.map((item, index) => <List.Item key={index}>{item}</List.Item>)}
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
            <Title order={2} className={sharedClasses.sectionTitle}>Five steps from setup to commit</Title>
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
                    <List size="lg" c="dimmed" spacing="sm" lh={1.6} mb="xl">
                      {step.items.map((item, index) => <List.Item key={index}>{item}</List.Item>)}
                    </List>
                    <Paper radius="lg" p="xl" className={classes.featureAlert} style={{ borderLeftColor: `var(--mantine-color-${step.color}-5)` }}>
                      <Group gap="sm" mb="xs">
                        <CalloutIcon size={20} color={`var(--mantine-color-${step.color}-6)`} />
                        <Text fw={800} c="dark.9">{step.callout.title}</Text>
                      </Group>
                      <Text c="dimmed" lh={1.6}>{step.callout.text}</Text>
                    </Paper>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }} order={{ base: 1, md: reversed ? 1 : 2 }}>
                    <Screenshot shot={step.shot} onOpen={openScreenshot} />
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
              Web chatbots, remote repositories and cost tracking.
            </Text>
          </Stack>

          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
            {EXTRAS.map(({ icon: Icon, color, title, items, shot }) => (
              <Card key={title} radius="xl" p="lg" className={classes.extraCard}>
                <Card.Section>
                  <Screenshot shot={shot} onOpen={openScreenshot} aspect="4 / 3" className={classes.cardShot} />
                </Card.Section>
                <Group gap="sm" mt="lg" mb="sm" wrap="nowrap">
                  <ThemeIcon size={36} radius="md" color={color} variant="light"><Icon size={20} /></ThemeIcon>
                  <Text fw={800} size="lg" c="dark.9" lh={1.3}>{title}</Text>
                </Group>
                <List c="dimmed" size="sm" spacing="sm" lh={1.6}>
                  {items.map((item, index) => <List.Item key={index}>{item}</List.Item>)}
                </List>
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

      {/* 5. DESIGN TRADEOFFS */}
      <section className={sharedClasses.sectionAlt}>
        <Container size="md">
          <Stack align="center" mb={60} ta="center">
            <Badge color="dark" variant="outline" size="lg" radius="sm" fw={700}>Why it's built this way</Badge>
            <Title order={2} className={sharedClasses.sectionTitle}>
              Explicit context. Reviewable changes.
            </Title>
          </Stack>

          <Stack gap="xl">
            <Card radius="2rem" p={0} className={classes.comparisonCardBad}>
              <Grid gutter={0}>
                <Grid.Col span={{ base: 12, sm: 4 }} className={classes.badSidebar}>
                  <Center h="100%" p="xl">
                    <Stack align="center">
                      <ShieldAlert size={64} color="var(--mantine-color-red-5)" />
                      <Title order={4} c="white" fw={800} ta="center">Autonomous agents</Title>
                    </Stack>
                  </Center>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 8 }} p={40}>
                  <List c="dark.7" size="lg" spacing="sm" lh={1.6}>
                    <List.Item><strong>Context growth:</strong> repository searches can fill the context window.</List.Item>
                    <List.Item><strong>Scope drift:</strong> autonomous edits can duplicate helpers or touch unrelated files.</List.Item>
                    <List.Item><strong>Cost growth:</strong> repeated correction loops consume API budget.</List.Item>
                  </List>
                </Grid.Col>
              </Grid>
            </Card>

            <Card radius="2rem" p={0} className={classes.comparisonCardGood}>
              <Grid gutter={0}>
                <Grid.Col span={{ base: 12, sm: 4 }} className={classes.goodSidebar}>
                  <Center h="100%" p="xl">
                    <Stack align="center">
                      <Sparkles size={64} color="white" />
                      <Title order={4} c="white" fw={800} ta="center">Frugäast</Title>
                    </Stack>
                  </Center>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 8 }} p={40}>
                  <List c="dark.7" size="lg" spacing="sm" lh={1.6} mb="md">
                    <List.Item><strong>Context:</strong> select files, read-only access and the repository map budget.</List.Item>
                    <List.Item><strong>Access:</strong> approve or deny requests for additional files.</List.Item>
                    <List.Item><strong>Review:</strong> inspect each assistant commit and its diff.</List.Item>
                  </List>
                  <Paper bg="teal.0" p="md" radius="md">
                    <Text c="teal.9" size="md" fw={700} lh={1.6}>
                      Focused prompts. Estimated cost. <strong>You own the design.</strong>
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
            <Title order={2} className={sharedClasses.sectionTitle}>Keyboard shortcuts</Title>
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
            <strong>Free:</strong> up to 3 open workspaces. <a href="/pricing" className={classes.inlineLink}>Compare Free and Pro</a>.
          </Text>
        </Container>
      </section>

      {/* 7. THE CTA SECTION */}
      <section className={sharedClasses.ctaSection}>
        <Container size="md" className={sharedClasses.ctaContainer}>
          <Title order={2} className={sharedClasses.ctaTitle} mb="sm">
            Start with your repository.
          </Title>
          <Text size="xl" c="white" maw={700} lh={1.6} mt="xl" mb="xl" opacity={0.9}>
            Choose the files. Describe the change. <strong>Review the commit.</strong>
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
            Windows, macOS and Linux. Use your own API key or a web chatbot.
          </Text>
        </Container>

        <div className={classes.ctaGlow} />
      </section>

    </MarketingLayout>
  );
}
