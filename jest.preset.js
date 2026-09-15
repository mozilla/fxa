const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  maxWorkers: 1,
  // @faker-js/faker 10 is ESM-only, so jest has to transform it rather than skip it
  transformIgnorePatterns: ['/node_modules/(?!(@faker-js/faker)/)'],
};
