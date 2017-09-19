/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const Duration = require('duration');
  const P = require('./promise');
  const requireOnDemand = require('./require-on-demand');

  const CERT_DURATION_MS =  new Duration('6h').milliseconds();
  const ASSERTION_DURATION_MS = new Duration('52w').milliseconds() * 25; //25 years

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
    } catch (e) {
      // some browsers blow up when trying to query window.crypto.
    }

    // wah wah, we need to get entropy from the server.
    return this._fxaClient.getRandomBytes()
      .then((bytes) => {
        this._jwcrypto.addEntropy(bytes);
      });
  }

  function generateKeyPair() {
    return ensureCryptoIsSeeded.call(this)
      .then(() => {
        const genKeypair = P.denodeify(this._jwcrypto.generateKeypair);
        // for DSA-128 reasons, see http://goo.gl/uAjE41
        return genKeypair({
          algorithm: 'DS',
          keysize: 128
        });
      });
  }


  function certificate(audience, sessionToken, service) {
    //TODO: check for a valid cert in localStorage first?
    return generateKeyPair.call(this)
      .then((kp) => {
        // while certSign is going over the wire, we can also sign the
        // assertion here on the machine
        return P.all([
          this._fxaClient.certificateSign(
            kp.publicKey.toSimpleObject(), CERT_DURATION_MS, sessionToken, service),
          assertion(this._jwcrypto, kp.secretKey, audience)
        ]);
      });
  }

  function assertion(jwcrypto, secretKey, audience) {
    const createAssertion = P.denodeify(jwcrypto.assertion.sign);

    return createAssertion(jwcrypto, {}, {
      audience: audience,
      expiresAt: Date.now() + ASSERTION_DURATION_MS
    }, secretKey);
  }

  function bundle(sessionToken, audience, service) {
    return requireOnDemand('jwcrypto')
      .then((jwcrypto) => {
        this._jwcrypto = jwcrypto;
        return certificate.call(this, audience || this._audience, sessionToken, service);
      })
      .spread((cert, ass) => {
        return this._jwcrypto.cert.bundle([cert.cert], ass);
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
