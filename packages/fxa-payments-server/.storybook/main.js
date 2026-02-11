/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = {
  stories: ['../src/**/*.stories.tsx'],
  staticDirs: ['../public'],
  core: {
    builder: 'webpack5',
  },
  addons: [
    '@storybook/preset-create-react-app',
    '@storybook/addon-styling',
    {
      name: 'storybook-addon-mock',
    },
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  features: { storyStoreV7: false },
};
