import { useEffect, useState } from "react";
import {
  Container, Title, Text, Button, Stack, Grid, 
  Anchor, Group, Divider, CopyButton, ActionIcon,
  Box, List, Paper, Skeleton, Alert, Badge, Card, ThemeIcon
} from "@mantine/core";
import {
  Download as DownloadIcon, Hash, Check, Copy,
  Terminal, Monitor, FileText, Github, AlertCircle,
  Cpu, ShieldCheck, Apple
} from "lucide-react";
import { MarketingLayout } from '../components/MarketingLayout';

export default function Download() {
  const GITHUB_REPO = "https://github.com/Frugaast/frugaast";
  
  const [release, setRelease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Fetch the latest release from the GitHub API
    fetch("https://api.github.com/repos/Frugaast/frugaast/releases/latest")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch release");
        return res.json();
      })
      .then((data) => {
        setRelease({
          version: data.tag_name.replace(/^v/, ''),
          notes: data.body,
          url: data.html_url,
          assets: data.assets,
          date: data.published_at,
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(true);
        setLoading(false);
      });
  }, []);

  // Helper to find the correct asset URL based on file extension
  const getAssetUrl = (extension) => {
    if (!release || !release.assets) return `${GITHUB_REPO}/releases/latest`;
    const asset = release.assets.find((a) => a.name.endsWith(extension));
    return asset ? asset.browser_download_url : `${GITHUB_REPO}/releases/latest`;
  };

  // Helper to parse basic markdown bullet points from GitHub release notes
  const renderReleaseNotes = (notes) => {
    if (!notes) return <Text c="dimmed">No release notes provided.</Text>;
    
    const bullets = notes
      .split('\n')
      .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
      .map(line => line.replace(/^[-*]\s*/, '').trim())
      .slice(0, 6);

    if (bullets.length === 0) {
      return <Text c="dimmed" size="sm">See GitHub for full release details.</Text>;
    }

    return (
      <List size="sm" spacing="sm" c="dimmed" className="mt-4">
        {bullets.map((bullet, i) => (
          <List.Item key={i}>{bullet}</List.Item>
        ))}
      </List>
    );
  };

  const currentVersion = release ? release.version : "1.0.0";
  const releaseDate = release && release.date 
    ? new Date(release.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) 
    : "";

  return (
    <MarketingLayout>
      {/* 1. HERO SECTION */}
      <section className="relative pt-[100px] pb-[60px] overflow-hidden bg-white">
        <div className="hero-grid-pattern" />
        <div className="hero-glow" />
        
        <Container size="lg" className="relative z-10">
          <Stack align="center" gap="md" mb={60}>
            <Skeleton visible={loading} width={loading ? 150 : 'auto'} radius="xl">
              <Badge variant="light" color="violet" size="lg" radius="xl" mb="sm" className="shadow-sm border border-violet-100">
                Version {currentVersion} {releaseDate && ` -  ${releaseDate}`}
              </Badge>
            </Skeleton>
            
            <Title className="section-title text-center" order={1}>
              Take back control. <br />
              <span className="text-gradient">Download Frugaast.</span>
            </Title>
            
            <Text c="dimmed" size="xl" ta="center" maw={650} lh={1.6}>
              A blazing fast native desktop client powered by Tauri and a Python sidecar. 
              No cloud telemetry, no bloated autonomous agents. Just your codebase and the models you choose.
            </Text>

            <Group justify="center" gap="xl" mt={20}>
              <Group gap="xs"><ShieldCheck size={18} className="text-teal-500"/><Text fw={600} size="sm">100% Local Privacy</Text></Group>
              <Group gap="xs"><Cpu size={18} className="text-teal-500"/><Text fw={600} size="sm">Tauri + Python Sidecar</Text></Group>
              <Group gap="xs"><Monitor size={18} className="text-teal-500"/><Text fw={600} size="sm">Frugal RAM footprint</Text></Group>
            </Group>
          </Stack>

          {error && (
            <Alert variant="light" color="red" title="Could not load latest release" icon={<AlertCircle size={16} />} mb="xl" radius="md">
              We couldn't reach GitHub to fetch the latest download links. You can still download the app directly from our <Anchor href={`${GITHUB_REPO}/releases`} fw={600}>Releases page</Anchor>.
            </Alert>
          )}

          {/* 2. DOWNLOAD PLATFORMS GRID */}
          <Grid gutter={40} mb={40}>
            
            {/* macOS */}
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card shadow="sm" p="xl" radius="lg" withBorder className="h-full flex flex-col hover:-translate-y-1 hover:shadow-xl hover:border-violet-200 transition-all duration-300 relative overflow-hidden bg-white">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-50 to-transparent opacity-80 rounded-bl-full pointer-events-none" />
                
                <Group gap="sm" mb="lg">
                  <ThemeIcon size={42} radius="md" color="violet.1" c="violet.7">
                    <Monitor size={22} />
                  </ThemeIcon>
                  <Title order={3} className="font-bold text-gray-800">macOS</Title>
                </Group>
                
                <Skeleton visible={loading}>
                  <Button 
                    component="a" 
                    href={getAssetUrl('.dmg')}
                    size="md" 
                    color="dark"
                    leftSection={<DownloadIcon size={18} />}
                    fullWidth
                    radius="md"
                    className="hover:bg-gray-800 transition-colors"
                  >
                    Universal .dmg
                  </Button>
                </Skeleton>

                <Box mt="xl">
                  <Text size="sm" fw={600} c="dark.6">System Requirements</Text>
                  <Text size="sm" c="dimmed">macOS 11.0 (Big Sur) or newer.</Text>
                  <Text size="sm" c="dimmed">Native Apple Silicon & Intel support.</Text>
                </Box>
              </Card>
            </Grid.Col>

            {/* Windows */}
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card shadow="sm" p="xl" radius="lg" withBorder className="h-full flex flex-col hover:-translate-y-1 hover:shadow-xl hover:border-violet-200 transition-all duration-300 relative overflow-hidden bg-white">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-50 to-transparent opacity-80 rounded-bl-full pointer-events-none" />
                
                <Group gap="sm" mb="lg">
                  <ThemeIcon size={42} radius="md" color="blue.1" c="blue.7">
                    <Monitor size={22} />
                  </ThemeIcon>
                  <Title order={3} className="font-bold text-gray-800">Windows</Title>
                </Group>
                
                <Skeleton visible={loading}>
                  <Button 
                    component="a" 
                    href={getAssetUrl('.exe')}
                    size="md" 
                    color="blue"
                    variant="light"
                    leftSection={<DownloadIcon size={18} />}
                    fullWidth
                    radius="md"
                  >
                    x64 Setup .exe
                  </Button>
                </Skeleton>

                <Box mt="xl">
                  <Text size="sm" fw={600} c="dark.6">Alternative Downloads</Text>
                  <Skeleton visible={loading} mt={4}>
                    <Anchor href={getAssetUrl('portable.zip')} size="sm">Portable .zip</Anchor>
                  </Skeleton>
                </Box>

                <Box pt="sm">
                  <Text size="sm" fw={600} c="dark.6">System Requirements</Text>
                  <Text size="sm" c="dimmed">Windows 10 or newer (x64).</Text>
                </Box>
              </Card>
            </Grid.Col>

            {/* Linux */}
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card shadow="sm" p="xl" radius="lg" withBorder className="h-full flex flex-col hover:-translate-y-1 hover:shadow-xl hover:border-violet-200 transition-all duration-300 relative overflow-hidden bg-white">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-50 to-transparent opacity-80 rounded-bl-full pointer-events-none" />
                
                <Group gap="sm" mb="lg">
                  <ThemeIcon size={42} radius="md" color="orange.1" c="orange.7">
                    <Terminal size={22} />
                  </ThemeIcon>
                  <Title order={3} className="font-bold text-gray-800">Linux</Title>
                </Group>
                
                <Skeleton visible={loading}>
                  <Button 
                    component="a" 
                    href={getAssetUrl('.AppImage')}
                    size="md" 
                    color="orange"
                    variant="light"
                    leftSection={<DownloadIcon size={18} />}
                    fullWidth
                    radius="md"
                  >
                    Download .AppImage
                  </Button>
                </Skeleton>

                <Box mt="xl">
                  <Text size="sm" fw={600} c="dark.6">Alternative Downloads</Text>
                  <Skeleton visible={loading} mt={4}>
                    <Group gap="xs">
                      <Anchor href={getAssetUrl('.deb')} size="sm">.deb</Anchor>
                      <Text size="sm" c="dimmed">•</Text>
                      <Anchor href={getAssetUrl('.rpm')} size="sm">.rpm</Anchor>
                    </Group>
                  </Skeleton>
                </Box>

                <Box mt="auto" pt="sm">
                  <Text size="sm" fw={600} c="dark.6">System Requirements</Text>
                  <Text size="sm" c="dimmed">glibc 2.31+ (Ubuntu 20.04+).</Text>
                </Box>
              </Card>
            </Grid.Col>
          </Grid>
        </Container>
      </section>

      {/* 3. RELEASE NOTES & CHECKSUMS SECTION */}
      <section className="section-alt py-[80px]">
        <Container size="lg">
          <Grid gutter={60}>
            {/* Changelog */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Group gap="sm" mb="lg">
                <FileText size={24} className="text-violet-600" />
                <Title order={2} className="font-bold">Latest Release Notes</Title>
              </Group>
              
              <Paper p="xl" radius="lg" withBorder className="bg-white/60 backdrop-blur-sm shadow-sm">
                <Skeleton visible={loading} mb={loading ? "md" : 0}>
                  <Text fw={700} size="lg" mb="xs" c="dark.8">v{currentVersion} (Current)</Text>
                </Skeleton>
                
                <Skeleton visible={loading}>
                  {release && renderReleaseNotes(release.notes)}
                  {error && <Text size="sm" c="dimmed">Could not fetch release notes.</Text>}
                </Skeleton>

                <Group mt="xl">
                  <Button 
                    component="a" 
                    href={release ? release.url : `${GITHUB_REPO}/releases`} 
                    variant="default"
                    radius="md"
                    size="sm"
                  >
                    View full changelog on GitHub
                  </Button>
                </Group>
              </Paper>
            </Grid.Col>

            {/* Verification & Source */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="xl">
                <Box>
                  <Group gap="sm" mb="md">
                    <Github size={24} className="text-gray-800" />
                    <Title order={3} className="font-bold">Source & Issues</Title>
                  </Group>
                  <Text size="md" c="dimmed" mb="md" lh={1.6}>
                    While the core of Frugaast is closed-source, our GitHub repository serves as the central hub for releases, issue tracking, and roadmap discussions.
                  </Text>
                  <Anchor href={`${GITHUB_REPO}/issues`} fw={600} size="sm" className="text-violet-600 hover:text-violet-700">
                    Report an Issue or Request a Feature →
                  </Anchor>
                </Box>
                
                <Divider />

                <Box>
                  <Group gap="sm" mb="md">
                    <Hash size={24} className="text-gray-800" />
                    <Title order={3} className="font-bold">Checksums</Title>
                  </Group>
                  <Text size="md" c="dimmed" mb="md" lh={1.6}>
                    Verify your download using SHA-256 to ensure authenticity. For example: <br/>
                    <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700 text-sm mt-2 inline-block border border-gray-200">shasum -a 256 /path/to/frugaast.dmg</code>
                  </Text>
                  <Text size="sm" c="dimmed">
                    Download the latest <code>sha256sum.txt</code> file directly from the <Anchor href={`${GITHUB_REPO}/releases/latest`} fw={500}>latest release</Anchor> assets.
                  </Text>
                </Box>
              </Stack>
            </Grid.Col>
          </Grid>
        </Container>
      </section>
    </MarketingLayout>
  );
}