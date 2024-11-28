import jest from 'eslint-plugin-jest';
import tslint from 'typescript-eslint';

export default [
  {
    plugins: {
      '@typescript-eslint': tslint.plugin,
      jest,
    },
    ...jest.configs['flat/recommended'],
  },
];
