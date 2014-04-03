/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'p-promise',
  'vendor/jwcrypto',
  'lib/fxa-client'
],
function (P, jwcrypto, FxaClient) {

  var client = new FxaClient();
  // cert takes duration in seconds, assertion takes milliseconds. O_o
  var CERT_DURATION_S = 60 * 60 * 6; // 6hrs
  var ASSERTION_DURATION_MS = 1000 * 60 * 5; // 5mins

  function keyPair() {
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
  }

  function certificate(audience) {
    //TODO: check for a valid cert in localStorage first?
    return keyPair().then(function (kp) {
      // while certSign is going over the wire, we can also sign the
      // assertion here on the machine
      return P.all(
        client.certificateSign(kp.publicKey.toSimpleObject(), CERT_DURATION_S),
        assertion(kp.secretKey, audience)
      );
    });
  }

  function assertion(secretKey, audience) {
    var d = P.defer();
    jwcrypto.assertion.sign({}, {
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
      return jwcrypto.cert.bundle([cert], ass);
    });
  }

  bundle.generate = bundle;

  return bundle;

});

