/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


const AppError = require('./error');
const config = require('./config');
const logger = require('./logging').getLogger('fxa.assertion');
const P = require('./promise');
const verify = require('browserid-verify')({
  url: config.get('browserid.verificationUrl')
});

const HEX_STRING = /^[0-9a-f]+$/;

module.exports = function verifyAssertion(assertion) {
  var d = P.defer();
  verify(assertion, config.get('publicUrl'), function(err, email, res) {
    if (err) {
      logger.error('error verifying assertion', err);
      return d.reject(err);
    }

    function error(msg, val) {
      logger.verbose('invalidAssertion:', msg, val);
      d.reject(AppError.invalidAssertion());
    }

    if (!res || res.status !== 'okay') {
      return error('non-okay response', res);
    }
    var parts = email.split('@');
    var allowedIssuer = config.get('browserid.issuer');
    if (parts.length !== 2 || parts[1] !== allowedIssuer) {
      return error('invalid email', email);
    }
    if (res.issuer !== allowedIssuer) {
      return error('invalid issuer', res.issuer);
    }
    var uid = parts[0];
    //sanity check the uid
    if (uid.length !== 32 && HEX_STRING.test(uid)) {
      return error('uid not a 32-char hex string', uid);
    }

    var claims = res.idpClaims;
    if (!claims || !claims['fxa-verifiedEmail']) {
      return error('incorrect idpClaims', claims);
    }

    claims.uid = uid;
    return d.resolve(claims);
  });
  return d.promise;
};
