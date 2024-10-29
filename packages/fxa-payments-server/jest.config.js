const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.build.json');

module.exports = {
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
  rootDir: 'src',
  modulePaths: ['<rootDir>'],
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        isolatedModules: true,
      },
    ],
  },
  coverageDirectory: './coverage',
};
