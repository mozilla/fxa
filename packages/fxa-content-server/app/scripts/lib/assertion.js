/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var jwcrypto = require('vendor/jwcrypto');
  var P = require('lib/promise');

  var CERT_DURATION_MS = 1000 * 60 * 60 * 6; // 6hrs
  var ASSERTION_DURATION_MS = 1000 * 3600 * 24 * 365 * 25; // 25 years

  function ensureCryptoIsSeeded() {
    // The jwcrypto RNG needs to be seeded with entropy. If the browser
    // supports window.crypto.getRandomValues, it will fetch its entropy
    // from there, otherwise it collects entropy from the user's mouse
    // movements. In older browsers that do not support crypto.getRandomValues,
    // the tests timeout waiting for entropy, which is not awesome. If
    // the browser does not support crypto.getRandomValues, go collect
    // entropy from the server and seed the RNG.

    // browser has native crypto, no need to fetch entropy from the server.
    try {
      if (window.crypto && window.crypto.getRandomValues) {
        return P(true);
      }
    } catch(e) {
      // some browsers blow up when trying to query window.crypto.
    }

    // wah wah, we need to get entropy from the server.
    return this._fxaClient.getRandomBytes()
        .then(function (bytes) {
          jwcrypto.addEntropy(bytes);
        });
  }

  function generateKeyPair() {
    return ensureCryptoIsSeeded.call(this)
      .then(function () {
        var genKeypair = P.denodeify(jwcrypto.generateKeypair);
        // for DSA-128 reasons, see http://goo.gl/uAjE41
        return genKeypair({
          algorithm: 'DS',
          keysize: 128
        });
      });
  }


  function certificate(audience, sessionToken) {
    //TODO: check for a valid cert in localStorage first?
    var self = this;
    return generateKeyPair.call(self).then(function (kp) {
      // while certSign is going over the wire, we can also sign the
      // assertion here on the machine
      return P.all([
        self._fxaClient.certificateSign(kp.publicKey.toSimpleObject(), CERT_DURATION_MS, sessionToken),
        assertion(kp.secretKey, audience)
      ]);
    });
  }

  function assertion(secretKey, audience) {
    var createAssertion = P.denodeify(jwcrypto.assertion.sign);

    return createAssertion(jwcrypto, {}, {
      audience: audience,
      expiresAt: Date.now() + ASSERTION_DURATION_MS
    }, secretKey);
  }

  function bundle(sessionToken, audience) {
    return certificate.call(this, audience || this._audience, sessionToken).spread(function (cert, ass) {
      return jwcrypto.cert.bundle([cert.cert], ass);
    });
  }

  function Assertion(options) {
    options = options || {};
    this._fxaClient = options.fxaClient;
    this._audience = options.audience;
  }

  Assertion.prototype = {
    generate: bundle
  };

  module.exports = Assertion;
});
