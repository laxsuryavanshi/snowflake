import React from 'react';
import { render } from '@testing-library/react';

import Inject from '../Inject';
import * as helpers from '../helpers';

const contextName = 'Greeting';
const provide = 'GREETING';
const value = { greeting: 'Hello, World!' };

const Component = ({ children }: React.PropsWithChildren) => {
  return (
    <Inject name={contextName} provide={provide} value={value}>
      {children}
    </Inject>
  );
};

describe('Inject', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create and cache the provider and hook', () => {
    Inject.cache.clear();
    const spyOn = jest.spyOn(helpers, 'createContextUtilities');

    render(
      <>
        <Component />
        <Inject name="Stuff" provide="STUFF" value={{ stuff: 'Yet another stuff' }}>
          {null}
        </Inject>
      </>
    );

    expect(spyOn).toHaveBeenCalledTimes(2);
    expect(Inject.cache.size).toBe(2);
  });

  it('should use the cached provider and hook', () => {
    Inject.cache.clear();
    const spyOn = jest.spyOn(helpers, 'createContextUtilities');

    render(
      <>
        <Component>
          <Component />
        </Component>
        <Component />
      </>
    );

    expect(spyOn).toHaveBeenCalledTimes(1);
    expect(Inject.cache.size).toBe(1);
  });
});
