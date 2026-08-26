import { 
  Container, Title, Text, Button, Group, Stack, Grid, Box, ThemeIcon, List, Flex, Badge
} from '@mantine/core';
import { 
  CheckCircle2, ChevronRight, ArrowRight, Layers, Zap, 
  Wallet, Cpu, Terminal, FileCode, Check
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
              Frugaast is a minimalist, non-agentic coding assistant that lets you precisely control what you send to the LLM.
            </Text>
            
            {/* The Results Checklist */}
            <Group justify="center" gap="xl" mb="xl" mt="xl">
              <Group gap="sm"><CheckCircle2 size={20} className={classes.iconTeal}/><Text fw={600} size="md">Better code</Text></Group>
              <Group gap="sm"><CheckCircle2 size={20} className={classes.iconTeal}/><Text fw={600} size="md">Lower costs</Text></Group>
              <Group gap="sm"><CheckCircle2 size={20} className={classes.iconTeal}/><Text fw={600} size="md">Full control</Text></Group>
            </Group>
          </Container>
        </Container>

        {/* Frugaast UI Screenshot (90% wide, centered) */}
        <Box w="95%" mx="auto" mt={80} className={classes.relativeZ}>
          <img 
            src="/images/home/screen.png" 
            alt="Frugaast Interface" 
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
              size="lg" 
              radius="md" 
              className={classes.buttonPrimary} 
              rightSection={<ChevronRight size={18} />}
            >
              Download Frugaast
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
              Autonomous agentic loops are great for exploring.
              <br/><br/>
              Frugaast is for day-to-day shipping.
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
                  <img src="/images/home/after.png" alt="After: Frugaast Workflow" />
                </div>
              </Box>
            </Grid.Col>
          </Grid>
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
                Every coding assistant ultimately relies on an LLM. The quality of the output depends entirely on the size and quality of the context you feed it.
              </Text>
              <Text size="lg" c="dimmed" mb="xl" lh={1.7}>
                By controlling the context, you're not giving the model <i>less</i> information. You're giving it the <i>right</i> information.
              </Text>
              
              <Stack gap="md">
                {[
                  "Less irrelevant code to confuse the model.",
                  "Fewer hallucinated dependencies.",
                  "Smaller, more focused edits.",
                  "Code that strictly respects your existing architecture."
                ].map((item, i) => (
                  <Flex key={i} align="flex-start" gap="md">
                    <ThemeIcon color="violet.1" c="violet.7" size={28} radius="xl" mt={2}>
                      <Check size={16} strokeWidth={3} />
                    </ThemeIcon>
                    <Text fw={500} size="md" c="dark.7">{item}</Text>
                  </Flex>
                ))}
              </Stack>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <div className={classes.imagePlaceholderWrapper}>
                <img src="/images/home/clean-code.png" alt="Context Filtering Visual" />
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
                <img src="/images/home/cost-chart.png" alt="Token consumption comparison" />
              </div>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }} order={{ base: 1, md: 2 }}>
              <Title order={2} mb="xl" className={classes.sectionTitle} ta="left">
                Smaller prompts aren't just faster.<br/>They're cheaper.
              </Title>
              <Text size="lg" c="dimmed" mb="xl" lh={1.7}>
                Autonomous agentic loops quietly consume 100K+ tokens while you grab a coffee. With Frugaast, you decide exactly what reaches the LLM.
              </Text>
              
              <Stack gap="xl">
                <Flex align="flex-start" gap="md">
                  <ThemeIcon size={40} radius="md" color="violet.1" c="violet.7">
                    <Wallet size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={700} size="lg" mb={4}>Track the cost of every edit.</Text>
                    <Text c="dimmed" lh={1.6}>See exactly how much a prompt will cost before you send it.</Text>
                  </div>
                </Flex>
                <Flex align="flex-start" gap="md">
                  <ThemeIcon size={40} radius="md" color="violet.1" c="violet.7">
                    <Cpu size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={700} size="lg" mb={4}>Bring your own models.</Text>
                    <Text c="dimmed" lh={1.6}>Use API keys for Claude or GPT-4, or connect completely free local models via Ollama.</Text>
                  </div>
                </Flex>
                <Flex align="flex-start" gap="md">
                  <ThemeIcon size={40} radius="md" color="violet.1" c="violet.7">
                    <Terminal size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={700} size="lg" mb={4}>Reserve premium for reasoning.</Text>
                    <Text c="dimmed" lh={1.6}>Use Opus or GPT-4o for hard architecture tasks, and Haiku or local models for boilerplate.</Text>
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
              <Text size="lg" c="dimmed" mb="md" lh={1.7}>
                Agents shine for small boilerplate projects. On a mature, production codebase, their autonomous loops accumulate technical debt faster than you can fix it.
              </Text>
              <Text size="lg" c="dimmed" mb="xl" lh={1.7}>
                You already know what you want. You don't need an AI to take over—you just need it to execute what you have in mind.
              </Text>
              
              <Stack gap="md">
                {[
                  <><b>You</b> choose the exact context.</>,
                  <><b>You</b> dictate the architecture and logic.</>,
                  <><b>You</b> review the resulting commits.</>
                ].map((content, i) => (
                  <Flex key={i} align="center" gap="md">
                    <ThemeIcon color="blue.1" c="blue.6" size={28} radius="xl">
                      <Check size={16} strokeWidth={3} />
                    </ThemeIcon>
                    <Text fw={500} size="md" c="dark.7">{content}</Text>
                  </Flex>
                ))}
              </Stack>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <div className={classes.imagePlaceholderWrapper}>
                 <img src="/images/home/developer-workflow.png" alt="Developer led architecture workflow" />
              </div>
            </Grid.Col>
          </Grid>
        </Container>
      </section>

      {/* 6. FINAL CALL TO ACTION */}
      <section className={classes.ctaSection}>
        <Container size="md" className={classes.relativeZ}>
          <Title order={2} className={classes.ctaTitle}>
            Take control of your AI workflow.
          </Title>
          <Text size="xl" c="violet.1" maw={700} mx="auto" ta="center" lh={1.6} mt="lg" fw={400}>
            Download Frugaast today. Choose your context, direct the LLM, and review perfect commits in seconds.
          </Text>

          <Group justify="center" mt={40}>
            <Button 
              size="xl" 
              radius="md" 
              className={classes.buttonCta} 
              rightSection={<ChevronRight size={18} />}
            >
              Download Frugaast
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
