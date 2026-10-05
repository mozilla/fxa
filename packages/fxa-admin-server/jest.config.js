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
  // chai 5, @faker-js/faker 10, app-store-server-api 1 and jose 6 are ESM-only, so jest has to transform them rather than skip them
  transformIgnorePatterns: [
    '/node_modules/(?!(chai|@faker-js/faker|app-store-server-api|jose)/)',
  ],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
};
