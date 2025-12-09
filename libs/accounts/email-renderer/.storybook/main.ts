/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const path = require('path');

export default {
  framework: {
    name: '@storybook/html-webpack5',
    options: {},
  },
  stories: ['../src/**/*.stories.ts'],
  staticDirs:
    process.env.STORYBOOK_BUILD !== 'true' ? ['../public'] : undefined,
  addons: [
    '@storybook/addon-webpack5-compiler-babel',
    '@storybook/addon-docs',
    '@storybook/addon-controls',
    '@storybook/addon-toolbars',
  ],
  core: {
    builder: 'webpack5',
  },
  babel: async (options) => {
    const babelConfig = {
      ...options,
      sourceType: 'unambiguous',
      presets: [
        [
          '@babel/preset-env',
          {
            targets: '> 0.25%, last 2 versions, not dead',
          },
        ],
        '@babel/preset-typescript',
      ],
      plugins: [],
    };
    console.log('babel config!');

    return babelConfig;
  },

  features: { storyStoreV7: true },
  // Added to resolve path aliases set in <projectRoot>/tsconfig.base.json
  // tsconfig.storybook.json is necessary to replace the *.ts extension in tsconfig.base.json
  // with a *.js extension. Other than that it should remain the same.
  async webpackFinal(config, { configType }) {
    config.resolve.plugins = [
      new TsconfigPathsPlugin({
        configFile: path.resolve(__dirname, './tsconfig.storybook.json'),
      }),
    ];

    config.resolve.fallback = {
      // fs: false, // Keep this as it's the standard Storybook approach.
      // // This is often needed when using internal Node libs in the browser:
      // path: false,
      // os: false,
      // "http": require.resolve("stream-http"),
      // "https": require.resolve("https-browserify"),
      // // **Potential fix for fs** - by adding 'process' which is another common Node dependency
      // process: require.resolve('process/browser'),
    };
    return config;
  },
};
