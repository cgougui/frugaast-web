import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation, // Already imported
} from "react-router";
import { useEffect } from 'react'; // Import useEffect
import { MantineProvider } from '@mantine/core'; // Removed createTheme as it's unused here
import '@mantine/core/styles.css';
import { theme } from './theme';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import stylesheet from "./app.css?url";
import fontsStylesheet from "./fonts.css?url";

// --- Google Analytics Configuration ---
// Use environment variable for Measurement ID (adjust based on your setup, e.g., process.env)
const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

// --- Microsoft Clarity Configuration ---
const clarityProjectId = import.meta.env.VITE_CLARITY_PROJECT_ID;
// ------------------------------------

export const links = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "stylesheet", href: fontsStylesheet },
  { rel: "icon", href: "/images/favicon.ico", type: "image/x-icon" },
];


export function Layout({ children }) {
  const { mauticSourceTag } = useLoaderData() || {};
  const location = useLocation(); // Get location object
  const isAdminRoute = location.pathname.startsWith('/admin'); // Check if it's an admin route

  useEffect(() => {
    if (mauticSourceTag && !document.cookie.includes('mautic_source_tag=')) {
      const d = new Date();
      d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 jours
      let expires = "expires="+ d.toUTCString();
      document.cookie = `mautic_source_tag=${mauticSourceTag};${expires};path=/;SameSite=Lax`;
    }
  }, [mauticSourceTag]);

  // --- Google Analytics Page View Tracking ---
  useEffect(() => {
    if (!gaMeasurementId) {
      // Optional: Log a warning if the ID is missing, but don't break the app
      // console.warn("Google Analytics Measurement ID is not configured.");
      return; // Exit if GA ID is not set
    }

    // Check if gtag is available (ensures the script loaded)
    if (typeof window.gtag === 'function') {
      const pagePath = location.pathname + location.search;

      // Send the pageview event to GA4
      window.gtag('event', 'page_view', {
        page_title: document.title, // Use the current document title
        page_location: window.location.href, // Send the full current URL
        page_path: pagePath, // Send the path including query string
        send_to: gaMeasurementId // Specify the Measurement ID
      });

      // Optional: Log for debugging purposes
      // console.log(`GA PageView Sent: ${pagePath}`);
    }
  }, [location.pathname, location.search]); // Re-run effect when path or search changes
  // -----------------------------------------

  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        {/* --- Google Analytics Script --- */}
        {gaMeasurementId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}></script>
            <script dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaMeasurementId}', {
                  'send_page_view': false
                });
              `,
            }} />
          </>
        )}
        {/* --- End Google Analytics Script --- */}
        {/* --- Microsoft Clarity Script --- */}
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${clarityProjectId}");
            `
          }}
        />
        {/* --- End Microsoft Clarity Script --- */}
      </head>
      <body>
        <MantineProvider theme={theme} colorScheme="light" defaultColorScheme="light">
          {!isAdminRoute && <Header />} {/* Conditionally render Header */}
          {/* Wrap children in main */}
          {/* Padding top might need adjustment or removal depending on admin layout */}
          <main>
            {children}
          </main>
          {!isAdminRoute && <Footer />} {/* Conditionally render Footer */}
        </MantineProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <>
      <Outlet />
    </>
  );
}

export function ErrorBoundary({ error }) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
