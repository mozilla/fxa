/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Please refer to fxa-react/configs/tailwind for the main config file

const { readFileSync } = require('fs');
const { join } = require('path');
const config = require('fxa-react/configs/tailwind');

// The Tailwind CLI runs no PostCSS plugins, so the config inlines these SVGs.
const inline = (file) =>
  `url('data:image/svg+xml;base64,${readFileSync(
    join(__dirname, 'app/images', file)
  ).toString('base64')}')`;

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
    'check-white': inline('icon-check-white.svg'),
    'show-password': inline('icon-show-password.svg'),
    'hide-password': inline('icon-show-password-closed.svg'),
    // TODO: Use 'close' SVGs from 'fxa-react' once using React
    'close-black': inline('close.svg'),
    'close-white': inline('close-white.svg'),
    'mobile-ff': inline('mobile-ff.svg'),
    'mobile-download': inline('mobile-download.svg'),
    'no-ff-desktop': inline('no-ff-desktop.svg'),
    'icon-warning': inline('icon-warning.svg'),
    'default-profile': inline('default-profile.svg'),
    'graphic-mail': inline('graphic_mail.svg'),
    'triple-device-hearts': inline('graphic-triple-device-hearts.svg'),
    'account-verified': inline('account-verified.svg'),
    'qr-code-firefox-mobile': inline('qr_code_firefox_mobile.svg'),
    'confirm-pairing': inline('confirm-pairing.svg'),
    'broken-connection': inline('graphic_broken_connection.svg'),
    'spinner-white': inline('spinnerwhite.svg'),
  },
  content: {
    ...config.theme.extend.content,
    'circle-check': inline('circle-check.svg'),
    // Note, this is also used in fxa-settings but as an inlined SVG
    'icon-circle-check-outline': inline('icon-circle-check-outline.svg'),
    lock: inline('icon-lock.svg'),
    alert: inline('icon-warning-red-50.svg'),
    'check-blue': inline('icon-check-blue-50.svg'),
    key: inline('icon-key-grey-50.svg'),
  },
};

module.exports = config;
