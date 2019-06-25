/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const config = require('../config').getProperties();

module.exports = {
  host: config.server.host,
  port: config.server.port,
  routes: {
    cache: {
      otherwise: config.cacheControl,
    },
    cors: true,
    payload: {
      maxBytes: 16384,
    },
    security: {
      hsts: {
        maxAge: 15552000,
        includeSubdomains: true,
      },
      xframe: true,
      xss: true,
      noOpen: false,
      noSniff: true,
    },
    validate: {
      failAction: async (request, h, err) => {
        // Starting with Hapi 17, the framework hides the validation info
        // We want the full validation information and use it in server `onPreResponse`
        // See: https://github.com/hapijs/hapi/issues/3706#issuecomment-349765943
        throw err;
      },
    },
  },
};
