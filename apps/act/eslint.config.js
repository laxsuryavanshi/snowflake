import config from 'eslint-config-snowflake/react.js';

export default [
  {
    ignores: ['dist', 'eslint.config.js', 'postcss.config.js', 'tailwind.config.js'],
  },
  ...config,
];
