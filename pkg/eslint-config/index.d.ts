type EslintConfig = import('eslint').Linter.Config;

declare module '@snowflake/eslint-config' {
  const _default: EslintConfig[];
  export default _default;
}

declare module '@snowflake/eslint-config/*' {
  const _default: EslintConfig[];
  export default _default;
}

declare module 'eslint-plugin-react-hooks' {
  export const configs: { recommended: EslintConfig };
}
