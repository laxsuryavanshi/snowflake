import { createContext, useContext } from 'react';

export interface ContextOptions<Value> {
  /**
   * The name of the context. This will be used to generate the provider's display name.
   */
  name: string;

  defaultValue?: Value;
}

export type ContextProvider<Value> = React.FC<React.PropsWithChildren<{ value: Value }>>;

export interface ContextUtilitiesResult<Value> {
  useHook: () => Value;

  Provider: ContextProvider<Value>;
}

export const createContextUtilities = <Value,>(
  options?: ContextOptions<Value>
): ContextUtilitiesResult<Value> => {
  const { name = '' } = options ?? {};

  const Context = createContext(options?.defaultValue);

  const useHook = () => {
    const value = useContext(Context);

    if (value === undefined) {
      throw new Error(`use${name} must be used within a ${name}Provider`);
    }

    return value;
  };

  const Provider: ContextProvider<Value> = ({ value, children }) => {
    return <Context.Provider value={value}>{children}</Context.Provider>;
  };

  Provider.displayName = `${name}Provider`;

  return { useHook, Provider };
};
