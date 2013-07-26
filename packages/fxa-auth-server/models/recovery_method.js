/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (crypto, P, db) {

	function RecoveryMethod() {
		this.id = null
		this.uid = null
		this.verified = false
		this.primary = false
		this.code = null
	}

	RecoveryMethod.create = function (uid, email, primary) {
		var rm = new RecoveryMethod()
		rm.id = email
		rm.uid = uid
		rm.primary = !!primary
		rm.verified = false
		rm.code = crypto.randomBytes(32).toString('hex')
		return rm.sendCode().then(function () { return rm.save() })
	}

	RecoveryMethod.hydrate = function (object) {
    if (!object) return null
    if (object.value) object = object.value
    var rm = new RecoveryMethod()
  	rm.id = object.id
  	rm.uid = object.uid
  	rm.verified = object.verified
  	rm.primary = object.primary
  	rm.code = object.code
  	return rm
	}

	RecoveryMethod.get = function (id) {
		return db
			.get(id + '/recovery')
			.then(RecoveryMethod.hydrate)
	}

	RecoveryMethod.prototype.save = function () {
		var self = this
		return db.set(this.id + '/recovery', this).then(function () { return self })
	}

	RecoveryMethod.prototype.sendCode = function () {
		//TODO
		console.log(this.code)
		return P(null)
	}

	RecoveryMethod.prototype.verify = function (code) {
		if (!this.verified && code === this.code) {
			this.verified = true
			return this.save()
		}
		return P(this)
	}

	return RecoveryMethod
}
