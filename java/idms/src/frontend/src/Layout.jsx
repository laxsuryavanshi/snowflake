import { Suspense, useEffect, useState } from 'react';
import { useMediaQuery } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import {
  createTheme as createMuiTheme,
  ThemeProvider as MuiThemeProvider,
  responsiveFontSizes,
} from '@mui/material/styles';
import { Link } from '@snowflake/matex';

/**
 * @param {PaletteMode} mode
 * @returns {Theme}
 */
const createTheme = mode => {
  let theme = createMuiTheme({
    typography: {
      fontFamily: 'var(--snowflake-font-family)',
      fontWeightMedium: 600,
      button: {
        textTransform: 'none',
        fontWeight: 'inherit',
      },
    },
    palette: { mode },
    components: {
      MuiLink: {
        defaultProps: {
          component: Link,
        },
      },
      MuiButtonBase: {
        defaultProps: {
          LinkComponent: Link,
        },
      },
    },
  });

  theme = responsiveFontSizes(theme);

  return theme;
};

/**
 * @param {React.PropsWithChildren} props
 */
const Layout = ({ children }) => {
  const [hydrated, setHydrated] = useState(false);
  const systemDisplayMode = useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light';

  const theme = createTheme(systemDisplayMode);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return null;
  }

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Suspense>{children}</Suspense>
    </MuiThemeProvider>
  );
};

export default Layout;

/**
 * @typedef {import('@mui/material').PaletteMode} PaletteMode
 * @typedef {import('@mui/material').Theme} Theme
 */
