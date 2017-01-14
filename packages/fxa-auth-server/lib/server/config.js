/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = {
  connections: {
    routes: {
      cache: {
        otherwise: 'private, no-cache, no-store, must-revalidate'
      },
      cors: true,
      payload: {
        maxBytes: 16384
      },
      security: {
        hsts: {
          maxAge: 15552000,
          includeSubdomains: true
        },
        xframe: true,
        xss: true,
        noOpen: false,
        noSniff: true
      }
    }
  }
};
