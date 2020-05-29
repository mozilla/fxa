/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Please refer to fxa-react/configs/tailwind for the main config file

const { resolve } = require('path');
const extractImportedComponents = require('fxa-react/extract-imported-components');
const config = require('fxa-react/configs/tailwind');

if (process.env.NODE_ENV === 'production') {
  const matches = extractImportedComponents(
    resolve(__dirname, 'src', 'components')
  );

  config.purge.content.push(...matches);
} else {
  config.purge.content.push('../fxa-react/components/**/*.tsx');
}

module.exports = config;
