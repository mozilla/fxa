/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * signJWT/verifyJWT functions for use with server to server JWTs
 */

const util = require('util');
const jsonwebtoken = require('jsonwebtoken');
const verifyJwt = util.promisify(jsonwebtoken.verify);
const signJwt = util.promisify(jsonwebtoken.sign);

exports.signJWT = async function signJWT(
  claims,
  audience,
  issuer,
  key,
  expiresIn = 60
) {
  const opts = {
    algorithm: 'HS256',
    expiresIn,
    audience,
    issuer,
  };

  return signJwt(claims, key, opts);
};

// Verify a JWT assertion.
// Since it's just a symmetric HMAC signature,
// this should be safe and performant enough to do in-process.
exports.verifyJWT = async function verifyJWT(jwt, audience, issuer, keys) {
  const opts = {
    algorithms: ['HS256'],
    audience,
    issuer,
  };
  // To allow for key rotation, we may have
  // several valid shared secret keys in-flight.
  for (const key of keys) {
    try {
      return await verifyJwt(jwt, key, opts);
    } catch (err) {
      // Any error other than 'invalid signature' will not
      // be resolved by trying the remaining keys.
      if (err.message !== 'invalid signature') {
        throw err;
      }
    }
  }
  // None of the keys worked, clearly invalid.
  throw new Error('Invalid jwt');
};
