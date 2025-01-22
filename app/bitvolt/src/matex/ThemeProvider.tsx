import { useMemo } from 'react';
import type { PaletteMode, Theme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import type { LinkProps } from '@mui/material/Link';
import {
  createTheme as createMuiTheme,
  ThemeProvider as MuiThemeProvider,
  responsiveFontSizes,
} from '@mui/material/styles';
import { useLocalStorage } from 'usehooks-ts';

import { useSystemDisplayMode } from './hooks';
import Link from './Link';
import ThemeContext, { DisplayMode } from './ThemeContext';

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

const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

export default ThemeProvider;
