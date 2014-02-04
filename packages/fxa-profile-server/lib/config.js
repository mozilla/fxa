/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const convict = require('convict');

const config = convict({
  server: {
    host: {
      env: 'HOST',
      default: 'localhost'
    },
    port: {
      env: 'PORT',
      format: 'port',
      default: 1111
    }
  }
});

config.validate();

module.exports = config;
