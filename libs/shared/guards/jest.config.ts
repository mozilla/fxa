export default {
  displayName: 'guards',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  // chai 5 is ESM-only, so jest has to transform it rather than skip it
  transformIgnorePatterns: ['/node_modules/(?!chai/)'],
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/libs/shared/guards',
};
