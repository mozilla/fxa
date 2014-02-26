/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


const AppError = require('./error');
const config = require('./config');
const logger = require('./logging').getLogger('fxa.assertion');
const Promise = require('./promise');
const verify = require('browserid-verify')({
  url: config.get('browserid.verificationUrl')
});

const HEX_STRING = /^[0-9a-f]+$/;

function parseCert(assertion) {
  // format of an assertion is:
  // alg.cert.certSig.assertion.assertionSig
  // we want cert
  return JSON.parse(Buffer(assertion.split('.')[1], 'base64'));
}

module.exports = function verifyAssertion(assertion) {
  var d = Promise.defer();
  verify(assertion, config.get('publicUrl'), function(err, email, res) {
    if (err) {
      logger.error('error verifying assertion', err);
      return d.reject(err);
    }

    if (res && res.status === 'okay') {
      var parts = email.split('@');
      var allowedIssuer = config.get('browserid.issuer');
      if (parts.length === 2 && parts[1] === allowedIssuer) {
        var cert;
        try {
          cert = parseCert(assertion);
        } catch (ex) {
          return d.reject(ex);
        }

        if (cert && cert.iss && cert.iss === allowedIssuer) {
          var uid = parts[0];
          //sanity check the uid
          if (uid.length === 32 && HEX_STRING.test(uid)) {
            return d.resolve(uid);
          }
          logger.verbose('invalidAssertion: uid not a 32-char hex string', uid);
        }
        logger.verbose('invalidAssertion cert', cert);
      }
      logger.verbose('invalidAssertion email', email);
    }
    logger.verbose('invalidAssertion response', res);

    // if we havent returned a resolution yet, INVALID
    d.reject(AppError.invalidAssertion());
  });
  return d.promise;
};
