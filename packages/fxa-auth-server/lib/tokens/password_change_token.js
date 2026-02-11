/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const inherits = require('util').inherits;

module.exports = function (log, Token, lifetime) {
  function PasswordChangeToken(keys, details) {
    details.lifetime = lifetime;
    Token.call(this, keys, details);
  }
  inherits(PasswordChangeToken, Token);

  PasswordChangeToken.tokenTypeID = 'passwordChangeToken';

  PasswordChangeToken.create = function (details) {
    log.trace('PasswordChangeToken.create', { uid: details && details.uid });
    return Token.createNewToken(PasswordChangeToken, details || {});
  };

  PasswordChangeToken.fromHex = function (string, details) {
    log.trace('PasswordChangeToken.fromHex');
    return Token.createTokenFromHexData(
      PasswordChangeToken,
      string,
      details || {}
    );
  };

  return PasswordChangeToken;
};
