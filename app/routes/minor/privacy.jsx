import { Container, Title, Text, Paper, List, Anchor } from '@mantine/core';
import { MarketingLayout } from '../../components/MarketingLayout';
import sharedClasses from '../../styles/shared.module.css';

export default function Privacy() {
  return (
    <MarketingLayout>
      <section className={sharedClasses.section}>
        <Container size="md">
          <Title className={sharedClasses.sectionTitle} mb="xl">Privacy Policy</Title>
          
          <Paper className={sharedClasses.glassCard} p="xl" radius="md" mb={40} style={{ borderLeft: '4px solid var(--mantine-color-green-5)' }}>
            <Text fw={700} c="green.9" mb="md">The short version:</Text>
            <List c="green.8" spacing="sm">
              <List.Item>We do not see your code.</List.Item>
              <List.Item>Your API keys stay on your machine.</List.Item>
              <List.Item>The Frugäast app has zero telemetry.</List.Item>
            </List>
          </Paper>

          <Text fs="italic" c="dimmed" mb={40}>Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Text>

          <Title order={2} size="h3" mt={40} mb="md">1. Your Code and API Keys (BYOK)</Title>
          <Text c="dimmed" lh={1.7} mb="md">
            Frugäast is a desktop application designed with strict privacy in mind. It operates on a "Bring Your Own Key" (BYOK) model.
          </Text>
          <List c="dimmed" spacing="md" pl="md">
            <List.Item>
              <Text span fw={700} c="dark.9">Your Code: </Text>
              We do not collect, read, store, or transmit your source code to our servers. Any code or prompt you send to an LLM via Frugäast is transmitted <Text span fs="italic">directly</Text> from your local machine to the AI provider (e.g., OpenAI, Anthropic). Your codebase never touches Frugäast's servers.
            </List.Item>
            <List.Item>
              <Text span fw={700} c="dark.9">Your API Keys: </Text>
              Your API keys are stored securely and locally on your device. We have no access to them, and they are only ever used to authenticate requests directly from your machine to the respective API provider.
            </List.Item>
          </List>

          <Title order={2} size="h3" mt={40} mb="md">2. App Telemetry</Title>
          <Text c="dimmed" lh={1.7} mb="md">
            <Text span fw={700} c="dark.9">Frugäast collects absolutely zero telemetry.</Text> We do not track how you use the app, which features you click, or how many lines of code you generate. 
          </Text>
          <Text c="dimmed" lh={1.7}>
            The only time the Frugäast desktop app communicates with our servers is to briefly validate your license key upon activation and to check for software updates.
          </Text>

          <Title order={2} size="h3" mt={40} mb="md">3. Information We Collect on the Website</Title>
          <Text c="dimmed" lh={1.7} mb="md">
            When you visit frugaast.dev or purchase a license, we collect the bare minimum information required to run our business:
          </Text>
          <List c="dimmed" spacing="md" pl="md">
            <List.Item>
              <Text span fw={700} c="dark.9">Purchase Information: </Text>
              We use Stripe as our merchant of record to process payments. We do not see or store your credit card information. We only store the data necessary to issue and manage your license: your email address, purchase date, and the license key itself.
            </List.Item>
            <List.Item>
              <Text span fw={700} c="dark.9">Support Communications: </Text>
              If you email us for support, we retain that correspondence simply to help you resolve your issue.
            </List.Item>
          </List>

          <Title order={2} size="h3" mt={40} mb="md">4. Third-Party AI Providers</Title>
          <Text c="dimmed" lh={1.7}>
            Because Frugäast sends your prompts and code snippets directly to third-party LLM providers, your data is subject to their respective privacy policies. 
            We recommend reviewing your API provider's policies regarding data retention and model training (note: commercial API usage is typically excluded from model training by major providers like OpenAI and Anthropic, but you should verify this directly with them).
          </Text>

          <Title order={2} size="h3" mt={40} mb="md">5. Contact Us</Title>
          <Text c="dimmed" lh={1.7}>
            If you have any questions about how your data is handled, please reach out to <Anchor href="mailto:contact@frugaast.dev" c="violet.6">contact@frugaast.dev</Anchor>.
          </Text>
        </Container>
      </section>
    </MarketingLayout>
  );
}
