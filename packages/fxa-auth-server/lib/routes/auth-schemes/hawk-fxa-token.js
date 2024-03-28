/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const AppError = require('../../error');
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

/**
 * This function defines the authentication strategy for `hawk-fxa-token`.
 * This auth strategy supports Hawk token and FxA token (Session, KeyFetch, PasswordForgotToken) for authentication as a Bearer token.
 * This strategy will be used to slowly phase out the usage of Hawk tokens, see https://github.com/mozilla/fxa/blob/main/docs/adr/0022-deprecate-hawk.md
 * @param {Function} getCredentialsFunc - The function to get the credentials.
 * @returns {Function}
 */
function strategy(getCredentialsFunc) {
  return function (server, options) {
    return {
      authenticate: async function (req, h) {
        const auth = req.headers.authorization;

        if (!auth) {
          if (req.auth.mode === 'optional') {
            return h.continue;
          }

          const error = AppError.unauthorized('Token not found');
          error.isMissing = true;
          throw error;
        }

        if (auth.toLowerCase().indexOf('hawk') > -1) {
          // If a Hawk token is found, lets parse it and get the token's id
          const parsedHeader = parseAuthorizationHeader(auth);
          const token = await getCredentialsFunc(parsedHeader.id);

          // If a token isn't found, this means it doesn't exist or expired and
          // was removed from database
          if (!token) {
            const error = AppError.unauthorized('Token not found');
            error.isMissing = true;
            throw error;
          }

          return h.authenticated({
            credentials: token,
          });
        }

        // TODO: Fix in follow up PR, there are conflicts with the refreshToken
        // ref: https://mozilla-hub.atlassian.net/browse/FXA-9392
        // strategy that need to also fixed
        // if (auth.indexOf('Bearer') > -1) {
        //   const tokenId = auth.split(' ')[1];
        //   try {
        //     const token = await getCredentialsFunc(tokenId);
        //     return h.authenticated({
        //       credentials: token,
        //     });
        //   } catch (err) {}
        // }

        const error = AppError.unauthorized('Token not found');
        error.isMissing = true;
        throw error;
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
};
