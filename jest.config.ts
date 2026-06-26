import { getJestProjectsAsync } from '@nx/jest';

// fxa-auth-server runs Jest via shell scripts, not an `@nx/jest:jest` target,
// so getJestProjectsAsync() never discovers it and its specs don't appear in
// the VS Code Jest test explorer (FXA-13439). This file is editor-only (read
// by jest.jestCommandLine in .vscode/settings.json; no CI job or package
// script uses it), so we append the package's configs here. Their testMatch
// patterns are mutually exclusive, so no spec is listed twice.
const authServerProjects = [
  '<rootDir>/packages/fxa-auth-server/jest.config.js',
  '<rootDir>/packages/fxa-auth-server/jest.integration.config.js',
  '<rootDir>/packages/fxa-auth-server/jest.oauth-api.config.js',
  '<rootDir>/packages/fxa-auth-server/jest.scripts.config.js',
];

export default async () => ({
  projects: [...(await getJestProjectsAsync()), ...authServerProjects],
});
