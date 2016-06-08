/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*eslint no-console: 0*/

var uuid = require('uuid')

var zeroBuffer16 = Buffer('00000000000000000000000000000000', 'hex')
var zeroBuffer32 = Buffer('0000000000000000000000000000000000000000000000000000000000000000', 'hex')

function createTestAccount() {
  var account = {
    uid: uuid.v4('binary'),
    email: 'foo' + Math.random() + '@bar.com',
    emailCode: zeroBuffer16,
    emailVerified: false,
    verifierVersion: 1,
    verifyHash: zeroBuffer32,
    authSalt: zeroBuffer32,
    kA: zeroBuffer32,
    wrapWrapKb: zeroBuffer32,
    createdAt: Date.now(),
    verifierSetAt: Date.now(),
    locale: 'da, en-gb;q=0.8, en;q=0.7'
  }

  account.normalizedEmail = account.email.toLowerCase()

  return account
}

module.exports = {
  createTestAccount: createTestAccount
}
