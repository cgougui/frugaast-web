import { useState } from 'react';
import { 
  Container, Title, Text, Button, Group, Stack, Grid, Card, 
  ThemeIcon, Badge, Paper, Center, Box, Alert, Image
} from '@mantine/core';
import { 
  Sparkles, Cable, Settings, Lightbulb, 
  CheckCircle2, ChevronLeft, ChevronRight, Terminal
} from 'lucide-react';
import { MarketingLayout } from '../components/MarketingLayout';

import sharedClasses from '../styles/shared.module.css';
import classes from './setup-guide.module.css';

export default function SetupGuide() {
  const [activeSlideStep2, setActiveSlideStep2] = useState(0);
  const [activeSlideStep3, setActiveSlideStep3] = useState(0);
  
  const totalSlidesStep2 = 3;
  const totalSlidesStep3 = 2;

  const nextSlideStep2 = () => setActiveSlideStep2((p) => Math.min(p + 1, totalSlidesStep2 - 1));
  const prevSlideStep2 = () => setActiveSlideStep2((p) => Math.max(p - 1, 0));
  const handleImageClickStep2 = () => setActiveSlideStep2((p) => (p + 1) % totalSlidesStep2);

  const nextSlideStep3 = () => setActiveSlideStep3((p) => Math.min(p + 1, totalSlidesStep3 - 1));
  const prevSlideStep3 = () => setActiveSlideStep3((p) => Math.max(p - 1, 0));
  const handleImageClickStep3 = () => setActiveSlideStep3((p) => (p + 1) % totalSlidesStep3);

  return (
    <MarketingLayout>
      
      {/* 1. HERO SECTION */}
      <section className={sharedClasses.hero}>
        <div className={classes.heroGrid} />
        
        <Container size="md" className={sharedClasses.relativeZ} ta="center">
          <Center mb="xl">
            <Badge 
              variant="light" 
              color="indigo" 
              size="lg" 
              radius="xl" 
              className={sharedClasses.pillBadge}
              leftSection={<Sparkles size={14} />}
            >
              Installation
            </Badge>
          </Center>
          
          <Title className={sharedClasses.heroTitle} order={1}>
            <span className={sharedClasses.textGradient}>Setup Guide</span> (5 minutes)
          </Title>
          
          <Title order={2} size="h3" c="dark.8" mt="xl" fw={700}>
            You don’t need an IT degree to get your time back.
          </Title>

          <Text className={sharedClasses.heroSubtitle} size="xl" mt="md" lh={1.6}>
            Because SlyBot doesn't use risky cloud servers or hack into Instagram's backend API, we need to create a secure, physical bridge between your computer and your phone. This local connection is the "secret sauce" that makes you 100% immune to shadowbans.
          </Text>
          <Text className={sharedClasses.heroSubtitle} size="xl" mt="sm" lh={1.6}>
            Setting it up takes less than two minutes. You only have to do it once, and we’ll hold your hand the entire way. 
          </Text>
          <Text className={sharedClasses.heroSubtitle} size="xl" mt="sm" fw={600} c="dark.8">
            Here is how to get started.
          </Text>
        </Container>
      </section>

      {/* 2. THE GUIDE STEPS */}
      <section className={sharedClasses.sectionAlt}>
        <Container size="lg">
          <Stack gap={60}>

            {/* STEP 1: Text Left, Image Right */}
            <Card radius="2rem" p={0} className={classes.stepCard}>
              <Grid gutter={0} align="stretch">
                <Grid.Col span={{ base: 12, md: 7 }} p={{ base: 30, md: 50 }} order={{ base: 1, md: 1 }}>
                  <Badge color="violet" variant="light" mb="md" size="lg" radius="sm" fw={800}>Step 1</Badge>
                  <Title order={3} fw={900} mb="md" size="h2" c="dark.9">
                    Connect your phone to your computer
                  </Title>
                  <Text size="lg" c="dimmed" lh={1.7} mb="md">
                    To run Instagram on autopilot, we first need to link your devices so your computer can send physical "taps" and "swipes" to your phone screen. 
                  </Text>
                  <Text size="lg" c="dimmed" lh={1.7} mb="xl">
                    Don't worry, it's easier than it sounds. 
                  </Text>
                  <Paper radius="md" p="lg" bg="var(--mantine-color-gray-0)" border="1px solid var(--mantine-color-gray-2)">
                    <Group wrap="nowrap" align="flex-start">
                      <ThemeIcon size={40} radius="md" color="violet" variant="light">
                        <Cable size={20} />
                      </ThemeIcon>
                      <Text c="dark.8" lh={1.6} fw={500}>
                        Grab a standard USB cable (make sure it's a data-sync cable, not just a cheap charging cable) and plug your Android phone directly into your computer.
                      </Text>
                    </Group>
                  </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 5 }} order={{ base: 2, md: 2 }} className={classes.imageColumnRight} bg="violet.0">
                  <div className={classes.imageWrapperBleed}>
                    <Image 
                      src="/images/setup-guide/plug_usb.png" 
                      alt="Graphic showing a phone connecting to a laptop via USB" 
                      w="100%"
                      h="100%"
                      fit="cover"
                      fallbackSrc="https://placehold.co/800x600/e0e7ff/4f46e5?text=plug_usb.png"
                    />
                  </div>
                </Grid.Col>
              </Grid>
            </Card>

            {/* STEP 2: Image Left, Text Right */}
            <Card radius="2rem" p={0} className={classes.stepCard}>
              <Grid gutter={0} align="stretch">
                <Grid.Col span={{ base: 12, md: 7 }} p={{ base: 30, md: 50 }} order={{ base: 1, md: 2 }}>
                  <Badge color="blue" variant="light" mb="md" size="lg" radius="sm" fw={800}>Step 2</Badge>
                  <Title order={3} fw={900} mb="md" size="h2" c="dark.9">
                    Enable "Developer Mode"
                  </Title>
                  <Text size="lg" c="dimmed" lh={1.7} mb="xl">
                    To let your computer talk to your screen, we need to activate a safe, built-in Android feature called Developer Mode. It sounds intense, but it's just a hidden menu that gives us the permissions we need to automate your actions.
                  </Text>
                  
                  <Text fw={700} size="lg" mb="md" c="dark.9">Here is the secret knock to open it:</Text>
                  
                  <Stack gap="md" className={classes.instructionList}>
                    <Group wrap="nowrap">
                      <div className={classes.listNumber}>1</div>
                      <Text size="lg" fw={500}>Open your phone's <b>Settings</b>.</Text>
                    </Group>
                    <Group wrap="nowrap">
                      <div className={classes.listNumber}>2</div>
                      <Text size="lg" fw={500}>Scroll down and tap <b>About Phone</b> &gt; <b>Software Information</b>.</Text>
                    </Group>
                    <Group wrap="nowrap">
                      <div className={classes.listNumber}>3</div>
                      <Text size="lg" fw={500}>Find <b>'Build Number'</b> and tap it <b>7 times rapidly</b>.</Text>
                    </Group>
                  </Stack>

                  <Alert variant="light" color="blue" mt="xl" icon={<Settings size={20} />}>
                    <Text fw={600} c="blue.9">A little message will pop up saying, <i>"You are now a developer!"</i></Text>
                  </Alert>
                </Grid.Col>
                
                <Grid.Col span={{ base: 12, md: 5 }} order={{ base: 2, md: 1 }} className={classes.imageColumnLeft} bg="blue.0">
                  <div className={classes.carouselContainer}>
                    <div 
                      className={classes.carouselTrack}
                      style={{ transform: `translateX(-${activeSlideStep2 * 100}%)` }}
                    >
                      <div className={classes.carouselSlide} onClick={handleImageClickStep2}>
                        <Image 
                          src="/images/setup-guide/build_number_1.png" 
                          alt="Screenshot highlighting the 'Build Number' row step 1" 
                          w="100%"
                          h="100%"
                          fit="cover"
                          fallbackSrc="https://placehold.co/800x600/e0f2fe/0284c7?text=build_number_1.png"
                        />
                      </div>
                      <div className={classes.carouselSlide} onClick={handleImageClickStep2}>
                        <Image 
                          src="/images/setup-guide/build_number_2.png" 
                          alt="Screenshot highlighting the 'Build Number' row step 2" 
                          w="100%"
                          h="100%"
                          fit="cover"
                          fallbackSrc="https://placehold.co/800x600/e0f2fe/0284c7?text=build_number_2.png"
                        />
                      </div>
                      <div className={classes.carouselSlide} onClick={handleImageClickStep2}>
                        <Image 
                          src="/images/setup-guide/build_number_3.png" 
                          alt="Screenshot highlighting the 'Build Number' row step 3" 
                          w="100%"
                          h="100%"
                          fit="cover"
                          fallbackSrc="https://placehold.co/800x600/e0f2fe/0284c7?text=build_number_3.png"
                        />
                      </div>
                    </div>

                    <div className={classes.carouselControls}>
                      <button 
                        className={classes.carouselButton} 
                        onClick={prevSlideStep2} 
                        disabled={activeSlideStep2 === 0}
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <div className={classes.carouselIndicators}>
                        {[0, 1, 2].map(idx => (
                          <div 
                            key={idx} 
                            className={`${classes.carouselDot} ${activeSlideStep2 === idx ? classes.carouselDotActive : ''}`}
                            onClick={() => setActiveSlideStep2(idx)}
                          />
                        ))}
                      </div>
                      <button 
                        className={classes.carouselButton} 
                        onClick={nextSlideStep2} 
                        disabled={activeSlideStep2 === totalSlidesStep2 - 1}
                        aria-label="Next image"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                </Grid.Col>
              </Grid>
            </Card>

            {/* STEP 3: Text Left, Image Right */}
            <Card radius="2rem" p={0} className={classes.stepCard}>
              <Grid gutter={0} align="stretch">
                <Grid.Col span={{ base: 12, md: 7 }} p={{ base: 30, md: 50 }} order={{ base: 1, md: 1 }}>
                  <Badge color="teal" variant="light" mb="md" size="lg" radius="sm" fw={800}>Step 3</Badge>
                  <Title order={3} fw={900} mb="md" size="h2" c="dark.9">
                    Enable USB Debugging
                  </Title>
                  <Text size="lg" c="dimmed" lh={1.7} mb="md">
                    Now that you've unlocked the menu, we just need to flip one toggle. 
                  </Text>
                  <Text size="lg" c="dimmed" lh={1.7} mb="xl">
                    "USB Debugging" is the official Android feature that allows the SlyBot Windows app to control your phone and run Instagram for you.
                  </Text>
                  
                  <Stack gap="md" className={classes.instructionList}>
                    <Group wrap="nowrap">
                      <div className={classes.listNumber}>1</div>
                      <Text size="lg" fw={500}>Go back to your main <b>Settings</b> menu.</Text>
                    </Group>
                    <Group wrap="nowrap">
                      <div className={classes.listNumber}>2</div>
                      <Text size="lg" fw={500}>Scroll to the very bottom—you will see a brand new menu called <b>Developer Options</b>. Tap it.</Text>
                    </Group>
                    <Group wrap="nowrap">
                      <div className={classes.listNumber}>3</div>
                      <Text size="lg" fw={500}>Scroll down to find <b>USB Debugging</b> and turn the switch <b>ON</b>.</Text>
                    </Group>
                  </Stack>

                  {/* App Status Indicator */}
                  <Box mt="xl">
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={1} mb="xs">Notice your SlyBot desktop app?</Text>
                    <Paper className={classes.appStatusBox} p="md" radius="md">
                      <Group gap="sm">
                        <Terminal size={18} color="var(--mantine-color-teal-4)" />
                        <Text c="teal.1" ff="monospace" size="sm">It will now say: ⏳ Scanning for your phone...</Text>
                      </Group>
                    </Paper>
                  </Box>
                </Grid.Col>
                
                <Grid.Col span={{ base: 12, md: 5 }} order={{ base: 2, md: 2 }} className={classes.imageColumnRight} bg="teal.0">
                  <div className={classes.carouselContainer}>
                    <div 
                      className={classes.carouselTrack}
                      style={{ transform: `translateX(-${activeSlideStep3 * 100}%)` }}
                    >
                      <div className={classes.carouselSlide} onClick={handleImageClickStep3}>
                        <Image 
                          src="/images/setup-guide/usb_debugging_1.png" 
                          alt="Screenshot showing the USB Debugging toggle step 1" 
                          w="100%"
                          h="100%"
                          fit="cover"
                          fallbackSrc="https://placehold.co/800x600/ccfbf1/0f766e?text=usb_debugging_1.png"
                        />
                      </div>
                      <div className={classes.carouselSlide} onClick={handleImageClickStep3}>
                        <Image 
                          src="/images/setup-guide/usb_debugging_2.png" 
                          alt="Screenshot showing the USB Debugging toggle step 2" 
                          w="100%"
                          h="100%"
                          fit="cover"
                          fallbackSrc="https://placehold.co/800x600/ccfbf1/0f766e?text=usb_debugging_2.png"
                        />
                      </div>
                    </div>

                    <div className={classes.carouselControls}>
                      <button 
                        className={classes.carouselButton} 
                        onClick={prevSlideStep3} 
                        disabled={activeSlideStep3 === 0}
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <div className={classes.carouselIndicators}>
                        {[0, 1].map(idx => (
                          <div 
                            key={idx} 
                            className={`${classes.carouselDot} ${activeSlideStep3 === idx ? classes.carouselDotActive : ''}`}
                            onClick={() => setActiveSlideStep3(idx)}
                          />
                        ))}
                      </div>
                      <button 
                        className={classes.carouselButton} 
                        onClick={nextSlideStep3} 
                        disabled={activeSlideStep3 === totalSlidesStep3 - 1}
                        aria-label="Next image"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                </Grid.Col>
              </Grid>
            </Card>

            {/* STEP 4: Image Left, Text Right */}
            <Card radius="2rem" p={0} className={classes.stepCard}>
              <Grid gutter={0} align="stretch">
                <Grid.Col span={{ base: 12, md: 7 }} p={{ base: 30, md: 50 }} order={{ base: 1, md: 2 }}>
                  <Badge color="orange" variant="light" mb="md" size="lg" radius="sm" fw={800}>Step 4</Badge>
                  <Title order={3} fw={900} mb="md" size="h2" c="dark.9">
                    Authorize "USB Debugging" 
                  </Title>
                  <Text size="lg" fw={700} c="orange.6" mb="sm">
                    Look at your phone screen! A security prompt should have just appeared.
                  </Text>
                  <Text size="lg" c="dimmed" lh={1.7} mb="xl">
                    This is Android's built-in security doing its job. It wants to confirm that <i>you</i> are the one authorizing this specific computer to communicate with your phone.
                  </Text>
                  
                  <Stack gap="md" className={classes.instructionList}>
                    <Group wrap="nowrap">
                      <div className={classes.listNumber}>1</div>
                      <Text size="lg" fw={500}>Check the box that says <b>"Always allow from this computer"</b>.</Text>
                    </Group>
                    <Group wrap="nowrap">
                      <div className={classes.listNumber}>2</div>
                      <Text size="lg" fw={500}>Tap <b>Allow</b>.</Text>
                    </Group>
                  </Stack>

                  <Alert variant="light" color="gray" mt="xl" icon={<Lightbulb size={20} />}>
                    <Text size="sm" c="dark.7"><b>Troubleshooting tip:</b> If you don't see the popup right away, just turn 'USB Debugging' off and back on again to trigger it.</Text>
                  </Alert>

                  {/* App Status Indicator */}
                  <Box mt="md">
                    <Paper className={classes.appStatusBox} p="md" radius="md">
                      <Group gap="sm">
                        <Terminal size={18} color="var(--mantine-color-orange-4)" />
                        <Text c="orange.1" ff="monospace" size="sm">Your SlyBot app will say: ⏳ Waiting for you to tap Allow on your phone...</Text>
                      </Group>
                    </Paper>
                  </Box>
                </Grid.Col>
                
                <Grid.Col span={{ base: 12, md: 5 }} order={{ base: 2, md: 1 }} className={classes.imageColumnLeft} bg="orange.0">
                  <div className={classes.imageWrapperBleed}>
                    <Image 
                      src="/images/setup-guide/rsa_popup.jpg" 
                      alt="Screenshot of the Android RSA fingerprint authorization popup" 
                      w="100%"
                      h="100%"
                      fit="cover"
                      fallbackSrc="https://placehold.co/800x600/ffedd5/c2410c?text=rsa_popup.jpg"
                    />
                  </div>
                </Grid.Col>
              </Grid>
            </Card>

            {/* STEP 5 */}
            <Card radius="2rem" p={{ base: 40, md: 60 }} className={classes.successCard} ta="center">
              <Center mb="xl">
                <ThemeIcon size={80} radius="100%" color="green" variant="light">
                  <CheckCircle2 size={48} />
                </ThemeIcon>
              </Center>
              <Badge color="green" variant="filled" mb="md" size="lg" radius="sm" fw={800}>Step 5</Badge>
              <Title order={3} fw={900} mb="md" size="h1" c="dark.9">
                Ready to Automate!
              </Title>
              <Text size="xl" c="dimmed" lh={1.7} mb="xl" maw={800} mx="auto">
                That’s it. You’re done. 
              </Text>

              <Paper className={classes.appStatusBoxSuccess} p="lg" radius="md" maw={600} mx="auto" mb="xl">
                <Text c="green.2" ff="monospace" size="md">Once you tap allow, the SlyBot desktop app will show a green checkmark: <b>"Connection secured!"</b></Text>
              </Paper>

              <Text size="lg" c="dark.7" lh={1.7} mb="xl" maw={800} mx="auto">
                SlyBot has securely verified your physical device and confirmed that the Instagram app is installed. You've officially bypassed the cloud, protected your password, and created an undetectable growth engine right on your desk.
              </Text>
              
              <Title order={4} size="h2" c="green.6" fw={800}>
                You are all set to grow.
              </Title>
            </Card>

          </Stack>
        </Container>
      </section>

      {/* 3. THE CTA / FOOTER SECTION */}
      <section className={sharedClasses.ctaSection}>
        <Container size="md" className={sharedClasses.ctaContainer}>
          <Title order={2} className={sharedClasses.ctaTitle} mb="sm">
            Time to tell SlyBot what to do.
          </Title>
          
          <Text size="xl" c="white" maw={700} lh={1.6} mt="xl" opacity={0.9}>
            Now that your phone is connected, it's time to set up your first campaign. Point SlyBot at your biggest competitors, set your AI comment guidelines, and hit "Start."
          </Text>
          <Text size="xl" c="white" maw={700} lh={1.6} mt="sm" mb="xl" fw={600}>
            Grab a coffee, sit back, and watch your phone screen come to life.
          </Text>

          <Button 
            size="xl" 
            radius="xl" 
            className={classes.buttonCta} 
            mt="md"
            leftSection={<ChevronLeft size={20} />}
          >
            Return to Dashboard
          </Button>
        </Container>
        
        {/* Decorative CTA glow */}
        <div className={classes.ctaGlow} />
      </section>

    </MarketingLayout>
  );
}
