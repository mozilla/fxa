/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { AppError } = require('@fxa/accounts/errors');
const Boom = require('@hapi/boom');

// The following regexes and Hawk header parsing are taken from the Hawk library.
// See https://github.com/mozilla/hawk/blob/01f3d35479fe76654bb50f2886b37310555d088e/lib/utils.js#L126
const authHeaderRegex = /^(\w+)(?:\s+(.*))?$/; // Header: scheme[ something]
const attributeRegex = /^[ \w!#$%&'()*+,\-./:;<=>?@[\]^`{|}~]+$/; // !#$%&'()*+,-./:;<=>?@[]^_`{|}~ and space, a-z, A-Z, 0-9
function parseAuthorizationHeader(header, keys) {
  keys = keys || ['id', 'ts', 'nonce', 'hash', 'ext', 'mac', 'app', 'dlg'];

  if (!header) {
    throw Boom.unauthorized(null, 'Hawk');
  }

  if (header.length > 4096) {
    throw Boom.badRequest('Header length too long');
  }

  const headerParts = header.match(authHeaderRegex);
  if (!headerParts) {
    throw Boom.badRequest('Invalid header syntax');
  }

  const scheme = headerParts[1];
  if (scheme.toLowerCase() !== 'hawk') {
    throw Boom.unauthorized(null, 'Hawk');
  }

  const attributesString = headerParts[2];
  if (!attributesString) {
    throw Boom.badRequest('Invalid header syntax');
  }

  const attributes = {};
  let errorMessage = '';
  const verify = attributesString.replace(
    /(\w+)="([^"\\]*)"\s*(?:,\s*|$)/g,
    ($0, $1, $2) => {
      // Check valid attribute names
      if (keys.indexOf($1) === -1) {
        errorMessage = 'Unknown attribute: ' + $1;
        return;
      }

      // Allowed attribute value characters
      if ($2.match(attributeRegex) === null) {
        errorMessage = 'Bad attribute value: ' + $1;
        return;
      }

      // Check for duplicates
      // eslint-disable-next-line no-prototype-builtins
      if (attributes.hasOwnProperty($1)) {
        errorMessage = 'Duplicate attribute: ' + $1;
        return;
      }

      attributes[$1] = $2;
      return '';
    }
  );

  if (verify !== '') {
    throw Boom.badRequest(errorMessage || 'Bad header format');
  }

  return attributes;
}

function requireOptions(options) {
  if (!options || typeof options !== 'object') {
    throw new Error('hawk-fxa-token: options object is required');
  }
  if (typeof options.throwOnFailure !== 'boolean') {
    throw new Error(
      'hawk-fxa-token: options.throwOnFailure (boolean) is required'
    );
  }
  if (!options.statsd) {
    throw new Error('hawk-fxa-token: options.statsd is required');
  }
  if (!options.kind) {
    throw new Error('hawk-fxa-token: options.kind is required');
  }
}

/**
 * Authentication strategy for Hawk-shaped FxA token headers. Verifies the
 * scheme is `Hawk`, parses the `id=`, and looks up the credential.
 *
 * All three options are required (no implicit defaults) so callers decide
 * explicitly per registration:
 *   - `throwOnFailure` — true for single-strategy routes, false for
 *     multi-strategy chains where Hapi must fall through to the next.
 *   - `statsd` + `kind` — drive the
 *     `auth.strategy.used{scheme=hawk,kind=<kind>,path=<path>}` metric that
 *     tracks the Hawk -> Bearer migration; required so a registration cannot
 *     silently disappear from the dashboard.
 *
 * All failure modes carry `errno=110` ("Token not found") so a final 401
 * in a multi-strategy chain matches the single-strategy response shape.
 *
 * @param {Function} getCredentialsFunc - id lookup, returns token or null
 * @param {{ throwOnFailure: boolean, statsd: object, kind: string }} options
 */
function strategy(getCredentialsFunc, options) {
  requireOptions(options);
  const { throwOnFailure, statsd, kind } = options;

  const tokenNotFoundError = () => {
    const error = AppError.unauthorized('Token not found');
    error.isMissing = true;
    return error;
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
      `scheme:hawk`,
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

        if (auth.toLowerCase().indexOf('hawk') > -1) {
          const parsedHeader = parseAuthorizationHeader(auth);
          let token;
          try {
            token = await getCredentialsFunc(parsedHeader.id);
          } catch (_) {
            // empty token case handled below
          }

          if (!token) {
            return failAuth();
          }

          recordUsed(req);
          return h.authenticated({ credentials: token });
        }

        // Header present but not Hawk (e.g. `Bearer fxs_…` from a migrated
        // client, or `Bearer <refresh-hex>`). Single-strategy routes still
        // 401; multi-strategy chains fall through to the next strategy.
        return failAuth();
      },
      payload: async function (req, h) {
        // Since we skip Hawk header validation, we don't need to perform payload validation either...
        // unless the route requires it.
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
  parseAuthorizationHeader,
};
