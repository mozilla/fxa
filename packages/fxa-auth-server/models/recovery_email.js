/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (log, crypto, P, db, mailer) {

  function RecoveryEmail() {
    this.email = null
    this.code = null
    this.uid = null
    this.verified = false
    this.primary = false
    this.code = null
  }

  RecoveryEmail.create = function (uid, email, primary, verified) {
    log.trace({ op: 'RecoveryEmail.create', uid: uid, email: email })
    var rm = new RecoveryEmail()
    rm.email = email
    rm.uid = uid
    rm.primary = !!primary
    rm.verified = verified || false
    rm.code = crypto.randomBytes(4).toString('hex')
    if (!rm.verified) {
      return rm.sendVerifyCode().then(function () { return rm.save() })
    }
    else {
      return rm.save()
    }
  }

  RecoveryEmail.hydrate = function (object) {
    if (!object) return null
    if (object.value) object = object.value
    var rm = new RecoveryEmail()
    rm.email = object.email
    rm.code = object.code
    rm.uid = object.uid
    rm.verified = object.verified
    rm.primary = object.primary
    rm.code = object.code
    return rm
  }

  RecoveryEmail.get = function (uid, code) {
    log.trace({ op: 'RecoveryEmail.get', uid: uid, code: code })
    return db
      .get(uid + code + '/recovery')
      .then(RecoveryEmail.hydrate)
  }

  RecoveryEmail.del = function (uid, code) {
    log.trace({ op: 'RecoveryEmail.del', uid: uid, code: code })
    return db.delete(uid + code + '/recovery')
  }

  RecoveryEmail.prototype.save = function () {
    log.trace({ op: 'recoveryEmail.save', uid: this.uid, code: this.code })
    var self = this
    return db.set(this.uid + this.code + '/recovery', this).then(function () { return self })
  }

  RecoveryEmail.prototype.del = function () {
    return RecoveryEmail.del(this.uid, this.code)
  }

  RecoveryEmail.prototype.sendVerifyCode = function () {
    log.trace({ op: 'recoveryEmail.sendVerifyCode', uid: this.uid, email: this.email })
    return mailer.sendVerifyCode(Buffer(this.email, 'hex').toString('utf8'), this.code, this.uid)
  }

  RecoveryEmail.prototype.verify = function (code) {
    log.trace({ op: 'recoveryEmail.verify', uid: this.uid, code: code })
    if (!this.verified && code === this.code) {
      this.verified = true
      return this.save()
    }
    return P(this)
  }

  return RecoveryEmail
}
