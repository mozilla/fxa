module.exports = {
  roots: ["<rootDir>/src"],
  moduleNameMapper: {
    "^@fxa-components/(.*)$": "<rootDir>/../fxa-components/$1"
  },
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  }
};
