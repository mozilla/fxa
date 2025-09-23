/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const AppError = require('../../error');
const authMethods = require('../../authMethods');
const { parseAuthorizationHeader } = require('./hawk-fxa-token');

/**
 * Authentication strategy that validates a Hawk session token and ensures:
 * 1) account email is verified
 * 2) session token is verified (no tokenVerificationId)
 * 3) account AAL and session AAL match
 *
 * @param {Function} getCredentialsFunc - function to fetch a session token by id
 * @param {Object} db - database interface to fetch account and factors
 * @returns {Function}
 */
function strategy(getCredentialsFunc, db, config, statsd) {
  const tokenNotFoundError = () => {
    const error = AppError.unauthorized('Token not found');
    error.isMissing = true;
    return error;
  };

  // Extract regular expressions to allow for optional skipping of certain routes for certain checks.
  const verifiedSessionTokenConfig =
    config?.authStrategies?.verifiedSessionToken;

  const skipEmailVerifiedCheckForRoutes =
    verifiedSessionTokenConfig?.skipEmailVerifiedCheckForRoutes &&
    new RegExp(verifiedSessionTokenConfig.skipEmailVerifiedCheckForRoutes);

  const skipTokenVerifiedCheckForRoutes =
    verifiedSessionTokenConfig?.skipTokenVerifiedCheckForRoutes &&
    new RegExp(verifiedSessionTokenConfig.skipTokenVerifiedCheckForRoutes);

  const skipAalCheckForRoutes =
    verifiedSessionTokenConfig?.skipAalCheckForRoutes &&
    new RegExp(verifiedSessionTokenConfig.skipAalCheckForRoutes);

  return function (server, options) {
    return {
      authenticate: async function (req, h) {
        const auth = req.headers.authorization;

        if (!auth) {
          // if this strategy is selected, auth *cannot* be optional
          // "optional" mode is not supported
          throw tokenNotFoundError();
        }

        const parsedHeader = parseAuthorizationHeader(auth);
        let token;
        try {
          token = await getCredentialsFunc(parsedHeader.id);
        } catch (_) {}

        if (!token) {
          throw tokenNotFoundError();
        }

        // Fetch the account for further checks
        const account = await db.account(token.uid);

        // 1) account email is verified
        if (!account?.primaryEmail?.isVerified) {
          if (skipEmailVerifiedCheckForRoutes?.test(req.route.path)) {
            console.log(
              '!!! verified_session_token.primary_email_not_verified.skipped'
            );
            statsd?.increment(
              'verified_session_token.primary_email_not_verified.skipped',
              [
                // Important! Using req.route.path which has much lower cardinality than req.path
                req.route.path,
              ]
            );
          } else {
            statsd?.increment(
              'verified_session_token.primary_email_not_verified.error',
              [req.route.path]
            );
            throw AppError.unverifiedAccount();
          }
        }

        // 2) session token is verified
        if (token.tokenVerificationId || token.tokenVerified === false) {
          if (skipTokenVerifiedCheckForRoutes?.test(req.route.path)) {
            console.log('!!! verified_session_token.token_verified.skipped');
            statsd?.increment('verified_session_token.token_verified.skipped', [
              req.route.path,
            ]);
          } else {
            statsd?.increment('verified_session_token.token_verified.error', [
              req.route.path,
            ]);
            throw AppError.unverifiedSession();
          }
        }

        // 3) account AAL and session AAL match
        const accountAmr = await authMethods.availableAuthenticationMethods(
          db,
          account
        );
        const accountAal = authMethods.maximumAssuranceLevel(accountAmr);
        const sessionAal = token.authenticatorAssuranceLevel;

        if (accountAal !== sessionAal) {
          if (skipAalCheckForRoutes?.test(req.route.path)) {
            console.log('!!! verified_session_token.aal.skipped');
            statsd?.increment('verified_session_token.aal.skipped', [
              req.route.path,
            ]);
          } else {
            statsd?.increment('verified_session_token.aal.error', [
              req.route.path,
            ]);
            throw AppError.unauthorized('AAL mismatch');
          }
        }

        return h.authenticated({
          credentials: token,
        });
      },
    };
  };
}

module.exports = {
  strategy,
};
