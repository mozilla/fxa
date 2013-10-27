/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (log, inherits, Token) {

  function SessionToken() {
    Token.call(this)
  }
  inherits(SessionToken, Token)

  SessionToken.create = function (uid) {
    log.trace({ op: 'SessionToken.create', uid: uid })
    return Token
      .randomTokenData('session', 2 * 32)
      .then(
        function (data) {
          var key = data[1]
          var t = new SessionToken()
          t.uid = uid
          t.data = data[0].toString('hex')
          t.id = key.slice(0, 32).toString('hex')
          t._key = key.slice(32, 64).toString('hex')
          return t
        }
      )
  }

  SessionToken.fromHex = function (string) {
    log.trace({ op: 'SessionToken.fromHex' })
    return Token
      .tokenDataFromBytes(
        'session',
        2 * 32,
        Buffer(string, 'hex')
      )
      .then(
        function (data) {
          var key = data[1]
          var t = new SessionToken()
          t.data = data[0].toString('hex')
          t.id = key.slice(0, 32).toString('hex')
          t._key = key.slice(32, 64).toString('hex')
          return t
        }
      )
  }

  return SessionToken
}
