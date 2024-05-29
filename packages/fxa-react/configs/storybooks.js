/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { resolve } = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

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
  resolve: {
    ...config.resolve,
    plugins: [
      ...(config.resolve.plugins || []),
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
    extensions: [...config.resolve.extensions, '.svg', '.scss', '.css', '.png'],
    // Add aliases to some packages shared across the project
    alias: { ...config.resolve.alias, ...additionalJSImports },
    fallback: {
      ...config.fallback,
      fs: false,
      path: false,
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
            use: ['style-loader', 'css-loader', 'sass-loader'],
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
          // Include the rest of the existing rules with some tweaks...
          ...config.module.rules.map((rule) => {
            // Replace Storybook built-in Typescript support.
            if (rule.test && rule.test.test && rule.test.test('.tsx')) {
              return {
                test: /\.(ts|tsx)$/,
                loader: require.resolve('babel-loader'),
                options: {
                  presets: [['react-app', { flow: false, typescript: true }]],
                  plugins: [
                    [
                      '@babel/plugin-transform-typescript',
                      { allowDeclareFields: true },
                    ],
                  ],
                },
              };
            }
            return rule;
          }),
        ],
      },
    ],
  },
});

module.exports = {
  customizeWebpackConfig,
};
