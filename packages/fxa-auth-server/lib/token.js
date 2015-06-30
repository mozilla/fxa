/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const AppError = require('./error');
const auth = require('./auth');
const db = require('./db');
const encrypt = require('./encrypt');
const Scope = require('./scope');

exports.verify = function verify(token) {
  return db.getAccessToken(encrypt.hash(token))
  .then(function(token) {
    if (!token) {
      throw AppError.invalidToken();
    } else if (+token.expiresAt < Date.now()) {
      throw AppError.expiredToken(token.expiresAt);
    }
    var tokenInfo = {
      user: token.userId.toString('hex'),
      client_id: token.clientId.toString('hex'),
      scope: token.scope
    };

    var scope = Scope(token.scope);
    if (scope.has('profile:email') || scope.has(auth.SCOPE_CLIENT_MANAGEMENT)) {
      tokenInfo.email = token.email;
    }

    return tokenInfo;
  });
};
