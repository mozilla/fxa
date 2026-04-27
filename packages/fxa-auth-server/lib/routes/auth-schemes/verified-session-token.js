/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { AppError } = require('@fxa/accounts/errors');
const authMethods = require('../../authMethods');
const { parseAuthorizationHeader } = require('./hawk-fxa-token');

/**
 * Authentication strategy that validates a Hawk session token and ensures:
 * 1) account email is verified
 * 2) session token is verified (no tokenVerificationId)
 * 3) session AAL satisfies account requirements
 *
 * @param {Function} getCredentialsFunc - function to fetch a session token by id
 * @param {Object} db - database interface to fetch account and factors
 * @returns {Function}
 */
// Builds the post-lookup guard used by both the Hawk-backed
// `verifiedSessionToken` strategy and the Bearer-backed
// `verifiedSessionTokenBearer` strategy (FXA-9392). Factored so both paths
// enforce the same checks without duplication.
function makePostLookupGuard(db, config, statsd) {
  const verifiedSessionTokenConfig =
    config?.authStrategies?.verifiedSessionToken;

  const skipEmailVerifiedCheckForRoutes =
    verifiedSessionTokenConfig?.skipEmailVerifiedCheckForRoutes
      ? new RegExp(verifiedSessionTokenConfig.skipEmailVerifiedCheckForRoutes)
      : null;

  const skipTokenVerifiedCheckForRoutes =
    verifiedSessionTokenConfig?.skipTokenVerifiedCheckForRoutes
      ? new RegExp(verifiedSessionTokenConfig.skipTokenVerifiedCheckForRoutes)
      : null;

  const skipAalCheckForRoutes =
    verifiedSessionTokenConfig?.skipAalCheckForRoutes
      ? new RegExp(verifiedSessionTokenConfig.skipAalCheckForRoutes)
      : null;

  return async function postLookupGuard(req, token) {
    const account = await db.account(token.uid);

    // 1) account email is verified
    if (!account?.primaryEmail?.isVerified) {
      if (skipEmailVerifiedCheckForRoutes?.test(req.route.path)) {
        // Important! Using req.route.path which has much lower cardinality than req.path
        statsd?.increment(
          'verified_session_token.primary_email_not_verified.skipped',
          [`path:${req.route.path}`]
        );
      } else {
        statsd?.increment(
          'verified_session_token.primary_email_not_verified.error',
          [`path:${req.route.path}`]
        );
        throw AppError.unverifiedAccount();
      }
    }

    // 2) session token is verified
    if (!token.tokenVerified) {
      if (skipTokenVerifiedCheckForRoutes?.test(req.route.path)) {
        statsd?.increment('verified_session_token.token_verified.skipped', [
          `path:${req.route.path}`,
        ]);
      } else {
        statsd?.increment('verified_session_token.token_verified.error', [
          `path:${req.route.path}`,
        ]);
        throw AppError.unverifiedSession();
      }
    }

    // 3) session AAL satisfies account requirements
    const accountRequiresAal2 = await authMethods.accountRequiresAAL2(
      db,
      account
    );
    const sessionAal = token.authenticatorAssuranceLevel;

    if (accountRequiresAal2 && sessionAal < 2) {
      if (skipAalCheckForRoutes?.test(req.route.path)) {
        statsd?.increment('verified_session_token.aal.skipped', [
          `path:${req.route.path}`,
        ]);
      } else {
        statsd?.increment('verified_session_token.aal.error', [
          `path:${req.route.path}`,
        ]);
        throw AppError.insufficientAal();
      }
    }
  };
}

function strategy(getCredentialsFunc, db, config, statsd) {
  const tokenNotFoundError = () => {
    const error = AppError.unauthorized('Token not found');
    error.isMissing = true;
    return error;
  };

  const postLookupGuard = makePostLookupGuard(db, config, statsd);

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

        await postLookupGuard(req, token);

        return h.authenticated({
          credentials: token,
        });
      },
    };
  };
}

module.exports = {
  strategy,
  makePostLookupGuard,
};
