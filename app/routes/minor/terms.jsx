import { Container, Title, Text, Paper, List, Anchor } from '@mantine/core';
import { MarketingLayout } from '../../components/MarketingLayout';
import sharedClasses from '../../styles/shared.module.css';

export default function Terms() {
  return (
    <MarketingLayout>
      <section className={sharedClasses.section}>
        <Container size="md">
          <Title className={sharedClasses.sectionTitle} mb="xl">Terms of Service</Title>
          
          <Paper className={sharedClasses.glassCard} p="xl" radius="md" mb={40} style={{ borderLeft: '4px solid var(--mantine-color-blue-5)' }}>
            <Text fw={700} c="blue.9" mb="md">TL;DR for Developers:</Text>
            <List c="blue.8" spacing="sm">
              <List.Item>You can use the free version forever.</List.Item>
              <List.Item>The paid version is a per-user, lifetime license. You own it forever and get 1 year of free updates.</List.Item>
              <List.Item>Because the free version has 95% of the features, all sales are final (no refunds).</List.Item>
              <List.Item>You are responsible for your own LLM API costs.</List.Item>
              <List.Item>We aren't responsible if an AI generates bad code that breaks your production. Always review your code.</List.Item>
            </List>
          </Paper>

          <Text fs="italic" c="dimmed" mb={40}>Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Text>

          <Title order={2} size="h3" mt={40} mb="md">1. Acceptance of Terms</Title>
          <Text c="dimmed" lh={1.7}>
            By downloading, installing, or using Frugäast ("the Software"), you agree to these Terms of Service. If you do not agree, do not use the Software.
          </Text>

          <Title order={2} size="h3" mt={40} mb="md">2. License Grant & Pricing Model</Title>
          <Text c="dimmed" lh={1.7} mb="md">
            Frugäast operates on a freemium model.
          </Text>
          <Text c="dimmed" lh={1.7} mb="md">
            <Text span fw={700} c="dark.9">Free Version:</Text> You are granted a limited, non-exclusive, non-transferable license to use the free version of the Software for personal or commercial purposes.
          </Text>
          <Text c="dimmed" lh={1.7} mb="md">
            <Text span fw={700} c="dark.9">Paid Version (Lifetime License):</Text> Upon purchasing a license key, you are granted a non-exclusive, non-transferable, <Text span fw={700}>per-user</Text> license. This means you can install Frugäast on multiple machines (e.g., your work laptop and personal desktop), as long as you are the only person using that license key. 
          </Text>
          <Text c="dimmed" lh={1.7}>
            This is a "lifetime" license for the Software, meaning you own the version you purchased forever. Your purchase includes one (1) year of free updates. After one year, you may continue to use your current version indefinitely, or choose to pay to renew your access to the latest updates.
          </Text>

          <Title order={2} size="h3" mt={40} mb="md">3. Refund Policy</Title>
          <Text c="dimmed" lh={1.7} mb="md">
            Because Frugäast offers a highly functional, non-time-limited free tier (containing 95% of the core features), we strongly encourage you to download and evaluate the free version before making a purchase. 
          </Text>
          <Text c="dimmed" lh={1.7}>
            To protect against abuse of digital license keys, <Text span fw={700} c="dark.9">all sales are final and we do not offer refunds</Text>. By purchasing a license, you acknowledge that you have tested the free version and are satisfied with its performance on your system.
          </Text>

          <Title order={2} size="h3" mt={40} mb="md">4. AI-Generated Code Disclaimer</Title>
          <Text c="dimmed" lh={1.7}>
            Frugäast is a client application that interfaces with third-party Large Language Models (LLMs). We do not control these models, nor do we guarantee the accuracy, safety, or legality of the code they produce. You are solely responsible for reviewing, testing, and verifying any code generated or modified by Frugäast. We accept zero liability for security vulnerabilities, bugs, data loss, or server downtime caused by code produced via the Software.
          </Text>

          <Title order={2} size="h3" mt={40} mb="md">5. Third-Party API Costs</Title>
          <Text c="dimmed" lh={1.7}>
            Frugäast requires you to use your own API keys (e.g., OpenAI, Anthropic). You are solely responsible for any costs, usage limits, or billing issues incurred with these third-party providers. Frugäast is not liable for unexpected API charges resulting from your usage of the Software.
          </Text>

          <Title order={2} size="h3" mt={40} mb="md">6. Governing Law</Title>
          <Text c="dimmed" lh={1.7}>
            These terms shall be governed by and construed in accordance with the laws of France, without regard to its conflict of law provisions.
          </Text>

          <Text mt={60}>
            Questions? Contact us at <Anchor href="mailto:contact@frugaast.dev" c="violet.6">contact@frugaast.dev</Anchor>.
          </Text>
        </Container>
      </section>
    </MarketingLayout>
  );
}
