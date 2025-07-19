'use client';

import {
  createTheme as createMuiTheme,
  PaletteMode,
  responsiveFontSizes,
} from '@mui/material/styles';
import Link from 'next/link';

const createTheme = (mode: PaletteMode = 'light') => {
  return createMuiTheme({
    cssVariables: true,
    typography: {
      fontFamily: 'var(--turtleby-font-family)',
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
};

let theme = createTheme();
theme = responsiveFontSizes(theme);

export { theme };
