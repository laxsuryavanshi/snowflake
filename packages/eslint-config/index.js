import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import ts from 'typescript-eslint';

/** @type {ts.InfiniteDepthConfigWithExtends[]} */
export const eslintConfig = [
  {
    name: '@turtleby/setup',
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
      sourceType: 'module',
    },
  },
  js.configs.recommended,
  ts.configs.strictTypeChecked,
  ts.configs.stylisticTypeChecked,
  prettier,
  {
    name: '@turtleby/env/cjs',
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    rules: {
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allow: [{ name: ['Error', 'URL', 'URLSearchParams'], from: 'lib' }],
          allowAny: true,
          allowBoolean: true,
          allowNullish: true,
          allowNumber: true,
          allowRegExp: true,
        },
      ],
      'no-alert': 'error',
      'no-console': 'warn',
      'prefer-const': 'error',
      'prettier/prettier': 'warn',
    },
  },
];

/**
 * @param {(keyof typeof globals)[]} env
 * @returns {ts.ConfigArray}
 */
export function getEslintConfigWithEnvs(...env) {
  return ts.config(
    ...eslintConfig.concat(
      env.map(key => ({
        name: `@turtleby/env/${key}`,
        languageOptions: {
          globals: {
            ...globals[key],
          },
        },
      }))
    )
  );
}

export default ts.config(...eslintConfig);
