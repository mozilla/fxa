/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { customizeWebpackConfig } = require('fxa-react/configs/storybooks');

module.exports = (options) => {
  const config = customizeWebpackConfig(options);
  // Inline jpg/jpeg as base64 data URLs so they resolve correctly when used
  // in CSS custom properties (relative URLs resolve against the stylesheet,
  // not the document, causing 404s in hosted Storybook).
  config.module.rules[0].oneOf.unshift({
    test: /\.(jpg|jpeg)$/,
    type: 'asset/inline',
  });
  return config;
};
