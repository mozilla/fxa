const { resolve } = require('path');

const additionalJSImportPaths = [resolve('../fxa-components')];

const permitAdditionalJSImports = config => {
  // Update ModuleScopePlugin's appSrcs to allow our new directory
  config.resolve.plugins.forEach(plugin => {
    if (plugin.constructor && plugin.constructor.name === 'ModuleScopePlugin') {
      plugin.appSrcs.push(...additionalJSImportPaths);
    }
  });

  // We need to target a loader that handles compiling the JS/TS/JSX/TSX files, which exists
  // as a nameless object at a very arbitrary location. Without this we would still be able
  // to import the file but it wouldn't get transpiled. However, CRA is a very stable project
  // so I don't expect this object's location or position in the array of loaders to change
  // too frequently.
  if (
    config.module.rules[2] &&
    config.module.rules[2].hasOwnProperty('oneOf') &&
    config.module.rules[2].oneOf[1].test.toString() ===
      '/\\.(js|mjs|jsx|ts|tsx)$/'
  ) {
    config.module.rules[2].oneOf[1].include = [
      config.module.rules[2].oneOf[1].include,
      ...additionalJSImportPaths,
    ];
  } else {
    throw new Error(
      `Could not find the Webpack loader to include additional JS import paths.
       This script may need updating if CRA has changed its base config.`
    );
  }

  return config;
};

module.exports = [permitAdditionalJSImports];
