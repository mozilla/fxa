/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = {
  stories: [
    '../lib/senders/emails/**/*.stories.tsx',
    '../lib/senders/emails/**/*.stories.ts',
  ],
  staticDirs: ['..'],
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
};
