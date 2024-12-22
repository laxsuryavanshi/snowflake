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

module.exports = defineConfig({
  async constraints(context) {
    enforceConsistentDependenciesAcrossTheProject(context);
  },
});

/**
 * @typedef {import('@yarnpkg/types').Yarn.Constraints.Context} Context
 */
