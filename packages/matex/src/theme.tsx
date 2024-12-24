import { createContext, useContext, useMemo } from 'react';
import { PaletteMode, Theme, useMediaQuery } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { LinkProps } from '@mui/material/Link';
import {
  ThemeProvider as MuiThemeProvider,
  createTheme as createMuiTheme,
  responsiveFontSizes,
} from '@mui/material/styles';
import { useLocalStorage } from 'usehooks-ts';

import Link from './Link';

export type DisplayMode = PaletteMode | 'system';

export interface IThemeContext {
  get mode(): DisplayMode;

  setMode: (mode: DisplayMode) => void;
}

/**
 * Creates a Material-UI theme object based on the specified mode (light or dark).
 * @param {PaletteMode} mode The mode of the theme (light or dark).
 * @returns {Theme} The Material-UI theme object.
 */
const createTheme = (mode: PaletteMode): Theme => {
  let theme = createMuiTheme({
    typography: {
      fontFamily: 'var(--snowflake-font-family)',
      fontWeightBold: 700,
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

const ThemeContext = createContext<IThemeContext | null>(null);

/**
 * Returns the current system display mode (light or dark) based on the user's preferences.
 * @returns {PeletteMode} The current system display mode.
 */
const useSystemDisplayMode = (): PaletteMode =>
  useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light';

export const ThemeProvider = ({ children }: React.PropsWithChildren) => {
  const systemDisplayMode = useSystemDisplayMode();

  /**
   * @var displayMode is used to determine the mode user has selected in our application
   */
  const [displayMode, setDisplayMode] = useLocalStorage<DisplayMode>('displayMode', 'system');
  /**
   * @var displayModeInternal unlike @var displayMode, is the actual mode applied in the
   * application. When displayMode is set to `system`, we use users' system preferences
   * to determine the settings to use in our app.
   */
  const [displayModeInternal, setDisplayModeInternal] = useLocalStorage<PaletteMode>(
    'displayModelInternal',
    systemDisplayMode
  );

  const setSystemDisplayMode = (mode: DisplayMode) => {
    if (mode === 'system') {
      mode = systemDisplayMode;
    }
    setDisplayModeInternal(mode);
  };
  const setMode = (mode: DisplayMode) => {
    setDisplayMode(mode);
    setSystemDisplayMode(mode);
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

export const useTheme = (): IThemeContext => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('`useTheme` must be used inside a `ThemeProvider`');
  }

  return context;
};
