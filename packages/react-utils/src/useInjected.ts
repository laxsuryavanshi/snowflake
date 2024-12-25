import { ContextUtilitiesResult } from './helpers';
import Inject, { InjectProps } from './Inject';

const useInjected = <Value>(provide: InjectProps<Value>['provide']) => {
  const utilities = Inject.cache.get(provide) as ContextUtilitiesResult<Value> | undefined;

  if (!utilities) {
    throw new Error(`No provider found for ${provide}`);
  }

  return utilities.useHook();
};

export default useInjected;
