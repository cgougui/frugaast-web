import { createTheme } from '@mantine/core';

export const theme = createTheme({
  colorScheme: 'light', // Force light mode
  /* Put your mantine theme override here */
  fontFamily: 'ProximaSoft, sans-serif',
  headings: {
    fontFamily: 'ProximaSoft, sans-serif',
    sizes: {
      h1: {
        fontSize: '60px',
        fontWeight: 900,
        lineHeight: 1.1,
        '@media (max-width: 768px)': {
          fontSize: '40px',
          lineHeight: 1.2,
        },
        '@media (max-width: 576px)': {
          fontSize: '28px',
          lineHeight: 1.3,
        },
      },
      h2: {
        fontSize: '2.5rem',
        fontWeight: 700,
        lineHeight: 1.2,
      },
      h3: {
        fontSize: '2rem',
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 500,
        lineHeight: 1.5,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
        lineHeight: 1.5,
      },
    },
  },
  components: {
    Title: {
      styles: {
        root: {
          /*textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',*/
        },
      },
      variants: {
        gradient: {
          root: {
            textShadow: '0 2px 4px rgba(255, 255, 255, 0.7)',
            backgroundImage: 'linear-gradient(135deg, #1c7ed6, #4dabf7)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          },
        },
      },
    },
  },
});
