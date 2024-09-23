/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import jsonwebtoken from 'jsonwebtoken';

import { publicPEM, SIGNING_PEM, SIGNING_KID, SIGNING_ALG } from './keys';
import { config } from '../../config';
const ISSUER = config.get('oauthServer.openid.issuer');

import jwtverifyModule from "util";
const jwtverify = jwtverifyModule.promisify(jsonwebtoken.verify);

/**
 * Sign `claims` using SIGNING_PEM from keys.js, returning a JWT.
 *
 * @param {Object} claims
 * @returns {Promise} resolves with signed JWT when complete
 */
export const sign = function sign(claims, options) {
  return jsonwebtoken.sign(
    {
      // force an issuer to be set for direct calls to .sign,
      // it can be overridden in the passed in claims.
      iss: ISSUER,
      ...claims,
    },
    SIGNING_PEM,
    {
      ...options,
      algorithm: SIGNING_ALG,
      keyid: SIGNING_KID,
    }
  );
};

export const verify = async function verify(jwt, options = {}) {
  const getKey = (header, callback) => {
    if (options.typ) {
      if (normalizeTyp(options.typ) !== normalizeTyp(header.typ)) {
        return callback(new Error('Invalid typ'));
      }
    }

    let signingKey;
    try {
      signingKey = publicPEM(header.kid);
    } catch (e) {
      return callback(new Error('Invalid kid'));
    }

    callback(null, signingKey);
  };

  return jwtverify(jwt, getKey, {
    algorithms: options.algorithms || [SIGNING_ALG],
    json: true,
    // use the default issuer unless one is passed in.
    issuer: options.issuer || ISSUER,
    ignoreExpiration: options.ignoreExpiration,
  });
};

function normalizeTyp(typ) {
  // Ref https://tools.ietf.org/html/rfc7515#section-4.1.9 for the rules.
  if (typ) {
    typ = typ.toLowerCase();
    if (!typ.includes('/')) {
      typ = 'application/' + typ;
    }
  }
  return typ;
}
