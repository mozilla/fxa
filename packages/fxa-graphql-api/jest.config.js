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
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '@fxa/accounts/recovery-phone':
      '<rootDir>/../../../libs/accounts/recovery-phone/src/index.ts',
    '@fxa/shared/mozlog': '<rootDir>/../../../libs/shared/mozlog/src/index',
    '@fxa/shared/l10n': '<rootDir>/../../../libs/shared/l10n/src/index.ts',
    '@fxa/shared/notifier':
      '<rootDir>/../../../libs/shared/notifier/src/index.ts',
    '@fxa/shared/metrics/statsd':
      '<rootDir>/../../../libs/shared/metrics/statsd/src/index.ts',
    '@fxa/shared/log': '<rootDir>/../../../libs/shared/log/src/index.ts',
    '@fxa/shared/db/mysql/account': [
      '<rootDir>/../../../libs/shared/db/mysql/account/src/index.ts',
    ],
    '@fxa/shared/db/mysql/core':
      '<rootDir>/../../../libs/shared/db/mysql/core/src/index.ts',
    '@fxa/shared/error': '<rootDir>/../../../libs/shared/error/src/index.ts',
    '@fxa/shared/otp': '<rootDir>/../../../libs/shared/otp/src/index.ts',
  },
};
