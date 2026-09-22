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
import copy from '../data/index_copy.json';

export default function Index() {
  return (
    <MarketingLayout>
      {/* 1. HERO SECTION */}
      <section className={classes.heroSection}>
        <div className={classes.heroGridPattern} />
        <div className={classes.heroGlow} />
        
        <Container size="lg" className={classes.relativeZ}>
          <Title className={classes.heroTitle} ta="center" order={1}>
            {copy.hero.title1} <br />
            <span className={classes.textGradient}>{copy.hero.title2}</span>
          </Title>
          
          <Container size="md" p={0} mt="xl">
            <Text className={classes.heroSubtitle} ta="center" size="xl" mb="2xl" fw={500}>
              {copy.hero.subtitle}
            </Text>
            
            {/* The Results Checklist */}
            <Group justify="center" gap="xl" mb="xl" mt="xl">
              {copy.hero.checklist.map((item, index) => (
                <Group gap="sm" key={index}><CheckCircle2 size={20} className={classes.iconTeal}/><Text fw={600} size="md">{item}</Text></Group>
              ))}
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
            src={copy.hero.image.src} 
            alt={copy.hero.image.alt} 
            className={classes.heroImage}
          />
        </Box>

        <Container size="lg" className={classes.relativeZ}>
          <Container size="md" p={0}>
            <Box className={classes.promiseBox} mx="auto" maw={750} mt={40}>
              <Text c="dimmed" ta="center" size="lg" lh={1.7}>
                {copy.hero.promise1}
                <Text span fw={700} c="violet.6">{copy.hero.promise2}</Text>{copy.hero.promise3}
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
              {copy.hero.button}
            </Button>
          </Group>
        </Container>
      </section>

      {/* 2. AGENTIC VS FRUGAAST WORKFLOW */}
      <section className={classes.sectionAlt}>
        <Container size="lg">
          <Stack align="center" mb={60}>
            <Title order={2} ta="center" className={classes.sectionTitle}>
              {copy.workflow.title}
            </Title>
              <Text c="dimmed" size="lg" ta="center" maw={700} lh={1.7}>
              {copy.workflow.subtitle1}
              <br/>
              {copy.workflow.subtitle2}
            </Text>
          </Stack>

          <Grid gutter={{ base: 'xl', md: 'xl' }}>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Box h="100%" className={`${classes.splitCompareCard} ${classes.compareColBefore}`}>
                <div className={classes.workflowImageWrapper}>
                  <img src={copy.workflow.imageBefore.src} alt={copy.workflow.imageBefore.alt} />
                </div>
              </Box>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Box h="100%" className={`${classes.splitCompareCard} ${classes.compareColAfter}`}>
                <div className={classes.workflowImageWrapper}>
                  <img src={copy.workflow.imageAfter.src} alt={copy.workflow.imageAfter.alt} />
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
              {copy.different.subtitle}
            </Title>
          <Title order={1} ta="center" className={classes.heroTitle}>
            {copy.different.title1} <span className={classes.textGradient}>{copy.different.title2}</span>
          </Title>
        </Container>
      </section>

      {/* 3. EXCEPTIONALLY CLEAN CODE */}
      <section className={classes.section}>
        <Container size="lg">
          <Grid align="center" gutter={{ base: 60, md: 80 }}>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Title order={2} mb="xl" className={classes.sectionTitle} ta="left">
                {copy.cleanCode.title}
              </Title>
              <Text size="lg" c="dimmed" mb="md" lh={1.7}>
                {copy.cleanCode.para1_1}<br/>
                {copy.cleanCode.para1_2} 
              </Text>
              <Text size="lg" c="dimmed" mb="xl" lh={1.7}>
                {copy.cleanCode.para2}
              </Text>
              
              <Stack gap="xl">
                <Flex align="center" gap="md">
                  <ThemeIcon size={40} radius="md" color="violet.1" c="violet.7">
                    <Search size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={700} size="lg" mb={4}>{copy.cleanCode.features[0].title}</Text>
                    <Text c="dimmed" lh={1.6}>{copy.cleanCode.features[0].desc1}<br/>{copy.cleanCode.features[0].desc2}</Text>
                  </div>
                </Flex>
                <Flex align="center" gap="md">
                  <ThemeIcon size={40} radius="md" color="violet.1" c="violet.7">
                    <Zap size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={700} size="lg" mb={4}>{copy.cleanCode.features[1].title}</Text>
                    <Text c="dimmed" lh={1.6}>{copy.cleanCode.features[1].desc1}</Text>
                  </div>
                </Flex>
                <Flex align="center" gap="md">
                  <ThemeIcon size={40} radius="md" color="violet.1" c="violet.7">
                    <FileCode size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={700} size="lg" mb={4}>{copy.cleanCode.features[2].title}</Text>
                    <Text c="dimmed" lh={1.6}>{copy.cleanCode.features[2].desc1} <br/>{copy.cleanCode.features[2].desc2}</Text>
                  </div>
                </Flex>
              </Stack>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <div className={classes.imagePlaceholderWrapper}>
                <img src={copy.cleanCode.image.src} alt={copy.cleanCode.image.alt} />
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
                <img src={copy.costControl.image.src} alt={copy.costControl.image.alt} />
              </div>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }} order={{ base: 1, md: 2 }}>
              <Title order={2} mb="xl" className={classes.sectionTitle} ta="left">
                {copy.costControl.title}
              </Title>
              <Text size="lg" c="dimmed" mb="xl" lh={1.7}>
                {copy.costControl.para1_1} 
                <br/><br/>
                {copy.costControl.para1_2} <br/>
                {copy.costControl.para1_3}
              </Text>
              
              <Stack gap="xl">
                <Flex align="center" gap="md">
                  <ThemeIcon size={40} radius="md" color="violet.1" c="violet.7">
                    <Gauge size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={700} size="lg" mb={4}>{copy.costControl.features[0].title}</Text>
                    <Text c="dimmed" lh={1.6}>{copy.costControl.features[0].desc}</Text>
                  </div>
                </Flex>
                <Flex align="center" gap="md">
                  <ThemeIcon size={40} radius="md" color="violet.1" c="violet.7">
                    <Cpu size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={700} size="lg" mb={4}>{copy.costControl.features[1].title}</Text>
                    <Text c="dimmed" lh={1.6}>{copy.costControl.features[1].desc}</Text>
                  </div>
                </Flex>
                <Flex align="center" gap="md">
                  <ThemeIcon size={40} radius="md" color="violet.1" c="violet.7">
                    <Wallet size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={700} size="lg" mb={4}>{copy.costControl.features[2].title}</Text>
                    <Text c="dimmed" lh={1.6}>{copy.costControl.features[2].desc}</Text>
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
                {copy.philosophy.title}
              </Title>
              <Text size="lg" c="dimmed" mb="xl" lh={1.7}>
                {copy.philosophy.para1}
              </Text>
              <Text size="lg" c="dimmed" mb="md" lh={1.7}>
                {copy.philosophy.para2}
              </Text>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <div className={classes.imagePlaceholderWrapper}>
                 <img src={copy.philosophy.image.src} alt={copy.philosophy.image.alt} />
              </div>
            </Grid.Col>
          </Grid>
        </Container>
      </section>

      {/* 6. FINAL CALL TO ACTION */}
      <section className={classes.ctaSection}>
        <Container size="md" className={classes.relativeZ}>
          <Title order={2} className={classes.ctaTitle}>
            {copy.cta.title}
          </Title>
          <Text size="xl" c="violet.1" maw={700} mx="auto" ta="center" lh={1.6} mt="lg" fw={400}>
            {copy.cta.subtitle1} <br/>{copy.cta.subtitle2} 
            <br/><br/>
            {copy.cta.subtitle3}
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
              {copy.cta.button}
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
