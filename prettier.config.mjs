/** @type {import('prettier').Config} */
export default {
  arrowParens: 'avoid',
  printWidth: 100,
  singleQuote: true,
  trailingComma: 'es5',
  plugins: ['prettier-plugin-svelte', '@prettier/plugin-xml'],
  overrides: [
    {
      files: '*.svelte',
      options: {
        parser: 'svelte',
      },
    },
  ],
};
