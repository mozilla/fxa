/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { resolve } = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const webpack = require('webpack');

const allFxa = resolve(__dirname, '../../');
const allLibs = resolve(__dirname, '../../libs/');
const importPaths = [
  allFxa,
  allLibs,
  resolve(__dirname, '../../../node_modules'),
];
const additionalJSImports = {
  'fxa-react': resolve(__dirname, '../'),
  'fxa-shared': resolve(__dirname, '../../fxa-shared'),
};

const customizeWebpackConfig = ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins || []),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new webpack.ProvidePlugin({
      buffer: ['buffer', 'Buffer'],
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  resolve: {
    ...config.resolve,
    plugins: [
      ...((config.resolve && config.resolve.plugins) || []),
      new TsconfigPathsPlugin({ configFile: './tsconfig.json' }),
    ].map((plugin) => {
      // Rebuild ModuleScopePlugin with some additional allowed paths
      if (
        plugin.constructor &&
        plugin.constructor.name === 'ModuleScopePlugin'
      ) {
        plugin.appSrcs.push(...importPaths);
      }
      return plugin;
    }),
    // Register a few more extensions to resolve
    extensions: [
      ...((config.resolve && config.resolve.extensions) || []),
      '.svg',
      '.scss',
      '.css',
      '.png',
    ],
    // Add aliases to some packages shared across the project
    alias: {
      ...((config.resolve && config.resolve.alias) || {}),
      ...additionalJSImports,
    },
    fallback: {
      ...((config.resolve && config.resolve.fallback) || {}),
      fs: false,
      path: false,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
    },
  },
  module: {
    ...config.module,
    rules: [
      {
        // HACK: convert *all* rules into oneOf so that these first few
        // rules override others that overlap
        oneOf: [
          // Add support for our .scss stylesheets
          {
            test: /\.s[ac]ss$/i,
            use: [
              'style-loader',
              {
                loader: 'css-loader',
                options: {
                  // Don't try to resolve url() references through webpack.
                  // Server-relative paths like /images/foo.png come from
                  // fxa-content-server SCSS and are served from the web root
                  // at runtime — not webpack assets.
                  url: false,
                },
              },
              {
                loader: 'sass-loader',
                options: {
                  sassOptions: {
                    // Silence Dart Sass deprecation warnings from legacy
                    // fxa-content-server SCSS (not owned by this codebase).
                    silenceDeprecations: [
                      'import',
                      'global-builtin',
                      'mixed-decls',
                      'function-units',
                    ],
                  },
                },
              },
            ],
          },
          // Support using SVGs as React components
          // fxa-react stories need this since that package does not have the
          // webpack config from CRA that includes svgr
          {
            test: /\.svg$/,
            use: [
              {
                loader: require.resolve('@svgr/webpack'),
                options: {
                  svgoConfig: {
                    plugins: [
                      {
                        name: 'preset-default',
                        params: {
                          overrides: {
                            // disable plugins
                            removeViewBox: false,
                          },
                        },
                      },
                    ],
                  },
                },
              },
              {
                loader: require.resolve('file-loader'),
                options: { name: 'static/media/[name].[hash:8].[ext]' },
              },
            ],
          },
          // Support images and fonts
          {
            test: /\.(png|woff|woff2)$/,
            use: [
              {
                loader: require.resolve('file-loader'),
              },
            ],
          },
          // Explicit TypeScript/TSX rule — must come before the spread of
          // config.module.rules so that this loader wins over any built-in
          // SB8 TS handling (SB8 no longer injects a CRA-style TS rule).
          {
            test: /\.(ts|tsx)$/,
            loader: require.resolve('babel-loader'),
            options: {
              presets: [
                [
                  'react-app',
                  { flow: false, typescript: true, runtime: 'automatic' },
                ],
              ],
              plugins: [
                [
                  '@babel/plugin-transform-typescript',
                  { allowDeclareFields: true },
                ],
              ],
            },
          },
          // Include the rest of the existing rules unchanged.
          ...((config.module && config.module.rules) || []),
        ],
      },
    ],
  },
});

module.exports = {
  customizeWebpackConfig,
};
