/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Please refer to fxa-react/configs/tailwind for the main config file

const config = require('fxa-react/configs/tailwind');

config.content = [
  './app/scripts/templates/**/*.mustache',
  './app/server/templates/pages/**/*.html',
  // for 'invalid' class
  './app/scripts/views/form.js',
];

config.theme.extend = {
  ...config.theme.extend,
  backgroundImage: {
    'check-white': 'inline("../images/icon-check-white.svg")',
  },
  content: {
    ...config.theme.extend.content,
    'circle-check': "inline('../images/circle-check.svg')",
  },
};

module.exports = config;
