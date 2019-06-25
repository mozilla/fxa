/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const config = require('../config');

const CONFIG = {
  browserid: {
    issuer: config.get('browserid.issuer'),
    verificationUrl: config.get('browserid.verificationUrl'),
  },
  contentUrl: config.get('contentUrl'),
};

module.exports = {
  handler: async function configRoute() {
    return CONFIG;
  },
};
