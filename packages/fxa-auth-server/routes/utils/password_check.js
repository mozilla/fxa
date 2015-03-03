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

module.exports = function (log, config, Password, customs, db) {
  return function (emailRecord, authPW, clientAddress) {
    var password = new Password(
      authPW,
      emailRecord.authSalt,
      emailRecord.verifierVersion
    )
    return password.matches(emailRecord.verifyHash)
      .then(
        function (match) {
          if (match) {
            return match
          }

          return customs.flag(clientAddress, emailRecord)
            .then(
              function (result) {
                if (result.lockout) {
                  log.info({
                    op: 'account.lock',
                    email: emailRecord.email,
                    uid: emailRecord.uid
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

