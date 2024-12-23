// @ts-check
/** @type {import('@yarnpkg/types')} */
const { defineConfig } = require('@yarnpkg/types');

/**
 * This rule will enforce that a workspace MUST depend on the same version of a dependency as
 * the one used by the other workspaces.
 *
 * @param {Context} context
 */
function enforceConsistentDependenciesAcrossTheProject({ Yarn }) {
  for (const dependency of Yarn.dependencies()) {
    if (dependency.type === 'peerDependencies') {
      continue;
    }

    for (const otherDependency of Yarn.dependencies({ ident: dependency.ident })) {
      if (otherDependency.type === 'peerDependencies') {
        continue;
      }

      if (
        (dependency.type === 'devDependencies' || otherDependency.type === 'devDependencies') &&
        Yarn.workspace({ ident: otherDependency.ident })
      ) {
        continue;
      }

      dependency.update(otherDependency.range);
    }
  }
}

const IGNORE_PACKAGE_NAME_FOR = ['.', 'apps/', 'packages/eslint-config-snowflake'];

/**
 * Enforce that all packages in the project use the `@snowflake/*` naming convention.
 *
 * @param {Context} context
 */
function enforcePackageNameConvention({ Yarn }) {
  for (const workspace of Yarn.workspaces()) {
    if (IGNORE_PACKAGE_NAME_FOR.some(pattern => workspace.cwd.startsWith(pattern))) {
      continue;
    }

    if (!workspace.manifest.name.startsWith('@snowflake/')) {
      workspace.error(
        `Package "${workspace.manifest.name}" must use the "@snowflake/" naming convention.` +
          ` Consider renaming it to "@snowflake/${workspace.cwd.split('/').pop()}"`
      );
    }
  }
}

module.exports = defineConfig({
  async constraints(context) {
    enforceConsistentDependenciesAcrossTheProject(context);
    enforcePackageNameConvention(context);
  },
});

/**
 * @typedef {import('@yarnpkg/types').Yarn.Constraints.Context} Context
 */
