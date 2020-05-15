const { resolve } = require('path');
const {
  permitAdditionalJSImports,
  setupAliasedPaths,
  componentsJestMapper,
} = require('../fxa-react/rescripts');

module.exports = [
  permitAdditionalJSImports,
  setupAliasedPaths,
  componentsJestMapper,
];
