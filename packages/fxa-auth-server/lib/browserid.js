/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const request = require('request');

const AppError = require('./error');
const config = require('./config');
const logger = require('./logging').getLogger('fxa.assertion');
const P = require('./promise');

const HEX_STRING = /^[0-9a-f]+$/;

module.exports = function verifyAssertion(assertion) {
  var d = P.defer();
  var opts = {
    url: config.get('browserid.verificationUrl'),
    json: {
      assertion: assertion,
      audience: config.get('publicUrl')
    }
  };
  request.post(opts, function(err, res, body) {
    if (err) {
      logger.error('error verifying assertion', err);
      return d.reject(err);
    }

    function error(msg, val) {
      logger.debug('invalidAssertion', msg, val);
      d.reject(AppError.invalidAssertion());
    }

    if (!body || body.status !== 'okay') {
      return error('non-okay response', body);
    }
    var email = body.email;
    var parts = email.split('@');
    var allowedIssuer = config.get('browserid.issuer');
    if (parts.length !== 2 || parts[1] !== allowedIssuer) {
      return error('invalid email', email);
    }
    if (body.issuer !== allowedIssuer) {
      return error('invalid issuer', body.issuer);
    }
    var uid = parts[0];
    //sanity check the uid
    if (uid.length !== 32 && HEX_STRING.test(uid)) {
      return error('uid not a 32-char hex string', uid);
    }

    var claims = body.idpClaims;
    if (!claims || !claims['fxa-verifiedEmail']) {
      return error('incorrect idpClaims', claims);
    }

    claims.uid = uid;
    return d.resolve(claims);
  });
  return d.promise;
};
