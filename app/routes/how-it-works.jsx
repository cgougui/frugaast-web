import { 
  Container, Title, Text, Button, Group, Stack, Grid, Card, 
  ThemeIcon, Badge, Paper, Center, Box, Avatar
} from '@mantine/core';
import { 
  Smartphone, Target, Eye, ShieldAlert, 
  ShieldCheck, MousePointerClick, Gauge, Moon, ChevronRight, 
  Sparkles, Laptop, Link2, FileDown, Play, MessageSquare
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
          <Center mb="xl">
            <Badge 
              variant="light" 
              color="violet" 
              size="lg" 
              radius="xl" 
              className={sharedClasses.pillBadge}
              leftSection={<Sparkles size={14} />}
            >
              How It Works
            </Badge>
          </Center>
          
          <Title className={sharedClasses.heroTitle} order={1}>
            From download to autopilot in <br />
            <span className={sharedClasses.textGradient}>under 3 minutes.</span>
          </Title>
          
          <Title order={2} size="h3" c="dark.8" mt="xl" fw={700}>
            No servers. No APIs. No coding required.
          </Title>

          <Text className={sharedClasses.heroSubtitle} size="xl" mt="md" lh={1.6}>
            Most Instagram growth tools are complicated, sketchy, and live in the cloud. SlyBot is different. It’s a lightweight Windows app that turns your computer and your physical Android phone into a secure, undetectable growth engine.
          </Text>
          <Text className={sharedClasses.heroSubtitle} size="xl" mt="sm" lh={1.6}>
            Here is exactly how SlyBot takes the soul-crushing grunt work off your plate, step by step.
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
                  Step 1: Download the Windows App (No login required)
                </Title>
                <Text size="lg" c="dimmed" lh={1.7} mb="xl">
                  First, you download the SlyBot <code>.exe</code> to your PC. Because we know you hate spam as much as we do, the basic version is completely free. We don't ask for your credit card. We don't ask for an account. We don't even ask for your email address.
                </Text>
                <Paper radius="lg" p="xl" className={classes.featureAlert} style={{ borderLeftColor: 'var(--mantine-color-violet-5)' }}>
                  <Group gap="sm" mb="xs">
                    <ShieldCheck size={20} color="var(--mantine-color-violet-6)" />
                    <Text fw={800} c="dark.9">The Security Flex:</Text>
                  </Group>
                  <Text c="dimmed" lh={1.6}>Because SlyBot lives entirely on your local hard drive, you never have to type your Instagram password into our software. Your credentials stay exactly where they belong: on your own device.</Text>
                </Paper>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }} order={{ base: 1, md: 2 }}>
                <div className={`${classes.visualPanel} ${classes.bgGradientViolet}`}>
                  <Paper radius="xl" p="xl" shadow="xl" className={classes.floatingElement}>
                    <Stack align="center" gap="sm">
                      <ThemeIcon size={64} radius="xl" color="violet" variant="light">
                        <FileDown size={32} />
                      </ThemeIcon>
                      <Text fw={800} size="lg">SlyBot.exe</Text>
                      <Badge color="green" variant="light">100% Free & Secure</Badge>
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
                  <Group gap="lg" className={classes.floatingElement}>
                    <Paper radius="xl" p="lg" shadow="md"><Laptop size={40} color="var(--mantine-color-dark-8)" /></Paper>
                    <div className={classes.connectionLine}>
                      <Link2 size={24} color="var(--mantine-color-blue-5)" className={classes.pulseIcon} />
                    </div>
                    <Paper radius="xl" p="lg" shadow="md"><Smartphone size={40} color="var(--mantine-color-teal-6)" /></Paper>
                  </Group>
                </div>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Title order={3} fw={900} mb="md" size="h2" c="dark.9">
                  Step 2: Plug in your Android Phone
                </Title>
                <Text size="lg" c="dimmed" lh={1.7} mb="xl">
                  Grab a standard USB cable and connect your Android phone to your computer. With two simple taps on your phone, you enable "USB Debugging." (Don't worry, we show you exactly where this is).
                </Text>
                <Paper radius="lg" p="xl" className={classes.featureAlert} style={{ borderLeftColor: 'var(--mantine-color-blue-5)' }}>
                  <Group gap="sm" mb="xs">
                    <Sparkles size={20} color="var(--mantine-color-blue-6)" />
                    <Text fw={800} c="dark.9">The Magic Bridge:</Text>
                  </Group>
                  <Text c="dimmed" lh={1.6}>This enables ADB (Android Debug Bridge), a safe, native Android feature that allows your computer to send "touch" commands to your phone's screen.</Text>
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
                  Step 3: Point SlyBot at your Competitors
                </Title>
                <Text size="lg" c="dimmed" lh={1.7} mb="xl">
                  Open SlyBot on your computer and tell it what you want it to do. Enter the Instagram handle of a giant competitor in your niche. Choose your actions: view stories, like posts, follow, or drop comments.
                </Text>
                <Paper radius="lg" p="xl" className={classes.featureAlert} style={{ borderLeftColor: 'var(--mantine-color-teal-5)' }}>
                  <Group gap="sm" mb="xs">
                    <MessageSquare size={20} color="var(--mantine-color-teal-6)" />
                    <Text fw={800} c="dark.9">The Anti-Cringe AI:</Text>
                  </Group>
                  <Text c="dimmed" lh={1.6}>If you turn on comments, you tell the AI exactly how to behave. Tell it to "be polite, act like a peer, and ask a relevant question about the image." SlyBot will analyze the visual context of the post and write a thoughtful comment that sounds exactly like you.</Text>
                </Paper>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }} order={{ base: 1, md: 2 }}>
                <div className={`${classes.visualPanel} ${classes.bgGradientTeal}`}>
                  <Paper radius="xl" p="xl" shadow="xl" className={classes.floatingElement}>
                    <Group wrap="nowrap" gap="lg">
                      <Avatar size="xl" radius="xl" color="teal"><Target size={28} /></Avatar>
                      <div>
                        <Text fw={800} size="lg">Targeting: @competitor</Text>
                        <Text size="sm" c="dimmed">Action: Engage & Comment</Text>
                        <Badge color="teal" variant="light" mt="sm">AI Enabled</Badge>
                      </div>
                    </Group>
                  </Paper>
                </div>
              </Grid.Col>
            </Grid>
          </Box>

          {/* STEP 4 */}
          <Box className={classes.stepBlock}>
            <div className={classes.watermarkNumberRight}>04</div>
            <Grid gutter={60} align="center" className={classes.stepContent}>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <div className={`${classes.visualPanel} ${classes.bgGradientOrange}`}>
                  <Paper radius="xl" p="xl" shadow="xl" className={classes.floatingElement}>
                    <Stack align="center" gap="md">
                      <ThemeIcon size={80} radius="100%" color="orange" variant="filled" className={classes.pulsePlay}>
                        <Play size={40} fill="currentColor" style={{ marginLeft: 6 }} />
                      </ThemeIcon>
                      <Badge color="orange" variant="dot" size="lg">Status: Running...</Badge>
                    </Stack>
                  </Paper>
                </div>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Title order={3} fw={900} mb="md" size="h2" c="dark.9">
                  Step 4: Sit Back and Watch the Magic
                </Title>
                <Text size="lg" c="dimmed" lh={1.7} mb="xl">
                  Hit "Start." Look over at your physical phone sitting on your desk. You will literally watch the screen wake up. You will see the Instagram app open. You will watch as it scrolls down the page, pauses to read a caption, types out a comment, and hits send.
                </Text>
                <Paper radius="lg" p="xl" className={classes.featureAlert} style={{ borderLeftColor: 'var(--mantine-color-orange-5)' }}>
                  <Group gap="sm" mb="xs">
                    <Eye size={20} color="var(--mantine-color-orange-6)" />
                    <Text fw={800} c="dark.9">The Ultimate Proof:</Text>
                  </Group>
                  <Text c="dimmed" lh={1.6}>You don't have to trust that the bot is doing its job. You can physically watch it happen with your own two eyes until you trust it completely.</Text>
                </Paper>
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
              Why Instagram Can't Catch SlyBot.
            </Title>
            <Text c="dark.5" size="xl" fw={600}>
              The technical reason you are immune to the Ban Hammer.
            </Text>
            <Text size="lg" c="dimmed" maw={800} mt="md" lh={1.6}>
              If you are terrified of losing your account, you should be. Meta is ruthless when it comes to catching bots. But to understand why SlyBot is safe, you need to understand how Meta catches the <i>other</i> guys.
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
                      <Title order={4} c="white" fw={800} ta="center">The "Old Way"</Title>
                    </Stack>
                  </Center>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 8 }} p={40}>
                  <Title order={4} fw={800} mb="sm" c="red.9">How the "Old Way" gets you banned:</Title>
                  <Text c="dark.7" size="lg" lh={1.6}>
                    Standard bots run on cheap virtual servers in the cloud. To engage with users, they try to bypass the actual Instagram app and inject commands directly into Instagram's backend API. Meta’s security systems detect these unauthorized server requests in milliseconds, resulting in an instant shadowban or account deletion.
                  </Text>
                </Grid.Col>
              </Grid>
            </Card>

            {/* The SlyBot Way */}
            <Card radius="2rem" p={0} className={classes.comparisonCardGood}>
              <Grid gutter={0}>
                <Grid.Col span={{ base: 12, sm: 4 }} className={classes.goodSidebar}>
                  <Center h="100%" p="xl">
                    <Stack align="center">
                      <ShieldCheck size={64} color="white" />
                      <Title order={4} c="white" fw={800} ta="center">The "SlyBot Way"</Title>
                    </Stack>
                  </Center>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 8 }} p={40}>
                  <Title order={4} fw={800} mb="sm" c="teal.9">How the "SlyBot Way" keeps you safe:</Title>
                  <Text c="dark.7" size="lg" lh={1.6} mb="md">
                    SlyBot doesn't know Instagram's backend code. It doesn't use the cloud, and it doesn't use fake IP addresses.
                  </Text>
                  <Text c="dark.7" size="lg" lh={1.6} mb="md">
                    SlyBot simply calculates X and Y coordinates on a screen. Through the USB cable, it tells your Android phone: <i>"Swipe up," "Tap here," "Type these letters."</i>
                  </Text>
                  <Paper bg="teal.0" p="md" radius="md">
                    <Text c="teal.9" size="md" fw={700} lh={1.6}>
                      To the Instagram app, there is literally zero difference between SlyBot touching the screen, and your actual human finger touching the screen.
                    </Text>
                  </Paper>
                </Grid.Col>
              </Grid>
            </Card>

          </Stack>

          {/* Imperfections Divider/List */}
          <Box className={classes.imperfectionsBox}>
            <Title order={3} ta="center" mb="xl" fw={800} size="h2">
              To make it even more bulletproof, <br/>SlyBot mimics human imperfections:
            </Title>
            
            <Grid gutter={40} mt={40}>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Group wrap="nowrap" align="flex-start">
                  <ThemeIcon size={40} radius="xl" color="dark" variant="white" shadow="sm"><MousePointerClick size={20}/></ThemeIcon>
                  <div>
                    <Text fw={800} size="lg" mb="4px">Sloppy Taps:</Text>
                    <Text c="dimmed" lh={1.5} size="sm">It doesn't click the exact dead-center of a button every time.</Text>
                  </div>
                </Group>
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Group wrap="nowrap" align="flex-start">
                  <ThemeIcon size={40} radius="xl" color="dark" variant="white" shadow="sm"><Gauge size={20}/></ThemeIcon>
                  <div>
                    <Text fw={800} size="lg" mb="4px">Variable Speeds:</Text>
                    <Text c="dimmed" lh={1.5} size="sm">It scrolls fast, then slow, then pauses to "read."</Text>
                  </div>
                </Group>
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Group wrap="nowrap" align="flex-start">
                  <ThemeIcon size={40} radius="xl" color="dark" variant="white" shadow="sm"><Moon size={20}/></ThemeIcon>
                  <div>
                    <Text fw={800} size="lg" mb="4px">Built-in Exhaustion:</Text>
                    <Text c="dimmed" lh={1.5} size="sm">It takes random breaks and goes to sleep at night so you don't trigger behavioral spam filters.</Text>
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
            Ready to hire your free, undetectable intern?
          </Title>
          <Title order={3} size="h2" c="violet.2" fw={700}>
            Stop scrolling and start growing.
          </Title>
          
          <Text size="xl" c="white" maw={700} lh={1.6} mt="xl" opacity={0.9}>
            You built a great product. You created a great coaching business. Your time is too valuable to be spent doing mind-numbing data entry on a social media app.
          </Text>
          <Text size="xl" c="white" maw={700} lh={1.6} mt="sm" mb="xl" fw={600}>
            Let SlyBot do the heavy lifting, so you can get back to doing the work you actually love.
          </Text>

          <Button 
            size="xl" 
            radius="xl" 
            className={classes.buttonCta} 
            mt="md"
            rightSection={<ChevronRight size={20} />}
          >
            Download SlyBot for Free (Windows .exe)
          </Button>
          <Text size="sm" mt="lg" c="violet.2" fw={500} opacity={0.8}>
            Setup takes 2 minutes. No email required. Upgrade only when you are ready for more power.
          </Text>
        </Container>
        
        {/* Decorative CTA glow */}
        <div className={classes.ctaGlow} />
      </section>

    </MarketingLayout>
  );
}