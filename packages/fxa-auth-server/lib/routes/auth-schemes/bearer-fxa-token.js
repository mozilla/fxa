/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { AppError } = require('@fxa/accounts/errors');
const Boom = require('@hapi/boom');

// Prefix per token kind. Uses a GitHub/Stripe-style typed prefix so the
// refresh-token strategy (plain `Bearer <hex>`) and the FxA session/key/etc
// strategies never collide on the same route — see ADR-0022 and FXA-9392.
const KIND_PREFIXES = {
  sessionToken: 'fxs',
  keyFetchToken: 'fxk',
  keyFetchTokenWithVerificationStatus: 'fxkv',
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

/**
 * Authentication strategy for FxA token types delivered as Bearer tokens.
 *
 * Wire format: `Authorization: Bearer <prefix>_<hex>`, where `<prefix>` is
 * determined by `kind` (see `KIND_PREFIXES`). No HMAC — the id is the raw
 * lookup key, just like the Hawk strategy's `id=` attribute.
 *
 * Fallthrough semantics (required for multi-strategy route chains):
 *   - Header missing, mode=optional       -> h.continue
 *   - Header missing, mode=required:
 *       throwOnFailure=true  -> throw AppError.unauthorized
 *       throwOnFailure=false -> return Boom.unauthorized
 *   - Header present but wrong prefix/shape -> return Boom.unauthorized
 *     (lets Hapi try the next strategy; never throws, even in the default
 *     `throwOnFailure=true` case — a Hawk or refresh-token header should
 *     still get its own chance)
 *   - Prefix matches, id lookup returns no token:
 *       throwOnFailure=true  -> throw AppError.unauthorized
 *       throwOnFailure=false -> return Boom.unauthorized
 *
 * @param {string} kind - token kind, keys of `KIND_PREFIXES`
 * @param {Function} getCredentialsFunc - id lookup, returns token or null
 * @param {{ throwOnFailure?: boolean, postAuthenticate?: Function }} [opts]
 *        `postAuthenticate(req, token)` runs after a successful lookup and
 *        before `h.authenticated`; used by `verifiedSessionTokenBearer` to
 *        share post-lookup guards (email/token verified, AAL2) with the
 *        Hawk-backed `verifiedSessionToken` strategy.
 */
function strategy(
  kind,
  getCredentialsFunc,
  { throwOnFailure = true, postAuthenticate, statsd } = {}
) {
  const prefix = prefixFor(kind);
  const headerRe = makeHeaderRegex(prefix);

  const tokenNotFoundError = () => {
    const err = AppError.unauthorized('Token not found');
    err.isMissing = true;
    return err;
  };

  const recordUsed = () => {
    if (statsd) {
      statsd.increment('auth.strategy.used', [`scheme:bearer`, `kind:${kind}`]);
    }
  };

  return function (server, options) {
    return {
      authenticate: async function (req, h) {
        const auth = req.headers.authorization;

        if (!auth) {
          if (req.auth.mode === 'optional') {
            return h.continue;
          }
          if (throwOnFailure) {
            throw tokenNotFoundError();
          }
          return Boom.unauthorized(null, 'bearerFxaToken');
        }

        const match = auth.match(headerRe);
        if (!match) {
          // Wrong scheme, wrong prefix for this kind, malformed body,
          // or any formatting drift (whitespace, mixed case). Let the
          // next strategy in the chain try.
          return Boom.unauthorized(null, 'bearerFxaToken');
        }

        const tokenId = match[1];
        let token;
        try {
          token = await getCredentialsFunc(tokenId);
        } catch (_) {
          // getCredentialsFunc swallows invalid-hex / expired internally
          // but may still surface DB errors. Treat as "token not found".
        }

        if (!token) {
          if (throwOnFailure) {
            throw tokenNotFoundError();
          }
          return Boom.unauthorized(null, 'bearerFxaToken');
        }

        if (postAuthenticate) {
          await postAuthenticate(req, token);
        }

        recordUsed();
        return h.authenticated({ credentials: token });
      },
      payload: async function (req, h) {
        // Bearer has nothing to verify about the payload. Preserve the
        // Hawk strategy's behavior for routes that declare
        // `auth: { payload: 'required' }` so a Bearer swap doesn't
        // silently drop the requirement.
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
