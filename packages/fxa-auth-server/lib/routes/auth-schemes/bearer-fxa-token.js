/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { AppError } = require('@fxa/accounts/errors');
const Sentry = require('@sentry/node');

// GitHub/Stripe-style typed prefix per token kind so the FxA strategies
// never collide with the refresh-token strategy (plain `Bearer <hex>`) on
// the same route. See ADR-0022.
//
// Every prefix is `fx` (FxA) plus the first letter(s) of the kind:
//   fxs_   sessionToken
//   fxk_   keyFetchToken
//   fxk_   keyFetchTokenWithVerificationStatus  (shared with keyFetchToken;
//          same wire id, the with-verification variant only changes which
//          DB lookup runs server-side, and the client only ever derives
//          one keyFetch credential)
//   fxar_  accountResetToken
//   fxpf_  passwordForgotToken
//   fxpc_  passwordChangeToken
const KIND_PREFIXES = {
  sessionToken: 'fxs',
  keyFetchToken: 'fxk',
  keyFetchTokenWithVerificationStatus: 'fxk',
  accountResetToken: 'fxar',
  passwordForgotToken: 'fxpf',
  passwordChangeToken: 'fxpc',
};

// Strict on-the-wire format: `Bearer <prefix>_<64 hex chars>`. No leading or
// trailing whitespace, no mixed case in the prefix or the hex body. This
// keeps the parser disjoint from plain `Bearer <hex>` (refresh token) and
// from Hawk.
function makeHeaderRegex(prefix) {
  return new RegExp(`^Bearer ${prefix}_([0-9a-f]{64})$`);
}

function prefixFor(kind) {
  const prefix = KIND_PREFIXES[kind];
  if (!prefix) {
    throw new Error(`bearer-fxa-token: unknown token kind '${kind}'`);
  }
  return prefix;
}

function requireOptions(options) {
  if (!options || typeof options !== 'object') {
    throw new Error('bearer-fxa-token: options object is required');
  }
  if (typeof options.throwOnFailure !== 'boolean') {
    throw new Error(
      'bearer-fxa-token: options.throwOnFailure (boolean) is required'
    );
  }
  if (!options.statsd) {
    throw new Error('bearer-fxa-token: options.statsd is required');
  }
}

/**
 * Authentication strategy for FxA token types delivered as Bearer tokens.
 *
 * Wire format: `Authorization: Bearer <prefix>_<hex>`, where `<prefix>` is
 * determined by `kind` (see `KIND_PREFIXES`). No HMAC — the id is the raw
 * lookup key, just like the Hawk strategy's `id=` attribute.
 *
 * `throwOnFailure` and `statsd` are required so callers decide explicitly
 * per registration (single-strategy routes use `true`; multi-strategy
 * chains use `false` to let Hapi try the next strategy). All failure modes
 * carry `errno=110` ("Token not found") so a final 401 is wire-compatible
 * with the single-strategy Hawk response shape.
 *
 * `postAuthenticate` is optional and used by `verifiedSessionTokenBearer`
 * to share post-lookup guards (email/token verified, AAL2) with the
 * Hawk-backed `verifiedSessionToken` strategy.
 *
 * @param {string} kind - token kind, keys of `KIND_PREFIXES`
 * @param {Function} getCredentialsFunc - id lookup, returns token or null
 * @param {{ throwOnFailure: boolean, statsd: object, postAuthenticate?: Function }} options
 */
function strategy(kind, getCredentialsFunc, options) {
  requireOptions(options);
  const { throwOnFailure, postAuthenticate, statsd } = options;
  const prefix = prefixFor(kind);
  const headerRe = makeHeaderRegex(prefix);

  const tokenNotFoundError = () => {
    const err = AppError.unauthorized('Token not found');
    err.isMissing = true;
    return err;
  };

  // Single-strategy routes throw to short-circuit; multi-strategy chains
  // return so Hapi tries the next strategy. Both paths carry `errno=110`.
  const failAuth = () => {
    const err = tokenNotFoundError();
    if (throwOnFailure) {
      throw err;
    }
    return err;
  };

  // `path` is the templated route (e.g. /v1/account/device), never the raw
  // URL, so cardinality stays ~2 schemes x authed routes (~130 series total).
  const recordUsed = (req) => {
    statsd.increment('auth.strategy.used', [
      `scheme:bearer`,
      `kind:${kind}`,
      `path:${req.route?.path ?? 'unknown'}`,
    ]);
  };

  return function (server, options) {
    return {
      authenticate: async function (req, h) {
        const auth = req.headers.authorization;

        if (!auth) {
          if (req.auth.mode === 'optional') {
            return h.continue;
          }
          return failAuth();
        }

        const match = auth.match(headerRe);
        if (!match) {
          // Wrong scheme/prefix/shape — always return (never throw) so a
          // Hawk or refresh-token header gets its own chance on the chain.
          return tokenNotFoundError();
        }

        const tokenId = match[1];
        let token;
        try {
          token = await getCredentialsFunc(tokenId);
        } catch (err) {
          // Treat unexpected DB/driver faults as "token not found" so the
          // chain falls through, but report them so outages aren't silent.
          Sentry.captureException(err);
        }

        if (!token) {
          return failAuth();
        }

        if (postAuthenticate) {
          await postAuthenticate(req, token);
        }

        recordUsed(req);
        return h.authenticated({ credentials: token });
      },
      payload: async function (req, h) {
        // Hapi requires a `payload` hook on the strategy whenever a route
        // declares `auth: { payload: 'required' }`. Neither this strategy
        // nor the sibling Hawk one (see hawk-fxa-token.js) validates a
        // payload signature; this is purely a body-presence check.
        if (req.route.settings.auth.payload === 'required' && !req.payload) {
          throw AppError.invalidSignature('Payload is required');
        }
        return h.continue;
      },
    };
  };
}

module.exports = {
  strategy,
  KIND_PREFIXES,
};
