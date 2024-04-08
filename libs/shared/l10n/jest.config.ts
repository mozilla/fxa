/* eslint-disable */
export default {
  displayName: 'shared-l10n',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleNameMapper: {
    '@fluent/react/esm/localization': '@fluent/react',
    'server-only': `<rootDir>/tests/__mocks__/empty.js`,
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/libs/shared/l10n',
};
