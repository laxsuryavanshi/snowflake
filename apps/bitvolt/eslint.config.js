import config from 'eslint-config-snowflake/react.js';

export default [
  {
    ignores: ['dist', '*.js'],
  },
  ...config,
];
