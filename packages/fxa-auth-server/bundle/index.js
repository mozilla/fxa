/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var crypto = require('crypto')
var bigint = require('bigint')
var P = require('p-promise')
var hkdf = require('../hkdf')

module.exports = require('./bundle')(crypto, bigint, P, hkdf)
