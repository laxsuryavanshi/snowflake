import { createContext, useContext, useMemo } from 'react';
import type { PaletteMode, Theme } from '@mui/material';
import { useMediaQuery } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import type { LinkProps } from '@mui/material/Link';
import {
  createTheme as createMuiTheme,
  ThemeProvider as MuiThemeProvider,
  responsiveFontSizes,
} from '@mui/material/styles';
import { useLocalStorage } from 'usehooks-ts';

import Link from './Link';

export type DisplayMode = PaletteMode | 'system';

export interface ThemeProviderValue {
  get mode(): DisplayMode;

  setMode: (mode: DisplayMode) => void;
}

const ThemeContext = createContext<ThemeProviderValue | undefined>(undefined);

const createTheme = (mode: PaletteMode): Theme => {
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
        } as LinkProps,
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

export const useSystemDisplayMode = (): PaletteMode => {
  return useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light';
};

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const systemDisplayMode = useSystemDisplayMode();
  const [displayMode, setDisplayMode] = useLocalStorage<DisplayMode>('displayMode', 'system');
  const [displayModeInternal, setDisplayModeInternal] = useLocalStorage<PaletteMode>(
    'displayModeInternal',
    systemDisplayMode
  );

  const setMode = (mode: DisplayMode) => {
    setDisplayMode(mode);

    if (mode === 'system') {
      setDisplayModeInternal(systemDisplayMode);
    } else {
      setDisplayModeInternal(mode);
    }
  };

  const theme = useMemo(() => createTheme(displayModeInternal), [displayModeInternal]);
  const value = useMemo(() => ({ mode: displayMode, setMode }), [displayMode]);

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeProviderValue => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('`useTheme` must be used inside a `ThemeProvider`');
  }

  return context;
};
