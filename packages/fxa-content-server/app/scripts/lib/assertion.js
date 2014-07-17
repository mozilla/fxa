/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'lib/promise',
  'vendor/jwcrypto',
  'lib/fxa-client'
],
function (P, jwcrypto, FxaClient) {
  var client = new FxaClient();
  var CERT_DURATION_MS = 1000 * 60 * 60 * 6; // 6hrs
  var ASSERTION_DURATION_MS = 1000 * 60 * 5; // 5mins

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
        return P(true); /*jshint ignore:line*/
      }
    } catch(e) {
      // some browsers blow up when trying to query window.crypto.
    }

    // wah wah, we need to get entropy from the server.
    return client.getRandomBytes()
        .then(function(bytes) {
          jwcrypto.addEntropy(bytes);
        });
  }

  function generateKeyPair() {
    return ensureCryptoIsSeeded()
      .then(function() {
        var d = P.defer();
        // for DSA-128 reasons, see http://goo.gl/uAjE41
        jwcrypto.generateKeypair({
          algorithm: 'DS',
          keysize: 128
        }, function (err, keypair) {
          if (err) {
            return d.reject(err);
          }
          d.resolve(keypair);
        });
        return d.promise;
      });
  }

  function certificate(audience) {
    //TODO: check for a valid cert in localStorage first?
    return generateKeyPair().then(function (kp) {
      // while certSign is going over the wire, we can also sign the
      // assertion here on the machine
      return P.all([
        client.certificateSign(kp.publicKey.toSimpleObject(), CERT_DURATION_MS),
        assertion(kp.secretKey, audience)
      ]);
    });
  }

  function assertion(secretKey, audience) {
    var d = P.defer();
    jwcrypto.assertion.sign(jwcrypto, {}, {
      audience: audience,
      expiresAt: Date.now() + ASSERTION_DURATION_MS
    }, secretKey, function (err, ass) {
      if (err) {
        return d.reject(err);
      }
      d.resolve(ass);
    });
    return d.promise;
  }

  function bundle(audience) {
    return certificate(audience).spread(function (cert, ass) {
      return jwcrypto.cert.bundle([cert.cert], ass);
    });
  }

  bundle.generate = bundle;

  return bundle;

});

