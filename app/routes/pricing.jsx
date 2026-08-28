import { 
  Container, Title, Text, Button, Group, Stack, Grid, Box, ThemeIcon, Flex, Divider, Badge
} from '@mantine/core';
import { 
  Check, X, AlertCircle, Building2, User, Sparkles, Globe2, Tag, ArrowRight
} from 'lucide-react';
import { MarketingLayout } from '../components/MarketingLayout';

export default function Pricing() {
  return (
    <MarketingLayout>
      <section className="relative pt-[120px] pb-[80px] overflow-hidden bg-white">
        <div className="hero-grid-pattern" />
        <div className="hero-glow" />
        
        <Container size="lg" className="relative z-10">
          <Stack align="center" mb={60}>
            <Title ta="center" className="section-title">
              Simple, developer-first pricing.
            </Title>
            <Text c="dimmed" size="xl" ta="center" maw={700} lh={1.7} mt="md" fw={500}>
              Free core features for personal use. 
              <br />Lifetime licenses — pay once, own it forever. 
              <br />Renew only for updates.
            </Text>
            <Box 
              bg="gray.0" 
              p="md" 
              mt="xl" 
              style={{ border: '1px solid var(--mantine-color-gray-2)', borderRadius: '12px' }}
              maw={650}
            >
              <Group gap="sm" justify="center">
                <Sparkles size={18} className="text-violet-600" />
                <Text size="sm" fw={500} c="dark.8">
                  Bring your own API keys. No markups. 
                  <br />Use the built-in cost analyzer to see exactly where your tokens are going—down to the cent.
                </Text>
              </Group>
            </Box>
          </Stack>

          <Grid gutter={30} align="stretch" mt={50}>
            {/* Free Tier */}
            <Grid.Col span={{ base: 12, md: 4 }}>
              <div className="pricing-card">
                <Text fw={700} size="xl" c="dark.9">Free Edition</Text>
                <Text c="dimmed" size="sm" mt={6} mih={48}>For evaluating the power of context control.</Text>
                
                <div className="pricing-price-group">
                  <span className="pricing-currency">$</span>
                  <span className="pricing-amount">0</span>
                </div>
                <Text c="dimmed" size="sm" fw={500} mb="xl">Forever free<br />No credit card required</Text>

                <Button variant="default" size="md" radius="md" fullWidth mb="xl" color="gray.2" component="a" href="/download">
                  Download Free
                </Button>

                <Divider mb="xl" />

                <Stack gap="md" mt="auto">
                  {/* The ONE positive feature of the free tier */}
                  <Flex align="center" gap="sm">
                    <ThemeIcon color="gray.1" c="gray.6" size={24} radius="xl">
                      <Check size={14} strokeWidth={3} />
                    </ThemeIcon>
                    <Text size="sm" fw={500}>95% of premium features</Text>
                  </Flex>

                  {/* The limitations, reworded and softened visually */}
                  <Flex align="center" gap="sm">
                    <ThemeIcon color="orange.1" c="orange.6" size={24} radius="xl">
                      <AlertCircle size={14} strokeWidth={3} />
                    </ThemeIcon>
                    <Text size="sm" c="dimmed">Limit of 3 active project workspaces</Text>
                  </Flex>
                  <Flex align="center" gap="sm">
                    <ThemeIcon color="orange.1" c="orange.6" size={24} radius="xl">
                      <AlertCircle size={14} strokeWidth={3} />
                    </ThemeIcon>
                    <Text size="sm" c="dimmed">Attribution appended to copied context</Text>
                  </Flex>
                  <Flex align="center" gap="sm">
                    <ThemeIcon color="orange.1" c="orange.6" size={24} radius="xl">
                      <AlertCircle size={14} strokeWidth={3} />
                    </ThemeIcon>
                    <Text size="sm" c="dimmed">Occasional upgrade reminders</Text>
                  </Flex>
                </Stack>
              </div>
            </Grid.Col>

            {/* Personal Tier */}
            <Grid.Col span={{ base: 12, md: 4 }}>
              <div className="pricing-card pricing-card-popular">
                
                <Group gap="sm">
                  <User size={24} className="text-violet-600" />
                  <Text fw={700} size="xl" c="dark.9">Personal License</Text>
                </Group>
                
                <Text c="dimmed" size="sm" mt={6} mih={48}>For solo developers and indie hackers.</Text>
                
                <div className="pricing-price-group">
                  <span className="pricing-currency">$</span>
                  <span className="pricing-amount">59</span>
                </div>
                <Text c="dimmed" size="sm" fw={500} mb="xl">
                  One-time payment<br /><Text span c="violet.6">$29 optional</Text> yearly renewal
                </Text>

                <Button 
                  size="md" 
                  radius="md" 
                  fullWidth 
                  mb="xl" 
                  color="dark.9"
                  style={{ transition: "transform 0.2s ease" }}
                  className="hover:-translate-y-0.5"
                  component="a"
                  href="https://buy.stripe.com/test_cNi8wJ6xv3sL1os1pXasg00"
                >
                  Buy Personal License
                </Button>

                <Divider mb="xl" />

                <Stack gap="md" mt="auto">
                  <Flex align="center" gap="sm">
                    <ThemeIcon color="violet.1" c="violet.7" size={24} radius="xl">
                      <Check size={14} strokeWidth={3} />
                    </ThemeIcon>
                    <Text size="sm" fw={600}>Unlimited project workspaces</Text>
                  </Flex>
                  <Flex align="center" gap="sm">
                    <ThemeIcon color="violet.1" c="violet.7" size={24} radius="xl">
                      <Check size={14} strokeWidth={3} />
                    </ThemeIcon>
                    <Text size="sm" fw={600}>No watermarks, no nagging</Text>
                  </Flex>
                  <Flex align="center" gap="sm">
                    <ThemeIcon color="violet.1" c="violet.7" size={24} radius="xl">
                      <Check size={14} strokeWidth={3} />
                    </ThemeIcon>
                    <Text size="sm" fw={500}>1 year of software updates</Text>
                  </Flex>
                  <Flex align="center" gap="sm">
                    <ThemeIcon color="violet.1" c="violet.7" size={24} radius="xl">
                      <Check size={14} strokeWidth={3} />
                    </ThemeIcon>
                    <Text size="sm" fw={500}>Perpetual fallback license*</Text>
                  </Flex>
                </Stack>
              </div>
            </Grid.Col>

            {/* Commercial Tier */}
            <Grid.Col span={{ base: 12, md: 4 }}>
              <div className="pricing-card">
                <Group gap="sm">
                  <Building2 size={24} className="text-slate-700" />
                  <Text fw={700} size="xl" c="dark.9">Commercial License</Text>
                </Group>
                <Text c="dimmed" size="sm" mt={6} mih={48}>For work projects and enterprise teams.</Text>
                
                <div className="pricing-price-group">
                  <span className="pricing-currency">$</span>
                  <span className="pricing-amount">119</span>
                </div>
                <Text c="dimmed" size="sm" fw={500} mb="xl">
                  One-time payment<br /><Text span c="dark.9">$59 optional</Text> yearly renewal
                </Text>

                <Button variant="outline" size="md" radius="md" fullWidth mb="xl" color="dark.9" className="hover:bg-slate-50" component="a" href="https://buy.stripe.com/test_bJe7sF5tr5ATc363y5asg01">
                  Buy Commercial License
                </Button>

                <Divider mb="xl" />

                <Stack gap="md" mt="auto">
                  <Flex align="center" gap="sm">
                    <ThemeIcon color="gray.1" c="dark.9" size={24} radius="xl">
                      <Check size={14} strokeWidth={3} />
                    </ThemeIcon>
                    <Text size="sm" fw={600}>Everything in Personal</Text>
                  </Flex>
                  <Flex align="center" gap="sm">
                    <ThemeIcon color="gray.1" c="dark.9" size={24} radius="xl">
                      <Check size={14} strokeWidth={3} />
                    </ThemeIcon>
                    <Text size="sm" fw={500}>Legal for commercial use</Text>
                  </Flex>
                  <Flex align="center" gap="sm">
                    <ThemeIcon color="gray.1" c="dark.9" size={24} radius="xl">
                      <Check size={14} strokeWidth={3} />
                    </ThemeIcon>
                    <Text size="sm" fw={500}>Proper company invoices</Text>
                  </Flex>
                  <Flex align="center" gap="sm">
                    <ThemeIcon color="gray.1" c="dark.9" size={24} radius="xl">
                      <Check size={14} strokeWidth={3} />
                    </ThemeIcon>
                    <Text size="sm" fw={500}>Priority email support</Text>
                  </Flex>
                </Stack>
              </div>
            </Grid.Col>
          </Grid>

          {/* Early Adopter Banner */}
          {/* <Container size="md" p={0} mt={60}>
            <Box className="discount-banner">
              <Group gap="sm">
                <ThemeIcon color="violet.1" c="violet.7" size={40} radius="xl">
                  <Tag size={20} />
                </ThemeIcon>
                <div>
                  <Text fw={700} size="lg" c="dark.9">Early Adopter Discount</Text>
                  <Text c="dimmed" size="sm">Get 30% off your lifetime license during our beta phase.</Text>
                </div>
              </Group>
              <Badge size="lg" radius="sm" color="violet.6" variant="filled" fw={700}>
                USE CODE: FRUGAL30
              </Badge>
            </Box>
          </Container> */}

          {/* Purchasing Power Parity & FAQ Info */}
          {/* <Container size="md" p={0}>
            <Box className="ppp-box">
              <Group justify="center" mb="md">
                <ThemeIcon size={48} radius="xl" color="teal.1" c="teal.7">
                  <Globe2 size={24} />
                </ThemeIcon>
              </Group>
              <Title order={3} size="h3" mb="xs">We support Purchasing Power Parity (PPP)</Title>
              <Text c="dimmed" size="md" lh={1.6} maw={600} mx="auto">
                We believe excellent developer tools should be accessible worldwide. If you live in a country with lower purchasing power, 
                you can get Frugäast at a price that makes sense for your local economy.
              </Text>
              <Button variant="subtle" color="teal.7" mt="md" rightSection={<ArrowRight size={16} />}>
                Check your local pricing
              </Button>
            </Box>

            <Text ta="center" size="sm" c="dimmed" mt={40}>
              * <b>Perpetual Fallback License:</b> When you buy a license, you own that specific version forever. 
              The optional renewal gives you access to an additional year of feature updates. 
              If you choose not to renew, you can keep using your fallback version indefinitely.
            </Text>
          </Container> */}

          
        </Container>
      </section>
    </MarketingLayout>
  );
}
