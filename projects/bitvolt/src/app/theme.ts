'use client';

import {
  createTheme as createMuiTheme,
  PaletteMode,
  responsiveFontSizes,
} from '@mui/material/styles';

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
  });
};

let theme = createTheme();
theme = responsiveFontSizes(theme);

export { theme };
