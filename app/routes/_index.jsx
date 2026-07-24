import { 
  Container, Title, Text, Button, Group, Stack, Grid, Card, 
  ThemeIcon, Box, Badge, Paper, Center, Avatar, 
  Accordion, List, Image
} from '@mantine/core';
import { 
  ShieldCheck, Cpu, Laptop, Play, CheckCircle2, ChevronRight, 
  Smartphone, Link2, Sparkles, Fingerprint, Users, MessageSquare, 
  Clock, Lock, Download, XCircle, Zap, ArrowRight, X, Info
} from 'lucide-react';
import { MarketingLayout } from '../components/MarketingLayout';

// Proper split of imports
import sharedClasses from '../styles/shared.module.css';
import classes from './_index.module.css';

export default function Index() {
  return (
    <MarketingLayout>
      {/* 1. HERO SECTION */}
      <section className={sharedClasses.hero}>
        <div className={classes.heroBackground}>
          <div className={classes.glowBlob} />
          <div className={classes.glowBlobSecondary} />
        </div>
        
        <Container size="lg" className={classes.relativeZ}>
          <Center mb="xl">
            <Badge 
              variant="light" 
              color="violet" 
              size="lg" 
              radius="xl" 
              className={sharedClasses.pillBadge}
              leftSection={<Sparkles size={14} />}
            >
              Secure & Undetectable
            </Badge>
          </Center>
          
          <Title className={sharedClasses.heroTitle} ta="center" order={1}>
            The Undetectable Instagram Bot <br />
            <span className={sharedClasses.textGradient}>That Uses Your Real Phone.</span>
          </Title>
          
          <Container size="md" p={0}>
            <Text className={sharedClasses.heroSubtitle} ta="center" size="xl" mt="xl">
              Grow your audience automatically without the constant fear of getting banned. 
              SlyBot mimics real human touch on your real Android phone, making your Instagram growth 100% undetectable.
            </Text>
          </Container>

          <Group justify="center" mt={50} gap="md">
            <Button 
              size="xl" 
              radius="xl" 
              className={sharedClasses.buttonPrimary} 
              leftSection={<Download size={20} />}
            >
              Download for Free
            </Button>
            <Button 
              size="xl" 
              radius="xl" 
              className={sharedClasses.buttonSecondary} 
              leftSection={<Play size={20} color="var(--mantine-color-dark-3)" />}
            >
              See It In Action
            </Button>
          </Group>

          {/* Visual Device Bridge */}
          <div className={classes.heroVisual}>
             <Paper className={classes.floatingDevice} radius="xl" p="xl" shadow="sm">
                <ThemeIcon size={60} radius="xl" variant="light" color="violet">
                  <Laptop size={32} strokeWidth={1.5} />
                </ThemeIcon>
                <Text fw={800} size="xs" mt="md" c="dimmed" lts={1}>WINDOWS APP</Text>
             </Paper>
             
             <div className={classes.magicLineContainer}>
               <div className={classes.magicLine} />
               <div className={classes.magicPulse} />
               <div className={classes.bridgeBadge}>
                 <Link2 size={18} strokeWidth={2.5} />
               </div>
             </div>

             <Paper className={classes.floatingDevice} radius="xl" p="xl" shadow="sm">
                <ThemeIcon size={60} radius="xl" variant="light" color="teal">
                  <Smartphone size={32} strokeWidth={1.5} />
                </ThemeIcon>
                <Text fw={800} size="xs" mt="md" c="dimmed" lts={1}>PHYSICAL PHONE</Text>
             </Paper>
          </div>

          {/* App Screenshot */}
          <div className={classes.appScreenshotContainer}>
            <Image 
              src="/images/home/screenshot1.png" 
              alt="SlyBot App Interface" 
              fallbackSrc="https://placehold.co/1200x800?text=SlyBot+Screenshot"
            />
          </div>
        </Container>
      </section>

      {/* 2. THE PROBLEM SECTION */}
      <section className={sharedClasses.sectionAlt}>
        <Container size="md">
          <Stack align="center" gap="xl">
            <Title order={2} ta="center" className={sharedClasses.sectionTitle}>
              Wrestling with the Instagram algorithm?<br/>
              It doesn’t have to be this hard.
            </Title>
            <Text size="lg" ta="center" c="dimmed" maw={800} lh={1.7}>
              If you don't have thousands to burn on Meta ads, growing an audience requires soul-crushing grunt work. You know the drill: spending hours mindlessly tapping "like" and hitting "follow" just hoping someone notices you.
            </Text>
            <Text size="lg" ta="center" c="dimmed" maw={800} lh={1.7}>
              Whether you built a beautiful app or a coaching business, you didn't sign up to be a slave to an algorithm. Instead of doing the high-value work you love, you're scrolling your phone like a teenager just to get 10 profile visits.
            </Text>
            
            <Paper radius="xl" p={40} mt="xl" className={classes.solutionCard} shadow="xl">
              <Group wrap="nowrap" align="flex-start" gap="xl">
                <ThemeIcon size={54} radius="xl" color="indigo" variant="filled" className={classes.solutionIcon}>
                  <Zap size={28} />
                </ThemeIcon>
                <div>
                  <Text fw={800} size="xl" mb="sm" c="white" lts={-0.5}>Not with SlyBot.</Text>
                  <Text c="indigo.1" size="lg" lh={1.6}>
                    SlyBot is a straightforward Windows app that takes the manual work off your plate. <b>Instead of hacking Instagram's code, it simply mimics human touches on your actual Android phone.</b> It is secure, 100% undetectable, and designed specifically for solo-founders and creators who don't have the budget for an agency.
                  </Text>
                </div>
              </Group>
            </Paper>
          </Stack>
        </Container>
      </section>

      {/* 3. HOW IT WORKS / USP */}
      <section className={sharedClasses.section}>
        <Container>
          <Grid align="center" gutter={80}>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Badge color="violet" variant="light" mb="md" radius="sm" fw={700}>The Technology</Badge>
              <Title order={2} mb="xl" className={sharedClasses.sectionTitle} ta="left">
                Most bots live in the cloud—and that’s exactly why they get caught.
              </Title>
              <Text size="lg" c="dimmed" mb="xl" lh={1.7}>
                Standard automation tools use virtual servers and try to bypass the Instagram app by using backend APIs. Instagram’s algorithm spots this instantly.
              </Text>
              <Text size="lg" c="dimmed" lh={1.7}>
                SlyBot is a desktop app that lives entirely on your PC. It uses a secure Windows-to-Android bridge to send human interactions to your actual, physical device sitting on your desk. It physically touches the screen, swipes, and types on your real phone.
              </Text>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="xl">
                <Card radius="xl" p={30} className={classes.uspCard} withBorder>
                  <Group wrap="nowrap" align="flex-start" gap="lg">
                    <ThemeIcon size={48} radius="md" variant="light" color="blue">
                      <Lock size={24} />
                    </ThemeIcon>
                    <div>
                      <Title order={4} mb="xs" fw={700}>1. We don't need your account credentials.</Title>
                      <Text c="dimmed" size="md" lh={1.5}>You never type your password into our software. It just controls the app already logged in on your phone.</Text>
                    </div>
                  </Group>
                </Card>
                
                <Card radius="xl" p={30} className={classes.uspCard} withBorder>
                  <Group wrap="nowrap" align="flex-start" gap="lg">
                    <ThemeIcon size={48} radius="md" variant="light" color="teal">
                      <ShieldCheck size={24} />
                    </ThemeIcon>
                    <div>
                      <Title order={4} mb="xs" fw={700}>2. It is impossible to detect.</Title>
                      <Text c="dimmed" size="md" lh={1.5}>To Instagram, it just looks like you are sitting on your couch, using your phone normally. Meta literally cannot detect the software.</Text>
                    </div>
                  </Group>
                </Card>
              </Stack>
            </Grid.Col>
          </Grid>
        </Container>
      </section>

      {/* 4. OLD WAY VS NEW WAY */}
      <section className={sharedClasses.sectionAlt}>
        <Container size="md">
          <Stack align="center" mb={80}>
            <Title order={2} ta="center" className={sharedClasses.sectionTitle}>
              You've probably avoided bots before.<br/>We don't blame you.
            </Title>
            <Text c="dimmed" size="xl" ta="center" maw={700}>
              Most automation tools are risky, spammy, and dangerous for your account. We built Slybot to be the exact opposite.
            </Text>
          </Stack>

          <Stack gap={40}>
            {/* Comparison Row 1 */}
            <Paper radius="xl" className={classes.splitCompareCard} shadow="sm">
              <Grid gutter={0} style={{ minHeight: '100%' }}>
                <Grid.Col span={{ base: 12, md: 5 }} className={classes.oldWayPanel} p={40}>
                  <XCircle size={140} className={classes.bgWatermark} />
                  <Badge color="red" variant="filled" mb="xl" size="md" radius="sm">The Old Way</Badge>
                  <Title order={4} mb="sm" c="dark.7" fw={800}>Ban Hammers</Title>
                  <Text c="dimmed" size="md" lh={1.6}>
                    Sketchy bots use fake IP addresses and Instagram's backend API, getting your account shadowbanned or deleted in days.
                  </Text>
                  <div className={classes.vsBadgeModern}><ArrowRight size={20} /></div>
                </Grid.Col>
                
                <Grid.Col span={{ base: 12, md: 7 }} className={classes.newWayPanel} p={40}>
                  <ShieldCheck size={180} className={classes.bgWatermarkNew} />
                  <Badge color="teal" variant="white" mb="xl" size="md" radius="sm" fw={700} c="violet.9">The SlyBot Way</Badge>
                  <Title order={3} mb="md" c="white" fw={800}>No Ban Hammers.</Title>
                  <Text c="violet.1" size="md" lh={1.7}>
                    Slybot uses ADB to communicate directly with your physical phone. It doesn't hack the API. It literally mimics human taps on your real screen. To Instagram, it's just you, using your phone normally.
                  </Text>
                </Grid.Col>
              </Grid>
            </Paper>

            {/* Comparison Row 2 */}
            <Paper radius="xl" className={classes.splitCompareCard} shadow="sm">
              <Grid gutter={0} style={{ minHeight: '100%' }}>
                <Grid.Col span={{ base: 12, md: 5 }} className={classes.oldWayPanel} p={40}>
                  <X size={140} className={classes.bgWatermark} />
                  <Badge color="red" variant="filled" mb="xl" size="md" radius="sm">The Old Way</Badge>
                  <Title order={4} mb="sm" c="dark.7" fw={800}>Stolen Passwords</Title>
                  <Text c="dimmed" size="md" lh={1.6}>
                    Cloud-based bots force you to hand over your Instagram username and password to a random server.
                  </Text>
                  <div className={classes.vsBadgeModern}><ArrowRight size={20} /></div>
                </Grid.Col>
                
                <Grid.Col span={{ base: 12, md: 7 }} className={classes.newWayPanel} p={40}>
                  <Lock size={180} className={classes.bgWatermarkNew} />
                  <Badge color="teal" variant="white" mb="xl" size="md" radius="sm" fw={700} c="violet.9">The SlyBot Way</Badge>
                  <Title order={3} mb="md" c="white" fw={800}>No Stolen Passwords.</Title>
                  <Text c="violet.1" size="md" lh={1.7}>
                    Slybot is a local Windows app. You never type your Instagram password into our software. It just controls the Instagram app that is already safely logged in on your phone.
                  </Text>
                </Grid.Col>
              </Grid>
            </Paper>

            {/* Comparison Row 3 */}
            <Paper radius="xl" className={classes.splitCompareCard} shadow="sm">
              <Grid gutter={0} style={{ minHeight: '100%' }}>
                <Grid.Col span={{ base: 12, md: 5 }} className={classes.oldWayPanel} p={40}>
                  <XCircle size={140} className={classes.bgWatermark} />
                  <Badge color="red" variant="filled" mb="xl" size="md" radius="sm">The Old Way</Badge>
                  <Title order={4} mb="sm" c="dark.7" fw={800}>"Spammy Cringe"</Title>
                  <Text c="dimmed" size="md" lh={1.6}>
                    Dumb bots leave a "🔥 Great pic!" emoji on a tragic or serious post, making you look like a cheap scammer.
                  </Text>
                  <div className={classes.vsBadgeModern}><ArrowRight size={20} /></div>
                </Grid.Col>
                
                <Grid.Col span={{ base: 12, md: 7 }} className={classes.newWayPanel} p={40}>
                  <MessageSquare size={180} className={classes.bgWatermarkNew} />
                  <Badge color="teal" variant="white" mb="xl" size="md" radius="sm" fw={700} c="violet.9">The SlyBot Way</Badge>
                  <Title order={3} mb="md" c="white" fw={800}>Tailored AI Comments.</Title>
                  <Text c="violet.1" size="md" lh={1.7}>
                    SlyBot uses native AI to analyze the image, the caption, and the profile context before it types. It generates a thoughtful, highly tailored comment in your exact tone of voice. You look like a polite, interested human—never a bot.
                  </Text>
                </Grid.Col>
              </Grid>
            </Paper>

          </Stack>
        </Container>
      </section>

      {/* 5. BENTO GRID FEATURES */}
      <section className={sharedClasses.section}>
        <Container size="lg">
          <Stack align="center" mb={80}>
            <Title order={2} className={sharedClasses.sectionTitle} ta="center">What SlyBot actually does for you</Title>
            <Text c="dimmed" size="xl">Set it, forget it, and watch your audience grow.</Text>
          </Stack>

          <div className={`${sharedClasses.bentoGrid} ${classes.featuresBentoGrid}`}>
            
            {/* Poaching - Large Card */}
            <Card p={40} className={`${sharedClasses.bentoCard} ${sharedClasses.hoverCard} ${classes.featCardWide}`} bg="indigo.0">
              <Grid align="center" h="100%" gutter="xl">
                <Grid.Col span={{ base: 12, sm: 7 }}>
                  <ThemeIcon size={50} radius="md" color="indigo" variant="light" mb="lg">
                    <Users size={24} />
                  </ThemeIcon>
                  <Title order={3} fw={800} mb="sm" c="indigo.9">Turn your competitors' followers into your own.</Title>
                  <Text c="indigo.8" lh={1.6}>Don't guess where your audience is hiding. Point SlyBot at high-profile competitors in your niche. SlyBot will automatically navigate to their followers, view their posts, drop likes, and engage with them—driving highly-targeted traffic directly back to your page.</Text>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 5 }}>
                  <Paper radius="lg" p="lg" bg="white" shadow="sm" className={classes.animatedTarget}>
                    <Group wrap="nowrap">
                      <Avatar color="dark" radius="xl" size="lg">NI</Avatar>
                      <Stack gap={4}>
                        <Text size="md" fw={700}>Nike Official</Text>
                        <Group gap={6}>
                          <Sparkles size={14} color="var(--mantine-color-indigo-5)" />
                          <Text size="sm" c="indigo.6" fw={500}>Scraping engaged followers...</Text>
                        </Group>
                      </Stack>
                    </Group>
                  </Paper>
                </Grid.Col>
              </Grid>
            </Card>

            {/* Smart Comments - Tall Card */}
            <Card p={40} className={`${sharedClasses.bentoCard} ${sharedClasses.hoverCard} ${classes.featCardTall}`} bg="violet.0">
               <ThemeIcon size={50} radius="md" color="violet" variant="light" mb="lg">
                 <MessageSquare size={24} />
               </ThemeIcon>
               <Title order={3} fw={800} mb="sm" c="violet.9">Hyper-tailored, intelligent comments.</Title>
               <Text c="violet.8" lh={1.6}>No more spammy "🔥 Great pic!". SlyBot analyzes the actual profile and specific post to generate a thoughtful, tailored comment in the exact tone of voice you want. You look like a polite, interested human.</Text>
               <Paper mt="auto" p="md" radius="md" bg="white" shadow="sm" style={{ borderLeft: '4px solid var(--mantine-color-violet-5)'}}>
                 <Text size="sm" fs="italic" c="dark.7" fw={500}>"Wow, the lighting in this shot is incredible! Did you use a reflector for this?"</Text>
               </Paper>
            </Card>

            {/* Automate Boring */}
            <Card p={40} className={`${sharedClasses.bentoCard} ${sharedClasses.hoverCard}`} bg="orange.0">
               <ThemeIcon size={50} radius="md" color="orange" variant="light" mb="lg">
                 <Clock size={24} />
               </ThemeIcon>
               <Title order={4} fw={800} mb="sm" c="orange.9">Automate the boring stuff.</Title>
               <Text c="orange.8" size="md" lh={1.6}>Following, unfollowing, liking, viewing stories—it's all handled. Get the benefits of 4 hours of networking without touching your phone.</Text>
            </Card>

            {/* Setup */}
            <Card p={40} className={`${sharedClasses.bentoCard} ${sharedClasses.hoverCard}`} bg="teal.0">
               <ThemeIcon size={50} radius="md" color="teal" variant="light" mb="lg">
                 <Cpu size={24} />
               </ThemeIcon>
               <Title order={4} fw={800} mb="sm" c="teal.9">Setup takes 2 minutes.</Title>
               <Text c="teal.8" size="md" lh={1.6}>No hacking required. Just plug your Android phone into your PC with a USB cable, enable debugging mode, and SlyBot takes the wheel.</Text>
            </Card>

            {/* Human Looking - Wide Bottom */}
            <Card p={40} className={`${sharedClasses.bentoCard} ${sharedClasses.hoverCard} ${classes.featCardWideBottom}`} bg="gray.0">
               <Group wrap="nowrap" align="flex-start" gap="xl">
                 <ThemeIcon size={60} radius="md" color="dark" variant="white" shadow="sm">
                   <Fingerprint size={32} />
                 </ThemeIcon>
                 <div>
                   <Title order={3} fw={800} mb="sm" c="dark.9">Human-looking interactions.</Title>
                   <Text c="dark.6" size="lg" lh={1.6} maw={800}>SlyBot mimics sloppy taps, slow and fast swipes, messy keyboard writes. It looks exactly like a human, and is therefore undetectable. The best part? Your phone is connected right next to you, so you can watch and verify everything it does until you trust it completely!</Text>
                 </div>
               </Group>
            </Card>

          </div>
        </Container>
      </section>

      {/* 6. FAQ SECTION */}
      <section className={sharedClasses.sectionAlt}>
        <Container size="sm">
          <Title order={2} ta="center" mb={60} className={sharedClasses.sectionTitle}>Frequently Asked Questions</Title>
          <Accordion 
            variant="separated" 
            radius="lg" 
            chevronPosition="right"
            classNames={{
              item: classes.faqItem,
              control: classes.faqControl,
              content: classes.faqContent
            }}
          >
            <Accordion.Item value="password">
              <Accordion.Control><Text size="lg" fw={700}>Do I need to give you my Instagram password?</Text></Accordion.Control>
              <Accordion.Panel>
                <Text c="dimmed" lh={1.6}>No. Absolutely not. Because SlyBot is a local Windows app that talks to your physical phone, we never ask for your login credentials. SlyBot just controls the Instagram app that is already safely logged in on your device.</Text>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="free">
              <Accordion.Control><Text size="lg" fw={700}>Is it really free? What's the catch?</Text></Accordion.Control>
              <Accordion.Panel>
                <Text c="dimmed" lh={1.6}>There is no catch. The basic version of SlyBot is entirely free to download and use. We don't even ask for your email address. We want you to try it, get comfortable with it, and watch your audience grow quietly. Once you see the value, you can easily upgrade to a paid plan to unlock more advanced automation features.</Text>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="banned">
              <Accordion.Control><Text size="lg" fw={700}>What are the risks of my account getting banned?</Text></Accordion.Control>
              <Accordion.Panel>
                <Text c="dimmed" lh={1.6}>Because SlyBot uses real human touches on a real phone, Meta literally cannot detect the software itself. The only way Instagram catches bots is through behavioral patterns (e.g., liking posts 24/7 without sleeping). To keep you completely safe, SlyBot comes pre-loaded with smart, built-in human limits and randomized delays. It takes breaks, sleeps at night, and acts exactly like a real human.</Text>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="all-i-need">
              <Accordion.Control><Text size="lg" fw={700}>Is SlyBot all I need to grow my business?</Text></Accordion.Control>
              <Accordion.Panel>
                <Text c="dimmed" lh={1.6}>No. SlyBot is a megaphone, but you still need to have something worth saying. You still need to create great content that provides value to your niche. If your content is bad, bringing people to your page won't help. But if your content is great and you just need eyeballs on it? That is exactly what we do.</Text>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="phone" radius="lg" mb="md">
              <Accordion.Control icon={<Info size={18}/>}><Text size="lg" fw={700}>Do I need a spare phone?</Text></Accordion.Control>
              <Accordion.Panel>
                <Text c="dimmed" lh={1.6}>You can use your daily phone, but we recommend a cheap $50 burner Android for 24/7 growth.</Text>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="pc" radius="lg" mb="md">
              <Accordion.Control icon={<Info size={18}/>}><Text size="lg" fw={700}>Can I use my PC while it's running?</Text></Accordion.Control>
              <Accordion.Panel>
                <Text c="dimmed" lh={1.6}>Absolutely. SlyBot runs in the background. Your phone does the work, your PC stays free.</Text>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="apple" radius="lg" mb="md">
              <Accordion.Control icon={<Info size={18}/>}><Text size="lg" fw={700}>Why not iPhone?</Text></Accordion.Control>
              <Accordion.Panel>
                <Text c="dimmed" lh={1.6}>Apple's ecosystem is too restricted for ADB control. Android allows us to provide this high level of safety.</Text>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Container>
      </section>

      {/* 7. FINAL CALL TO ACTION */}
      <section className={sharedClasses.ctaSection}>
        <Container size="md" className={sharedClasses.ctaContainer}>
          <Title order={2} className={sharedClasses.ctaTitle}>
            Ready to stop scrolling?<br/>It doesn’t cost a thing to try.
          </Title>
          <Text size="xl" c="violet.1" maw={700} lh={1.6} mt="md">
            We made the basic version of Slybot entirely free so you can see the magic for yourself. Just download the app, plug in your Android phone, and get your time back.
          </Text>
          
          <List 
            spacing="sm" 
            size="md" 
            center 
            c="white" 
            mt="xl"
            mb="xl"
            icon={
              <ThemeIcon color="teal" size={24} radius="xl">
                <CheckCircle2 size={16} />
              </ThemeIcon>
            }
          >
            <List.Item><Text fw={500}>No credit card required.</Text></List.Item>
            <List.Item><Text fw={500}>No account creation required.</Text></List.Item>
            <List.Item><Text fw={500}>No email required.</Text></List.Item>
          </List>

          <Button 
            size="xl" 
            radius="xl" 
            className={classes.buttonCta} 
            rightSection={<ChevronRight size={20} />}
          >
            Download SlyBot for Free (Windows .exe)
          </Button>
          <Text size="sm" mt="lg" c="violet.2" fw={500} opacity={0.8}>
            The basic features are free forever. Upgrade only when you want more power.
          </Text>
        </Container>
        
        {/* Decorative CTA glow */}
        <div className={classes.ctaGlow} />
      </section>
    </MarketingLayout>
  );
}
