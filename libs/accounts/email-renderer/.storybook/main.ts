/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import type { StorybookConfig } from '@storybook/html-webpack5';

const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const path = require('path');

const storybookConfig: StorybookConfig = {
  framework: {
    name: '@storybook/html-webpack5',
    options: {},
  },
  stories: ['../src/**/*.stories.ts'],
  staticDirs: process.env.STORYBOOK_BUILD === 'true' ? undefined : ['..'],
  addons: ['@storybook/addon-essentials'],
  // Added to resolve path aliases set in <projectRoot>/tsconfig.base.json
  // tsconfig.storybook.json is necessary to replace the *.ts extension in tsconfig.base.json
  // with a *.js extension. Other than that it should remain the same.
  async webpackFinal(config) {
    config.resolve = config.resolve || {};
    config.resolve.plugins = [
      new TsconfigPathsPlugin({
        configFile: path.resolve(__dirname, './tsconfig.storybook.json'),
      }),
    ];

    config.resolve.fallback = {};

    // Storybook v8 no longer injects a TS loader for html-webpack5 framework.
    // Wrap all rules in oneOf so this explicit TS rule takes priority.
    config.module = config.module || {};
    const existingRules = (config.module.rules || []).filter(
      (r): r is object => typeof r === 'object' && r !== null
    );
    config.module.rules = [
      {
        oneOf: [
          {
            test: /\.(ts|tsx)$/,
            loader: require.resolve('babel-loader'),
            options: {
              sourceType: 'unambiguous',
              presets: [
                [
                  '@babel/preset-env',
                  { targets: '> 0.25%, last 2 versions, not dead' },
                ],
                '@babel/preset-typescript',
              ],
              plugins: [],
            },
          },
          ...existingRules,
        ],
      },
    ];

    return config;
  },
};

export default storybookConfig;
