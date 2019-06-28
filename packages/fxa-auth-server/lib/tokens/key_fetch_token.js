/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const inherits = require('util').inherits;
const P = require('../promise');

module.exports = function(log, Token) {
  function KeyFetchToken(keys, details) {
    Token.call(this, keys, details);
    this.keyBundle = details.keyBundle;
    this.emailVerified = !!details.emailVerified;

    // Tokens are considered verified if no tokenVerificationId exists
    this.tokenVerificationId = details.tokenVerificationId || null;
    this.tokenVerified = this.tokenVerificationId ? false : true;
  }
  inherits(KeyFetchToken, Token);

  KeyFetchToken.tokenTypeID = 'keyFetchToken';

  KeyFetchToken.create = function(details) {
    log.trace('KeyFetchToken.create', { uid: details && details.uid });
    return Token.createNewToken(KeyFetchToken, details || {}).then(token => {
      return token.bundleKeys(details.kA, details.wrapKb).then(keyBundle => {
        token.keyBundle = keyBundle;
        return token;
      });
    });
  };

  KeyFetchToken.fromId = function(id, details) {
    log.trace('KeyFetchToken.fromId');
    return P.resolve(
      new KeyFetchToken({ id, authKey: details.authKey }, details)
    );
  };

  KeyFetchToken.fromHex = function(string, details) {
    log.trace('KeyFetchToken.fromHex');
    return Token.createTokenFromHexData(KeyFetchToken, string, details || {});
  };

  KeyFetchToken.prototype.bundleKeys = function(kA, wrapKb) {
    log.trace('keyFetchToken.bundleKeys', { id: this.id });
    kA = Buffer.from(kA, 'hex');
    wrapKb = Buffer.from(wrapKb, 'hex');
    return this.bundle('account/keys', Buffer.concat([kA, wrapKb]));
  };

  KeyFetchToken.prototype.unbundleKeys = function(bundle) {
    log.trace('keyFetchToken.unbundleKeys', { id: this.id });
    return this.unbundle('account/keys', bundle).then(plaintext => {
      return {
        kA: plaintext.slice(0, 64), // strings, not buffers
        wrapKb: plaintext.slice(64, 128),
      };
    });
  };

  return KeyFetchToken;
};
