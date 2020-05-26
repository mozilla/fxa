/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { resolve } = require('path');

const additionalJSImports = {
  'fxa-react': __dirname,
  'fxa-shared': resolve(__dirname, '../fxa-shared'),
};

const permitAdditionalJSImports = (config) => {
  const importPaths = Object.values(additionalJSImports);

  // Update ModuleScopePlugin's appSrcs to allow our new directory
  config.resolve.plugins.forEach((plugin) => {
    if (plugin.constructor && plugin.constructor.name === 'ModuleScopePlugin') {
      plugin.appSrcs.push(...importPaths);
    }
  });

  // We need to target a loader that handles compiling the JS/TS/JSX/TSX files, which exists
  // as a nameless object at a very arbitrary location. Without this we would still be able
  // to import the file but it wouldn't get transpiled. However, CRA is a very stable project
  // so I don't expect this object's location or position in the array of loaders to change
  // too frequently. Here's what it looks like:
  //
  // {
  //   module: {
  //     strictExportPresence: true,
  //     rules: [
  //       { ... }, // unrelated item
  //       { ... }, // unrelated item
  //       {
  //         oneOf: [
  //           { ... }, // unrelated item
  //           {
  //             test: /\.(js|mjs|jsx|ts|tsx)$/,
  //             include: '/base/path/fxa/packages/fxa-settings/src', // <- This is the property we want to modify
  //             loader: '/base/path/fxa/packages/fxa-settings/node_modules/babel-loader/lib/index.js',
  //             options: [Object]
  //           },
  //         ]
  //       }
  //     ]
  //   }
  // }
  if (
    config.module.rules[2] &&
    config.module.rules[2].oneOf &&
    config.module.rules[2].oneOf[1].test.toString() ===
      '/\\.(js|mjs|jsx|ts|tsx)$/'
  ) {
    config.module.rules[2].oneOf[1].include = [
      config.module.rules[2].oneOf[1].include,
      ...importPaths,
    ];
  } else {
    throw new Error(
      `Could not find the Webpack loader to include additional JS import paths.
       This script may need updating if CRA has changed its base config.`
    );
  }

  return config;
};

const setupAliasedPaths = (config) => {
  // Add the list of additional imports to Webpack's alias resolver
  config.resolve.alias = Object.assign(
    config.resolve.alias,
    additionalJSImports
  );

  // IMPORTANT - While this will work, in order for Typescript to also resolve
  // these custom aliases we need to set them in TSConfig's "paths". Please refer
  // to tsconfig.json and tsconfig.paths.json for details around that setup.

  return config;
};

const componentsJestMapper = {
  jest: (config) => {
    return {
      ...config,
      moduleNameMapper: Object.keys(additionalJSImports).reduce(
        (previous, key) => {
          return Object.assign(previous, {
            [`^${key}/(.*)$`]: resolve(additionalJSImports[key], '$1'),
          });
        },
        {}
      ),
    };
  },
};

module.exports = {
  permitAdditionalJSImports,
  setupAliasedPaths,
  componentsJestMapper,
};
