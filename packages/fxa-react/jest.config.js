module.exports = {
  roots: ['<rootDir>'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '\\.(css|scss)$': 'identity-obj-proxy',
    '^.+\\.svg$': '<rootDir>/svg-transform.js',
  },
  testPathIgnorePatterns: ['/dist/', '/node_modules/'],
};
