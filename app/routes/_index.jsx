import { 
  Container, Title, Text, Button, Group, Stack, Grid, Box, ThemeIcon, List, Flex, Badge
} from '@mantine/core';
import { 
  CheckCircle2, ChevronRight, ArrowRight, Layers, Zap, 
  Wallet, Cpu, Terminal, FileCode, Check, Search, Gauge
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
            The frugal <br />
            <span className={classes.textGradient}>coding assistant.</span>
          </Title>
          
          <Container size="md" p={0} mt="xl">
            <Text className={classes.heroSubtitle} ta="center" size="xl" mb="2xl" fw={500}>
              Frugäast is a minimalist, non-agentic coding assistant that lets you precisely control what you send to the LLM.
            </Text>
            
            {/* The Results Checklist */}
            <Group justify="center" gap="xl" mb="xl" mt="xl">
              <Group gap="sm"><CheckCircle2 size={20} className={classes.iconTeal}/><Text fw={600} size="md">Better code</Text></Group>
              <Group gap="sm"><CheckCircle2 size={20} className={classes.iconTeal}/><Text fw={600} size="md">Lower costs</Text></Group>
              <Group gap="sm"><CheckCircle2 size={20} className={classes.iconTeal}/><Text fw={600} size="md">Full control</Text></Group>
            </Group>
          </Container>
        </Container>

        {/* Frugäast UI Screenshot (90% wide, centered) */}
        <Box
          w={{ base: "100%", xl: "80%" }}
          mx="auto"
          mt={80}
          className={classes.relativeZ}
        >
          <img 
            src="/images/home/screen.png" 
            alt="Frugäast Interface" 
            className={classes.heroImage}
          />
        </Box>

        <Container size="lg" className={classes.relativeZ}>
          <Container size="md" p={0}>
            <Box className={classes.promiseBox} mx="auto" maw={750} mt={40}>
              <Text c="dimmed" ta="center" size="lg" lh={1.7}>
                Instead of chasing the "10x" promise that generates technical debt and spaghetti code, 
                Go for a 3x boost — for a fraction of the cost, and <Text span fw={700} c="violet.6">with code that actually scales</Text>.
              </Text>
            </Box>
          </Container>

          <Group justify="center" mt={50} gap="md">
            <Button 
              component="a"
              href="/download"
              size="lg" 
              radius="md" 
              className={classes.buttonPrimary} 
              rightSection={<ChevronRight size={18} />}
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
              Stop paying AI to rediscover what you already know.
            </Title>
              <Text c="dimmed" size="lg" ta="center" maw={700} lh={1.7}>
              Autonomous agentic loops are great for exploring new idea.
              <br/>
              Frugäast is for maintaining your (large) codebase.
            </Text>
          </Stack>

          <Grid gutter={{ base: 'xl', md: 'xl' }}>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Box h="100%" className={`${classes.splitCompareCard} ${classes.compareColBefore}`}>
                <div className={classes.workflowImageWrapper}>
                  <img src="/images/home/before.png" alt="Before: Agentic Workflow" />
                </div>
              </Box>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Box h="100%" className={`${classes.splitCompareCard} ${classes.compareColAfter}`}>
                <div className={classes.workflowImageWrapper}>
                  <img src="/images/home/after.png" alt="After: Frugäast Workflow" />
                </div>
              </Box>
            </Grid.Col>
          </Grid>
        </Container>
      </section>

      {/* WHY FRUGAAST TITLE */}
      <section className={classes.section}>
        <Container size="lg">
            <Title order={4} ta="center" mb="xl" className={classes.sectionSubtitle}>
              You tried 10 different coding harnesses ?
            </Title>
          <Title order={1} ta="center" className={classes.heroTitle}>
            Frugäast is <span className={classes.textGradient}>different.</span>
          </Title>
        </Container>
      </section>

      {/* 3. EXCEPTIONALLY CLEAN CODE */}
      <section className={classes.section}>
        <Container size="lg">
          <Grid align="center" gutter={{ base: 60, md: 80 }}>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Title order={2} mb="xl" className={classes.sectionTitle} ta="left">
                Exceptionally clean code.
              </Title>
              <Text size="lg" c="dimmed" mb="md" lh={1.7}>
                Your LLM has a 200k context window. Cool.<br/>
                But its peak performance is at 10k. 
              </Text>
              <Text size="lg" c="dimmed" mb="xl" lh={1.7}>
                Pass only relevant code to the model, get clean edits.
              </Text>
              
              <Stack gap="xl">
                <Flex align="center" gap="md">
                  <ThemeIcon size={40} radius="md" color="violet.1" c="violet.7">
                    <Search size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={700} size="lg" mb={4}>Easily create curated context.</Text>
                    <Text c="dimmed" lh={1.6}>Fuzzy search files to add to your context.<br/>Repomap created on the fly.</Text>
                  </div>
                </Flex>
                <Flex align="center" gap="md">
                  <ThemeIcon size={40} radius="md" color="violet.1" c="violet.7">
                    <Zap size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={700} size="lg" mb={4}>One pass to rules them all.</Text>
                    <Text c="dimmed" lh={1.6}>No agentic loops. Send the curated context, apply the edits. That's it.</Text>
                  </div>
                </Flex>
                <Flex align="center" gap="md">
                  <ThemeIcon size={40} radius="md" color="violet.1" c="violet.7">
                    <FileCode size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={700} size="lg" mb={4}>Produce clean, predictable code.</Text>
                    <Text c="dimmed" lh={1.6}>No hallucinated dependencies, no code duplicated. <br/>No more surprises.</Text>
                  </div>
                </Flex>
              </Stack>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <div className={classes.imagePlaceholderWrapper}>
                <img src="/images/home/feature1.png" alt="Context Filtering Visual" />
              </div>
            </Grid.Col>
          </Grid>
        </Container>
      </section>

      {/* 4. COST CONTROL SECTION */}
      <section className={classes.sectionAlt}>
        <Container size="lg">
          <Grid align="center" gutter={{ base: 60, md: 80 }}>
            <Grid.Col span={{ base: 12, md: 6 }} order={{ base: 2, md: 1 }}>
              <div className={classes.imagePlaceholderWrapper}>
                <img src="/images/home/feature2.png" alt="Token consumption comparison" />
              </div>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }} order={{ base: 1, md: 2 }}>
              <Title order={2} mb="xl" className={classes.sectionTitle} ta="left">
                Frugal by design.
              </Title>
              <Text size="lg" c="dimmed" mb="xl" lh={1.7}>
                Autonomous agentic loops quietly consume 100K+ tokens while you grab a coffee. 
                <br/><br/>
                Frugäast does not burn tokens wondering what tool to use: <br/>
                just one pass with controlled context for frugal, predictable edits.
              </Text>
              
              <Stack gap="xl">
                <Flex align="center" gap="md">
                  <ThemeIcon size={40} radius="md" color="violet.1" c="violet.7">
                    <Gauge size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={700} size="lg" mb={4}>No loop, no waste.</Text>
                    <Text c="dimmed" lh={1.6}>Predictable token usage for better cost control.</Text>
                  </div>
                </Flex>
                <Flex align="center" gap="md">
                  <ThemeIcon size={40} radius="md" color="violet.1" c="violet.7">
                    <Cpu size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={700} size="lg" mb={4}>Bring your own models.</Text>
                    <Text c="dimmed" lh={1.6}>Reserve premium for difficult tasks.</Text>
                  </div>
                </Flex>
                <Flex align="center" gap="md">
                  <ThemeIcon size={40} radius="md" color="violet.1" c="violet.7">
                    <Wallet size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={700} size="lg" mb={4}>Track the cost of every edit.</Text>
                    <Text c="dimmed" lh={1.6}>Review your spendings with cost analysis dashboards.</Text>
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
                Built for developers who own their codebase.
              </Title>
              <Text size="lg" c="dimmed" mb="xl" lh={1.7}>
                You already know what you want. You don't need an AI to take over—you just need it to execute what you have in mind.
              </Text>
              <Text size="lg" c="dimmed" mb="md" lh={1.7}>
                Frugäast shines on large, complex codebases where you need to keep control.
              </Text>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <div className={classes.imagePlaceholderWrapper}>
                 <img src="/images/home/feature3.png" alt="Developer led architecture workflow" />
              </div>
            </Grid.Col>
          </Grid>
        </Container>
      </section>

      {/* 6. FINAL CALL TO ACTION */}
      <section className={classes.ctaSection}>
        <Container size="md" className={classes.relativeZ}>
          <Title order={2} className={classes.ctaTitle}>
            Start frugal AI coding
          </Title>
          <Text size="xl" c="violet.1" maw={700} mx="auto" ta="center" lh={1.6} mt="lg" fw={400}>
            Open your existing codebase, select the files you want to edit, <br/>and let Frugäast handle the rest. 
            <br/><br/>
            No agents. No hallucinations. Just clean, controlled edits.
          </Text>

          <Group justify="center" mt={40}>
            <Button 
              component="a"
              href="/download"
              size="xl" 
              radius="md" 
              className={classes.buttonCta} 
              rightSection={<ChevronRight size={18} />}
            >
              Download Frugäast
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
