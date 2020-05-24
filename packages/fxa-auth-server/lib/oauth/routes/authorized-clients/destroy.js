/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const validators = require('../../validators');
const db = require('../../db');
const error = require('../../error');
const verifyAssertion = require('../../assertion');

module.exports = {
  validate: {
    payload: {
      client_id: validators.clientId,
      refresh_token_id: validators.token.optional(),
      assertion: validators.assertion,
    },
  },
  handler: async function (req) {
    const claims = await verifyAssertion(req.payload.assertion);
    if (req.payload.refresh_token_id) {
      if (
        !(await db.deleteClientRefreshToken(
          req.payload.refresh_token_id,
          req.payload.client_id,
          claims.uid
        ))
      ) {
        throw error.unknownToken();
      }
    } else {
      await db.deleteClientAuthorization(req.payload.client_id, claims.uid);
    }
    return {};
  },
};
