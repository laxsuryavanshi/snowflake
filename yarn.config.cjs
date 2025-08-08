const { defineConfig } = require('@yarnpkg/types');
const fs = require('node:fs');
const path = require('node:path');

/**
 * Checks if the workspace is the root workspace.
 *
 * @param {Workspace} workspace
 */
function isRootWorkspace(workspace) {
  return workspace.cwd === '.';
}

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

/**
 * Sets the repository information for a workspace.
 *
 * @param {Workspace} workspace
 */
function setWorkspaceRepository(workspace) {
  const repository = {
    type: 'git',
    url: 'git+https://github.com/laxsuryavanshi/snowflake.git',
    directory: workspace.cwd,
  };

  workspace.set('repository.type', repository.type);
  workspace.set('repository.url', repository.url);
  if (!isRootWorkspace(workspace)) {
    workspace.set('repository.directory', repository.directory);
  }
}

/**
 * Licenses required for public packages.
 *
 * @param {Workspace} workspace
 */
function setWorkspaceLicense(workspace) {
  if (!workspace.cwd.startsWith('packages/')) {
    return;
  }

  workspace.set('license', 'MIT');

  if (!fs.existsSync(path.join(path.resolve(__dirname), workspace.cwd, 'LICENSE'))) {
    workspace.error(`LICENSE file is missing in ${workspace.cwd}`);
  }
}

/**
 * Enforces certain fields to be present in all workspaces.
 *
 * @param {Context} context
 */
function enforceFieldsOnAllWorkspaces({ Yarn }) {
  for (const workspace of Yarn.workspaces()) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!workspace.manifest.private) {
      setWorkspaceLicense(workspace);
      setWorkspaceRepository(workspace);
    }
  }
}

module.exports = defineConfig({
  // eslint-disable-next-line @typescript-eslint/require-await
  constraints: async ctx => {
    enforceConsistentDependenciesAcrossTheProject(ctx);
    enforceFieldsOnAllWorkspaces(ctx);
  },
});

/**
 * @typedef {import('@yarnpkg/types').Yarn.Constraints.Context} Context
 * @typedef {import('@yarnpkg/types').Yarn.Constraints.Workspace} Workspace
 */
