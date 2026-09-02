import { Container, Title, Text, Paper, Anchor } from '@mantine/core';
import { MarketingLayout } from '../../components/MarketingLayout';
import sharedClasses from '../../styles/shared.module.css';

export default function Contact() {
  return (
    <MarketingLayout>
      <section className={sharedClasses.section}>
        <Container size="md">
          <Title className={sharedClasses.sectionTitle} mb="xl">Contact Support</Title>
          
          <Text size="lg" c="dimmed" mb={40} lh={1.7}>
            Frugäast is built by developers, for developers. We want to make sure you get the help you need without navigating a maze of support bots.
          </Text>

          <Paper className={sharedClasses.glassCard} p="xl" radius="md" mb="xl">
            <Title order={2} size="h3" mb="md">Technical Issues & Bug Reports</Title>
            <Text c="dimmed" mb="lg" lh={1.6}>
              If you've found a bug, want to request a feature, or need help with a technical issue, the absolute best place to reach out is on GitHub. This keeps our development process transparent and helps other users who might have the same question.
            </Text>
            <Anchor 
              href="https://github.com/Frugaast/frugaast/issues" 
              target="_blank" 
              fw={600}
              c="violet.6"
            >
              &rarr; Open an issue on GitHub
            </Anchor>
          </Paper>

          <Paper className={sharedClasses.glassCard} p="xl" radius="md">
            <Title order={2} size="h3" mb="md">Billing & License Inquiries</Title>
            <Text c="dimmed" mb="lg" lh={1.6}>
              For questions about your lifetime license, Stripe payments, lost license keys, or private inquiries, please send an email. You are talking to a human, so please allow up to 48 hours for a response.
            </Text>
            <Anchor 
              href="mailto:contact@frugaast.dev" 
              fw={600}
              c="violet.6"
            >
              &rarr; Email contact@frugaast.dev
            </Anchor>
          </Paper>
        </Container>
      </section>
    </MarketingLayout>
  );
}
