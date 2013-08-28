/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (log, inherits, Token, crypto, db, mailer) {

  var LIFETIME = 1000 * 60 * 15

  function ForgotPasswordToken() {
    Token.call(this)
    this.email = null
    this.created = null
    this.code = null
    this.tries = null
  }
  inherits(ForgotPasswordToken, Token)

  ForgotPasswordToken.hydrate = function (object) {
    var t = Token.fill(new ForgotPasswordToken(), object)
    if (t) {
      var o = object.value || object
      t.email = o.email
      t.code = o.code
      t.tries = o.tries
      t.created = o.created
    }
    return t
  }

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
          t.code = crypto.randomBytes(4).readUInt32BE(0) % 100000000
          t.created = Date.now()
          t.tries = 3
          t.data = data[0].toString('hex')
          t.id = key.slice(0, 32).toString('hex')
          t._key = key.slice(32, 64).toString('hex')
          return t.save()
        }
      )
  }

  ForgotPasswordToken.fromHex = function (string) {
    log.trace({ op: 'ForgotPasswordToken.fromHex' })
    return Token
      .tokenDataFromBytes(
        'password/forgot',
        2 * 32,
        Buffer(string, 'hex')
      )
      .then(
        function (data) {
          var key = data[1]
          var t = new ForgotPasswordToken()
          t.data = data[0].toString('hex')
          t.id = key.slice(0, 32).toString('hex')
          t._key = key.slice(32, 64).toString('hex')
          return t
        }
      )
  }

  ForgotPasswordToken.getCredentials = function (id, cb) {
    log.trace({ op: 'ForgotPasswordToken.create', id: id })
    ForgotPasswordToken.get(id)
      .done(
        function (token) {
          cb(null, token)
        },
        cb
      )
  }

  ForgotPasswordToken.get = function (id) {
    log.trace({ op: 'ForgotPasswordToken.get', id: id })
    return db
      .get(id + '/forgot')
      .then(ForgotPasswordToken.hydrate)
  }

  ForgotPasswordToken.del = function (id) {
    log.trace({ op: 'ForgotPasswordToken.del', id: id })
    return db.delete(id + '/forgot')
  }

  ForgotPasswordToken.prototype.save = function () {
    log.trace({ op: 'forgotPasswordToken.save', id: this.id })
    var self = this
    return db.set(this.id + '/forgot', this).then(function () { return self })
  }

  ForgotPasswordToken.prototype.del = function () {
    return ForgotPasswordToken.del(this.id)
  }

  ForgotPasswordToken.prototype.failAttempt = function () {
    log.trace({ op: 'forgotPasswordToken.failAttempt', id: this.id })
    this.tries--
    if (this.tries < 1) {
      return this.del()
    }
    return this.save()
  }

  ForgotPasswordToken.prototype.ttl = function () {
    return Math.max(
      Math.ceil((LIFETIME - (Date.now() - this.created)) / 1000),
      0
    )
  }

  ForgotPasswordToken.prototype.sendRecoveryCode = function () {
    log.trace({ op: 'forgotPasswordToken.sendRecoveryCode', id: this.id })
    return mailer.sendRecoveryCode(Buffer(this.email, 'hex').toString(), this.code)
  }

  return ForgotPasswordToken
}
