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
 * Returns `true` if the request's session is past the `mustVerify` gate: the
 * account email is verified, and the session owes no confirmation. This is the
 * same check `makeAssertionJWT` in `oauth/util.js` makes.
 *
 * This is not a measure of assurance. A password-only session that was never
 * asked to confirm passes, and so do passkey and third-party sessions, which
 * involve no password at all. Non-session tokens carry none of these fields,
 * so they do not pass.
 *
 * @param request
 * @returns {boolean}
 */
function isPastMustVerifyGate(request) {
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
  isPastMustVerifyGate,
  urlSafeBase64,
};
