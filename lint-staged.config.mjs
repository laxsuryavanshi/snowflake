export default {
  '*': ['yarn prettier --check --ignore-unknown'],
  '*.{js,cjs,mjs,jsx,ts,cts,mts,tsx,svelte}': [
    'yarn eslint --no-warn-ignored --max-warnings=0 --report-unused-disable-directives',
  ],
};
