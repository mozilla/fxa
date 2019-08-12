module.exports = {
  displayName: 'frontend',
  preset: 'ts-jest',
  moduleNameMapper: {
    '\\.(css|scss)$': '<rootDir>/jest-style-mock.js',
  },
};
