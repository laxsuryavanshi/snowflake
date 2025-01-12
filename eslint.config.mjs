import config from '@snowflake/eslint-config';

/** @type {ESLintConfig[]} */
export default [
  ...config,
  {
    ignores: ['.yarn/*', '.pnp.*'],
  },
];

/**
 * @typedef {import('eslint').Linter.Config} ESLintConfig
 */
