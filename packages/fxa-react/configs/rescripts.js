/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { resolve } = require('path');
const { pathsToModuleNameMapper } = require('ts-jest');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const permitAdditionalJSImports = (config) => {
  // We're just gonna call all of fxa fair game ;)
  const allFxa = resolve(__dirname, '../../');
  const allLibs = resolve(__dirname, '../../../libs/');
  const importPaths = [
    allFxa,
    allLibs,
    resolve(__dirname, '../../../node_modules'),
  ];
  // Update ModuleScopePlugin's appSrcs to allow our new directory
  config.resolve.plugins.forEach((plugin) => {
    if (plugin.constructor && plugin.constructor.name === 'ModuleScopePlugin') {
      plugin.appSrcs.push(...importPaths);
    }
  });

  config.resolve.plugins.push(
    new TsconfigPathsPlugin({ configFile: './tsconfig.json' })
  );

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
    config.module.rules[1] &&
    config.module.rules[1].oneOf &&
    config.module.rules[1].oneOf[3].test.toString() ===
      '/\\.(js|mjs|jsx|ts|tsx)$/'
  ) {
    config.module.rules[1].oneOf[3].include = [
      config.module.rules[1].oneOf[3].include,
      allFxa,
      allLibs,
    ];
  } else {
    throw new Error(
      `Could not find the Webpack loader to include additional JS import paths.
       This script may need updating if CRA has changed its base config.`
    );
  }

  config.resolve.fallback = {
    fs: false,
    path: false,
  };

  return config;
};

const suppressRuntimeErrorOverlay = (devServerConfig) => {
  return {
    ...devServerConfig,
    client: {
      ...devServerConfig.client,
      overlay: { ...devServerConfig.client.overlay, runtimeErrors: false },
    },
  };
};

const setModuleNameMapper = (tsconfigBase) => (config) => {
  config.transform = {
    ...config.transform,
    '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true }],
  };

  // ts-jest - Paths mapping - With helper
  // https://kulshekhar.github.io/ts-jest/docs/getting-started/paths-mapping#jest-config-with-helper
  config.roots = ['<rootDir>'];
  config.modulePaths = [tsconfigBase.compilerOptions.baseUrl];
  config.moduleNameMapper = {
    ...config.moduleNameMapper,
    ...pathsToModuleNameMapper(tsconfigBase.compilerOptions.paths, {
      prefix: '<rootDir>/../../',
    }),
  };
  return config;
};

module.exports = {
  permitAdditionalJSImports,
  suppressRuntimeErrorOverlay,
  setModuleNameMapper,
};
