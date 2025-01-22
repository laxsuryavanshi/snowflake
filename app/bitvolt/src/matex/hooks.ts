import { useContext } from 'react';
import { type PaletteMode, useMediaQuery } from '@mui/material';

import ThemeContext, { ThemeProviderValue } from './ThemeContext';

export const useSystemDisplayMode = (): PaletteMode => {
  return useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light';
};

export const useTheme = (): ThemeProviderValue => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('`useTheme` must be used inside a `ThemeProvider`');
  }

  return context;
};
