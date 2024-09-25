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
  // for 'opacity-0 opacity-100' classes
  './app/scripts/views/password_strength/password_strength_balloon.js',
  // for 'bg-close-white' class
  './app/scripts/views/tooltip.js',
];

config.theme.extend = {
  ...config.theme.extend,
  backgroundImage: {
    ...config.theme.extend.backgroundImage,
    'check-white': 'inline("../images/icon-check-white.svg")',
    'show-password': 'inline("../images/icon-show-password.svg")',
    'hide-password': 'inline("../images/icon-show-password-closed.svg")',
    // TODO: Use 'close' SVGs from 'fxa-react' once using React
    'close-black': 'inline("../images/close.svg")',
    'close-white': 'inline("../images/close-white.svg")',
    'mobile-ff': 'inline("../images/mobile-ff.svg")',
    'mobile-download': 'inline("../images/mobile-download.svg")',
    'back-arrow': 'inline("../images/back-arrow.svg")',
    'no-ff-desktop': 'inline("../images/no-ff-desktop.svg")',
    'icon-warning': 'inline("../images/icon-warning.svg")',
  },
  content: {
    ...config.theme.extend.content,
    'circle-check': "inline('../images/circle-check.svg')",
    // Note, this is also used in fxa-settings but as an inlined SVG
    'icon-circle-check-outline':
      "inline('../images/icon-circle-check-outline.svg')",
    lock: "inline('../images/icon-lock.svg')",
    alert: "inline('../images/icon-warning-red-50.svg')",
    'check-blue': "inline('../images/icon-check-blue-50.svg')",
    key: "inline('../images/icon-key-grey-50.svg')",
  },
};

module.exports = config;
