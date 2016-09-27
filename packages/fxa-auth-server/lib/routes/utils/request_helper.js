/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Returns `true` if request has a keys=true query param.
 *
 * @param request
 * @returns {boolean}
 */
function wantsKeys (request) {
  return request.query && request.query.keys === 'true'
}

/**
 * Returns whether or not to send the verify account email on a login
 * attempt. This never sends a verification email to an already verified email.
 *
 * @param request
 * @returns {boolean}
 */
function shouldSendVerifyAccountEmail(account, request) {

  var sendEmailIfUnverified = request.query.sendEmailIfUnverified

  // Only the content-server sends metrics context. For all non content-server
  // requests, send the verification email.
  var context = !!(request.payload && request.payload.metricsContext)

  return (!context || !!sendEmailIfUnverified) && !account.emailVerified
}

module.exports = {
  wantsKeys: wantsKeys,
  shouldSendVerifyAccountEmail: shouldSendVerifyAccountEmail
}
