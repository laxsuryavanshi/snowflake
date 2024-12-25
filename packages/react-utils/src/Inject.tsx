import React from 'react';

import { ContextUtilitiesResult, createContextUtilities } from './helpers';

export interface InjectProps<Value> {
  name: string;

  value: Value;

  provide: any;
}

const Inject = <Value,>(props: React.PropsWithChildren<InjectProps<Value>>) => {
  let utilities = Inject.cache.get(props.provide) as ContextUtilitiesResult<Value> | undefined;

  if (!utilities) {
    utilities = createContextUtilities({ name: props.name, defaultValue: props.value });

    Inject.cache.set(props.provide, utilities);
  }

  const { Provider } = utilities;

  return <Provider value={props.value}>{props.children}</Provider>;
};

Inject.cache = new Map<any, ContextUtilitiesResult<any>>();

export default Inject;
