/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Match any non-empty hex-encoded string.

module.exports.HEX_STRING = /^(?:[a-fA-F0-9]{2})+$/

module.exports.LAZY_EMAIL = /^[^@\s]+@[^@\s]+$/

module.exports.domainRegex = function (hostname) {
	return new RegExp('^https?:\\/\\/\\S+\\.' + hostname.replace('.', '\\.') + '(?:\\/\\S*)*$')
}
