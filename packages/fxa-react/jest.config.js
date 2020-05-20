const { resolve } = require('path');

module.exports = {
  roots: ['<rootDir>'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '\\.(css|scss)$': 'identity-obj-proxy',
    '^@fxa-shared/(.*)$': resolve(__dirname, '../fxa-shared', '$1'),
  },
};
