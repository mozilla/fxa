/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (crypto, P, db, mailer) {

  function RecoveryEmail() {
    this.code = null
    this.uid = null
    this.verified = false
    this.primary = false
    this.code = null
  }

  RecoveryEmail.create = function (uid, email, primary, verified) {
    var rm = new RecoveryEmail()
    rm.email = email
    rm.uid = uid
    rm.primary = !!primary
    rm.verified = verified || false
    rm.code = crypto.randomBytes(4).toString('hex')
    if (!rm.verified) {
      return rm.sendCode().then(function () { return rm.save() })
    }
    else {
      return rm.save()
    }
  }

  RecoveryEmail.hydrate = function (object) {
    if (!object) return null
    if (object.value) object = object.value
    var rm = new RecoveryEmail()
    rm.code = object.code
    rm.uid = object.uid
    rm.verified = object.verified
    rm.primary = object.primary
    rm.code = object.code
    return rm
  }

  RecoveryEmail.get = function (uid, code) {
    return db
      .get(uid + code + '/recovery')
      .then(RecoveryEmail.hydrate)
  }

  RecoveryEmail.del = function (uid, code) {
    return db.delete(uid + code + '/recovery')
  }

  RecoveryEmail.prototype.save = function () {
    var self = this
    return db.set(this.uid + this.code + '/recovery', this).then(function () { return self })
  }

  RecoveryEmail.prototype.del = function () {
    return RecoveryEmail.del(this.uid, this.code)
  }

  RecoveryEmail.prototype.sendCode = function () {
    return mailer.sendCode(Buffer(this.email, 'hex').toString('utf8'), this.code)
  }

  RecoveryEmail.prototype.verify = function (code) {
    if (!this.verified && code === this.code) {
      this.verified = true
      return this.save()
    }
    return P(this)
  }

  return RecoveryEmail
}
