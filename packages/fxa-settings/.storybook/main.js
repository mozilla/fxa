/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = {
  stories: ['./design-guide/main.stories.tsx', '../src/**/*.stories.tsx'],
  staticDirs: ['../public'],
  addons: [
    '@storybook/addon-actions',
    '@storybook/addon-links',
    'storybook-addon-rtl',
    {
      name: '@storybook/addon-postcss',
      options: {
        postcssLoaderOptions: {
          implementation: require('postcss'),
        },
      },
    },
  ],
};
