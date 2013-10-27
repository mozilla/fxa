/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (log, inherits, Token, crypto, db, mailer) {

  var LIFETIME = 1000 * 60 * 15

  function ForgotPasswordToken() {
    Token.call(this)
    this.email = null
    this.created = null
    this.passcode = null
    this.tries = null
  }
  inherits(ForgotPasswordToken, Token)

  ForgotPasswordToken.create = function (uid, email) {
    log.trace({ op: 'ForgotPasswordToken.create', uid: uid, email: email })
    return Token
      .randomTokenData('password/forgot', 2 * 32)
      .then(
        function (data) {
          var key = data[1]
          var t = new ForgotPasswordToken()
          t.uid = uid
          t.email = email
          t.passcode = crypto.randomBytes(4).readUInt32BE(0) % 100000000
          t.created = Date.now()
          t.tries = 3
          t.data = data[0].toString('hex')
          t.id = key.slice(0, 32).toString('hex')
          t._key = key.slice(32, 64).toString('hex')
          return t.save()
        }
      )
  }

  return ForgotPasswordToken
}
