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
  return request.query.keys === 'true'
}

/**
 * Returns whether or not to perform a sign-in verification email.
 *
 * @param account
 * @param config
 * @param request
 * @returns {boolean}
 */
function shouldEnableSigninConfirmation(account, config, request) {

  var confirmLogin = config.signinConfirmation && config.signinConfirmation.enabled
  if (!confirmLogin) {
    return false
  }

  // Always enable if customs-server has said the request is suspicious.
  if (request.app.isSuspiciousRequest) {
    return true
  }

  var keysRequested = wantsKeys(request)
  if (!keysRequested) {
    return false
  }

  // Or if the email address matching one of these regexes.
  var email = account.email
  var isValidEmail = config.signinConfirmation.forceEmailRegex.some(function (reg) {
    var emailReg = new RegExp(reg)
    return emailReg.test(email)
  })

  if (isValidEmail) {
    return true
  }

  // Otherwise, the feature is currently only enabled
  // for a specific subset of device types.
  var context = request.payload && request.payload.metricsContext && request.payload.metricsContext.context
  var isValidContext = context && (config.signinConfirmation.supportedClients.indexOf(context) > -1)
  if (!isValidContext) {
    return false
  }

  // Check to see if user in roll-out cohort.
  // Cohort is determined by user's uid.
  var uid = account.uid.toString('hex')
  var uidNum = parseInt(uid.substr(0, 4), 16) % 100
  return uidNum < (config.signinConfirmation.sample_rate * 100)
}

module.exports = {
  wantsKeys: wantsKeys,
  shouldEnableSigninConfirmation: shouldEnableSigninConfirmation
}
