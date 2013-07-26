/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (inherits, Token, db) {

  function SessionToken() {
    Token.call(this)
  }
  inherits(SessionToken, Token)

  SessionToken.hydrate = function (object) {
    return Token.fill(new SessionToken(), object)
  }

  SessionToken.create = function (uid) {
    return Token
      .randomTokenData('session', 2 * 32)
      .then(
        function (data) {
          var key = data[1]
          var t = new SessionToken()
          t.uid = uid
          t.data = data[0].toString('hex')
          t.id = key.slice(0, 32).toString('hex')
          t.key = key.slice(32, 64).toString('hex')
          return t.save()
        }
      )
  }

  SessionToken.fromHex = function (string) {
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
          t.key = key.slice(32, 64).toString('hex')
          return t
        }
      )
  }

  SessionToken.getCredentials = function (id, cb) {
    SessionToken.get(id)
      .done(
        function (token) {
          cb(null, token)
        },
        cb
      )
  }

  SessionToken.get = function (id) {
    return db
      .get(id + '/session')
      .then(SessionToken.hydrate)
  }

  SessionToken.del = function (id) {
    return db.delete(id + '/session')
  }

  SessionToken.prototype.save = function () {
    var self = this
    return db.set(this.id + '/session', this).then(function () { return self })
  }

  SessionToken.prototype.del = function () {
    return SessionToken.del(this.id)
  }

  return SessionToken
}
