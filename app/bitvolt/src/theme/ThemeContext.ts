import { createContext } from 'react';
import type { PaletteMode } from '@mui/material';

export type DisplayMode = PaletteMode | 'system';

export interface ThemeProviderValue {
  get mode(): DisplayMode;

  setMode: (mode: DisplayMode) => void;
}

const ThemeContext = createContext<ThemeProviderValue | undefined>(undefined);

export default ThemeContext;
