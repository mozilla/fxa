/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


const AppError = require('./error');
const config = require('./config');
const logger = require('./logging')('assertion');
const P = require('./promise');

const HEX_STRING = /^[0-9a-f]+$/;
const AUDIENCE = config.get('publicUrl');

const request = require('request').defaults({
  url: config.get('browserid.verificationUrl'),
  pool: {
    maxSockets: config.get('browserid.maxSockets')
  }
});

function unb64(text) {
  return Buffer(text, 'base64').toString('utf8');
}

function Assertion(assertion) {
  this.assertion = assertion;
}

Assertion.prototype.toJSON = function() {
  var parts = this.assertion.split('.');
  var ass = JSON.parse(unb64(parts[1]));
  ass.pubkey = ass.publicKey = ass['public-key'] = undefined;
  try {
    return {
      header: JSON.parse(unb64(parts[0])),
      assertion: ass,
      cert: JSON.parse(unb64(parts[3]))
    };
  } catch (ex) {
    return ex;
  }
};

module.exports = function verifyAssertion(assertion) {
  logger.verbose('assertion', new Assertion(assertion));
  var d = P.defer();
  var opts = {
    json: {
      assertion: assertion,
      audience: AUDIENCE
    }
  };
  request.post(opts, function(err, res, body) {
    if (err) {
      logger.error('verify.error', err);
      return d.reject(err);
    }

    function error(msg, val) {
      logger.info('invalidAssertion', {
        msg: msg,
        val: val,
        assertion: assertion
      });
      d.reject(AppError.invalidAssertion());
    }

    if (! body || body.status !== 'okay') {
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
    if (! claims || ! claims['fxa-verifiedEmail']) {
      return error('incorrect idpClaims', claims);
    }

    claims.uid = uid;
    return d.resolve(claims);
  });
  return d.promise;
};
