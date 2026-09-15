const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.build.json');
module.exports = {
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
  modulePaths: ['<rootDir>/../dist/'],
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        isolatedModules: true,
      },
    ],
  },
  // chai 5 and @faker-js/faker 10 are ESM-only, so jest has to transform them rather than skip them
  transformIgnorePatterns: ['/node_modules/(?!(chai|@faker-js/faker)/)'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
};
