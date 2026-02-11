/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const path = require('path');

module.exports = {
  stories: [
    '../lib/senders/emails/**/*.stories.tsx',
    '../lib/senders/emails/**/*.stories.ts',
  ],
  staticDirs: process.env.STORYBOOK_BUILD !== 'true' ? ['..'] : undefined,
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-controls',
    '@storybook/addon-toolbars',
  ],
  core: {
    builder: 'webpack5',
  },
  framework: {
    name: '@storybook/html-webpack5',
    options: {},
  },
  features: { storyStoreV7: false },
  // Added to resolve path aliases set in <projectRoot>/tsconfig.base.json
  // tsconfig.storybook.json is necessary to replace the *.ts extension in tsconfig.base.json
  // with a *.js extension. Other than that it should remain the same.
  async webpackFinal(config, { configType }) {
    config.resolve.plugins = [
      new TsconfigPathsPlugin({
        configFile: path.resolve(__dirname, './tsconfig.storybook.json'),
        baseUrl: './dist',
      }),
    ];

    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
};
