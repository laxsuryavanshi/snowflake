'use client';

import { createContext, Dispatch, useContext, useEffect, useMemo, useReducer } from 'react';

export interface S3Config {
  accessKeyID: string;
  secretAccessKey: string;
  bucketName: string;
  region: string;
}

interface S3ConfigContext {
  config: S3Config | null;
  setConfig: (config: S3Config) => void;
  clearConfig: () => void;
}

const S3ConfigContext = createContext<S3ConfigContext | null>(null);

export function S3ConfigProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const localStorageKey = 'bitvolt-s3config';

  const initialValue =
    typeof window !== 'undefined'
      ? (JSON.parse(localStorage.getItem(localStorageKey) ?? 'null') as S3Config | null)
      : null;
  const [config, dispatch] = useReducer(s3ConfigReducer, initialValue);

  const value: S3ConfigContext = useMemo(() => {
    return {
      config,
      setConfig: setConfigDispatch(dispatch),
      clearConfig: clearConfigDispatch(dispatch),
    };
  }, [config, dispatch]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (config) {
      localStorage.setItem(localStorageKey, JSON.stringify(config));
    } else {
      localStorage.removeItem(localStorageKey);
    }
  }, [config]);

  return <S3ConfigContext.Provider value={value}>{children}</S3ConfigContext.Provider>;
}

export function useS3Config(): S3ConfigContext {
  const context = useContext(S3ConfigContext);

  if (!context) {
    throw new Error("useS3Config must be used within a 'S3ConfigContextProvider'");
  }

  return context;
}

const enum S3ConfigActionType {
  ADD_S3_CONFIG = 'ADD_S3_CONFIG',
  CLEAR_S3_CONFIG = 'CLEAR_S3_CONFIG',
}

type S3ConfigAction =
  | { type: S3ConfigActionType.CLEAR_S3_CONFIG }
  | { type: S3ConfigActionType.ADD_S3_CONFIG; config: S3Config };

function s3ConfigReducer(config: S3Config | null, action: S3ConfigAction): S3Config | null {
  switch (action.type) {
    case S3ConfigActionType.ADD_S3_CONFIG:
      return {
        ...config,
        ...action.config,
      };
    case S3ConfigActionType.CLEAR_S3_CONFIG:
      return null;
    default:
      return config;
  }
}

function setConfigDispatch(dispatch: Dispatch<S3ConfigAction>) {
  return function setConfig(config: S3Config) {
    dispatch({ type: S3ConfigActionType.ADD_S3_CONFIG, config });
  };
}

function clearConfigDispatch(dispatch: Dispatch<S3ConfigAction>) {
  return function clearConfig() {
    dispatch({ type: S3ConfigActionType.CLEAR_S3_CONFIG });
  };
}
