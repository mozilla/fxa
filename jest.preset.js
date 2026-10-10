const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  maxWorkers: 1,
  // ESM-only packages (faker 10, app-store-server-api 1, jose 6) must be transformed, not skipped
  transformIgnorePatterns: [
    '/node_modules/(?!(@faker-js/faker|app-store-server-api|jose)/)',
  ],
};
