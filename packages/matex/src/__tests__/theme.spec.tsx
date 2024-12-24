import { act } from 'react';
import { renderHook } from '@testing-library/react';

import { ThemeProvider, useTheme } from '../theme';

const Wrapper = ({ children }: React.PropsWithChildren) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('useTheme', () => {
  it('should throw an error when used outside a ThemeProvider', () => {
    expect(() => renderHook(() => useTheme())).toThrow(
      '`useTheme` must be used inside a `ThemeProvider`'
    );
  });

  it('should return mode and setter function', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: Wrapper });

    expect(result.current).toMatchSnapshot();
  });

  it('should set display mode to dark', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: Wrapper });

    expect(result.current.mode).toBe('system');
    act(() => {
      result.current.setMode('dark');
    });
    expect(result.current.mode).toBe('dark');
    act(() => {
      result.current.setMode('system');
    });
    expect(result.current.mode).toBe('system');
  });
});
