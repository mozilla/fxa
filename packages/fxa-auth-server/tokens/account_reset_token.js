/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (log, inherits, Token, crypto) {

  function AccountResetToken(keys, details) {
    Token.call(this, keys, details)
  }
  inherits(AccountResetToken, Token)

  AccountResetToken.tokenTypeID = 'accountResetToken'

  AccountResetToken.create = function (details) {
    log.trace({ op: 'AccountResetToken.create', uid: details && details.uid })
    return Token.createNewToken(AccountResetToken, details || {})
  }

  AccountResetToken.fromHex = function (string, details) {
    log.trace({ op: 'AccountResetToken.fromHex' })
    details = details || {}
    return Token.createTokenFromHexData(AccountResetToken, string, details)
  }

  return AccountResetToken
}
