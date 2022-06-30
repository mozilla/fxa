/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Please refer to fxa-react/configs/tailwind for the main config file

const config = require('fxa-react/configs/tailwind');

config.content = ['./app/scripts/templates/**/*.mustache'];

module.exports = config;
