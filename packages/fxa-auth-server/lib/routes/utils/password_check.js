/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Check if the password a user entered matches the one on
 * file for the account. If it does not, flag the account with
 * customs. If customs says the account should be locked,
 * lock the acocunt. Higher levels will take care of
 * returning an error to the user.
 */

var butil = require('../../crypto/butil')
var error = require('../../error')

module.exports = function (log, config, Password, customs, db) {
  return function (emailRecord, authPW, clientAddress) {
    if (butil.buffersAreEqual(emailRecord.authSalt, butil.ONES)) {
      return customs.flag(clientAddress, {
        email: emailRecord.email,
        errno: error.ERRNO.ACCOUNT_RESET
      })
      .then(
        function () {
          throw error.mustResetAccount(emailRecord.email)
        }
      )
    }
    var password = new Password(
      authPW,
      emailRecord.authSalt,
      emailRecord.verifierVersion
    )
    return password.verifyHash()
      .then(
        function (verifyHash) {
          return db.checkPassword(emailRecord.uid, verifyHash)
        }
      )
      .then(
        function (match) {
          if (match) {
            return match
          }

          return customs.flag(clientAddress, {
            email: emailRecord.email,
            errno: error.ERRNO.INCORRECT_PASSWORD
          })
          .then(
            function (result) {
              if (result.lockout) {
                log.info({
                  op: 'account.lock',
                  email: emailRecord.email,
                  uid: emailRecord.uid.toString('hex')
                })
                if (config.lockoutEnabled) {
                  return db.lockAccount(emailRecord)
                }
              }
            }
          )
          .then(
            function () {
              return match
            }
          )
        }
      )
  }
}
