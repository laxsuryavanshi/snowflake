import { Amplify, ResourcesConfig } from '@aws-amplify/core';

export const configure = (config: ResourcesConfig) => {
  Amplify.configure(config);
};
