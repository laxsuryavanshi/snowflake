import eslint from '@eslint/js';
import index from 'eslint-plugin-index';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import tslint from 'typescript-eslint';

export default tslint.config(
  eslint.configs.recommended,
  tslint.configs.strictTypeChecked,
  tslint.configs.stylisticTypeChecked,
  prettierRecommended,
  {
    plugins: {
      '@typescript-eslint': tslint.plugin,
      index,
    },
    languageOptions: {
      parser: tslint.parser,
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      ...index.configs.recommended.rules,
      'no-alert': 'error',
      'no-console': 'error',
      'prettier/prettier': 'warn',
    },
  }
);
