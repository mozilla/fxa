module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$':  [ "ts-jest", { "isolatedModules": true } ]
  },
  moduleNameMapper: {
    '@mswjs/interceptors/presets/node': '<rootDir>/node_modules/@mswjs/interceptors/lib/node/presets/node.js',
  },
};
