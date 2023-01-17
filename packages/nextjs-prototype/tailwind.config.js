/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Please refer to fxa-react/configs/tailwind for the main config file

const { resolve } = require('path');
const extractImportedComponents = require('fxa-react/extract-imported-components');
const config = require('fxa-react/configs/tailwind');

if (process.env.NODE_ENV === 'production') {
  const matches = extractImportedComponents(resolve(__dirname, 'components'));

  config.content.push(...matches);
  config.content.push('./pages/**/*.{js,ts,jsx,tsx}'); // Add nextjs react content
  config.content.push('./components/**/*.{js,ts,jsx,tsx}'); // Add nextjs react content
  config.safelist = undefined; // Remove for now - Causes 10s-30s compile times
} else {
  config.content = [];
  config.content.push('../fxa-react/components/**/*.tsx');
  config.content.push('./pages/**/*.{js,ts,jsx,tsx}'); // Add nextjs react content
  config.content.push('./components/**/*.{js,ts,jsx,tsx}'); // Add nextjs react content
  config.safelist = undefined; // Remove for now - Causes 10s-30s compile times
}

// remove this once Payments is using Tailwind and we can enable '@tailwind base'
config.corePlugins = {};
config.corePlugins.preflight = false;

module.exports = config;
