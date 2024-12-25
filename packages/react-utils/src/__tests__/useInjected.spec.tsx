import React from 'react';
import { renderHook } from '@testing-library/react';

import useInjected from '../useInjected';
import Inject from '../Inject';

const contextName = 'Greeting';
const provide = 'GREETING';
const value = { greeting: 'Hello, World!' };

const Wrapper = ({ children }: React.PropsWithChildren) => {
  return (
    <Inject name={contextName} provide={provide} value={value}>
      {children}
    </Inject>
  );
};

describe('useInjected', () => {
  it('should throw error when no provider found', () => {
    expect(() => renderHook(() => useInjected(provide))).toThrow(
      `No provider found for ${provide}`
    );
  });

  it('should throw error when used outside the context', () => {
    renderHook(() => useInjected(provide), { wrapper: Wrapper });

    try {
      renderHook(() => useInjected(provide));
    } catch (err) {
      if (err instanceof Error) {
        expect(err.message).toBe(`use${contextName} must be used in ${contextName}Provider`);
        return;
      }
      throw err;
    }
  });

  it('should return the provided value', () => {
    const { result } = renderHook(() => useInjected(provide), { wrapper: Wrapper });

    expect(result.current).toStrictEqual(value);
  });

  it('should use the latest value provided in hierarchy', () => {
    const value = { greeting: 'Hello, React!' };

    const { result } = renderHook(() => useInjected(provide), {
      wrapper: ({ children }: React.PropsWithChildren) => {
        return (
          <Wrapper>
            <Inject name={contextName} provide={provide} value={value}>
              {children}
            </Inject>
          </Wrapper>
        );
      },
    });

    expect(result.current).toStrictEqual(value);
  });
});
