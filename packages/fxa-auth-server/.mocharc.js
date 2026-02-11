module.exports = {
  extension: ['ts', 'js'], // include extensions
  ignore: ['**/*.spec.ts'], // Jest tests use .spec.ts; exclude from Mocha
  require: [
    'test/setup.js' // setup file to run before any tests
  ],
};
