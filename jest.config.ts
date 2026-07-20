import { getJestProjectsAsync } from '@nx/jest';

// fxa-auth-server runs Jest via shell scripts, not an `@nx/jest:jest` target,
// so getJestProjectsAsync() never discovers it and its specs don't appear in
// the VS Code Jest test explorer (FXA-13439). This file is editor-only (read
// by jest.jestCommandLine in .vscode/settings.json; no CI job or package
// script uses it), so we append the package's suites here. jest.config.js
// defines each suite (unit/integration/scripts/oauth-api) as a project with an
// absolute rootDir, so spreading its `.projects` resolves from the repo root.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const authServerProjects =
  require('./packages/fxa-auth-server/jest.config.js').projects;

export default async () => ({
  projects: [...(await getJestProjectsAsync()), ...authServerProjects],
});
