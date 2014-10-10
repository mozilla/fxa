/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const AppError = require('./error');
const auth = require('./auth');
const db = require('./db');
const encrypt = require('./encrypt');

exports.verify = function verify(token) {
  return db.getToken(encrypt.hash(token))
  .then(function(token) {
    if (!token) {
      throw AppError.invalidToken();
    }
    var tokenInfo = {
      user: token.userId.toString('hex'),
      scope: token.scope
    };

    // token.scope is a Set/Array
    if (token.scope.indexOf('profile') !== -1 ||
        token.scope.indexOf('profile:email') !== -1) {
      tokenInfo.email = token.email;
    }

    // the schema validator for /v1/verify will prevent _email from leaking
    if (token.scope.indexOf(auth.SCOPE_CLIENT_MANAGEMENT) !== -1) {
      tokenInfo._email = token.email;
    }

    return tokenInfo;
  });
};
