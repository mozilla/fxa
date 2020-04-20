const {
  permitAdditionalJSImports,
  setupAliasedPaths,
  componentsJestMapper
} = require("../fxa-components/rescripts");

module.exports = [
  permitAdditionalJSImports,
  setupAliasedPaths,
  componentsJestMapper
];
