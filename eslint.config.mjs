import config from '@snowflake/eslint-config';
import reactConfig from '@snowflake/eslint-config/react';

/** @type {ESLintConfig[]} */
export default [
  ...config,
  ...reactConfig,
  {
    ignores: ['.yarn/*', '.pnp.*', 'deps/*'],
  },
];

/**
 * @typedef {import('eslint').Linter.Config} ESLintConfig
 */
