module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$':  [ "ts-jest", { "isolatedModules": true } ]
  },
};
