/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const jsonwebtoken = require('jsonwebtoken');
const P = require('./promise');
const { publicPEM, SIGNING_PEM, SIGNING_KID, SIGNING_ALG } = require('./keys');

const config = require('./config');
const ISSUER = config.get('openid.issuer');

const jwtverify = P.promisify(jsonwebtoken.verify);

/**
 * Sign `claims` using SIGNING_PEM from keys.js, returning a JWT.
 *
 * @param {Object} claims
 * @returns {Promise} resolves with signed JWT when complete
 */
exports.sign = function sign(claims, options) {
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

exports.verify = async function verify(jwt, options = {}) {
  const getKey = (header, callback) => {
    if (options.typ && header.typ !== options.typ) {
      return callback(new Error('Invalid typ'));
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
  });
};
