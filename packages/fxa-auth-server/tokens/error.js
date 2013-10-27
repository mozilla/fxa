/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function error(details) {
  var err = new Error(details.message);
  for (var k in details) {
    if (details.hasOwnProperty(k)) {
      err[k] = details[k];
    }
  }
  return err;
}

function accountExists(email) {
  return error({
    errno: 101,
    message: 'Account already exists',
    email: email
  })
}

function unknownAccount(email) {
  return error({
    errno: 102,
    message: 'Unknown account',
    email: email
  })
}

function incorrectPassword() {
  return error({
    errno: 103,
    message: 'Incorrect password'
  })
}

function invalidSignature() {
  return error({
    errno: 109,
    message: 'Invalid signature'
  })
}

function invalidToken() {
  return error({
    errno: 110,
    message: 'Invalid authentication token in request signature'
  })
}

module.exports = {
  error: error,
  accountExists: accountExists,
  unknownAccount: unknownAccount,
  incorrectPassword: incorrectPassword,
  invalidSignature: invalidSignature,
  invalidToken: invalidToken
}
