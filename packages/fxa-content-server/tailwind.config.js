/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Please refer to fxa-react/configs/tailwind for the main config file

const config = require('fxa-react/configs/tailwind');

config.content = ['./server/templates/pages/src/**/*.html'];

config.theme.extend = {
  ...config.theme.extend,
  backgroundImage: {
    ...config.theme.extend.backgroundImage,
    mozilla: 'inline("../images/mozilla.svg")',
  },
};

module.exports = config;
