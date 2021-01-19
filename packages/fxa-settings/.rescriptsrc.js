/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');
const fs = require('fs');
const { default: WebpackWatchPlugin } = require('webpack-watch-files-plugin');
const MergeIntoSingleFilePlugin = require('webpack-merge-and-include-globally');
const { permitAdditionalJSImports } = require('fxa-react/configs/rescripts');

const watchFtlPlugin = new WebpackWatchPlugin({
  files: ['src/**/*.ftl'],
});

const mergeFtlPlugin = new MergeIntoSingleFilePlugin({
  files: {
    '../public/locales/en-US/settings.ftl': ['.license.header', 'src/**/*.ftl'],
  },
});

module.exports = [
  {
    devServer: (config) => {
      const oldWriteToDisk = config.writeToDisk
        ? config.writeToDisk
        : () => false;
      const newConfig = {
        ...config,
        writeToDisk: (path) =>
          /public\/locales\/\S+.ftl/.test(path) || oldWriteToDisk(path),
      };

      return newConfig;
    },
    webpack: (config) => {
      let newConfig = { ...config };

      if (!newConfig.output.path) {
        newConfig = {
          ...newConfig,
          output: {
            ...newConfig.output,
            path: path.resolve(fs.realpathSync(__dirname), 'build'),
          },
        };
      }

      newConfig = {
        ...newConfig,
        plugins: [...newConfig.plugins, watchFtlPlugin, mergeFtlPlugin],
      };

      return newConfig;
    },
  },
  permitAdditionalJSImports,
];
