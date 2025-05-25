type EslintConfig = import('eslint').Linter.Config;

declare module '@turtleby/eslint-config' {
  const _default: EslintConfig[];
  export default _default;
}

declare module '@turtleby/eslint-config/*' {
  const _default: EslintConfig[];
  export default _default;
}
