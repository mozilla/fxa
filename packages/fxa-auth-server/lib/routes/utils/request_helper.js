/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

/**
 * Returns `true` if request has a keys=true query param.
 *
 * @param request
 * @returns {boolean}
 */
function wantsKeys(request) {
  return !!(request.query && request.query.keys);
}

/**
 * Returns `true` if the request's session has proven more than the password:
 * email verified and no confirmation still owed. Non-session tokens, which carry
 * none of these fields, count as unproven.
 *
 * @param request
 * @returns {boolean}
 */
function hasProvenSession(request) {
  const { emailVerified, mustVerify, tokenVerified } =
    request.auth?.credentials || {};
  return !!emailVerified && !(mustVerify && !tokenVerified);
}

function urlSafeBase64(hex) {
  return Buffer.from(hex, 'hex')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

module.exports = {
  wantsKeys,
  hasProvenSession,
  urlSafeBase64,
};
