/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const error = require('./error');
const oauthDB = require('./db');

module.exports = {
  async destroy(clientId, uid, refreshTokenId) {
    if (refreshTokenId) {
      if (
        !(await oauthDB.deleteClientRefreshToken(refreshTokenId, clientId, uid))
      ) {
        throw error.unknownToken();
      }
    } else {
      await oauthDB.deleteClientAuthorization(clientId, uid);
    }
  },
};
