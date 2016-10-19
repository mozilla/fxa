/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const { assert } = require('chai');
  const Assertion = require('lib/assertion');
  const Duration = require('duration');
  const FxaClientWrapper = require('lib/fxa-client');
  const jwcrypto = require('jwcrypto.rs');
  const p = require('lib/promise');
  const Relier = require('models/reliers/relier');
  const TestHelpers = require('../../lib/helpers');
  const Url = require('lib/url');

  const AUDIENCE = 'http://123done.org';
  const LONG_LIVED_ASSERTION_DURATION = new Duration('52w').milliseconds() * 25;// 25 years
  const PASSWORD = 'password';

  let email;
  let client;
  let assertionLibrary;
  let relier;
  let sessionToken;
  let config;

  describe('lib/assertion', function () {
    before(function () {
      // this test generates a real assertion which requires a server signed
      // certificate. To do so, a backing server is needed. Fetch client config
      // to find out the configured auth server so that the certificate can be
      // signed.
      //
      // Date.now() is appended on the end to act as a cache buster.
      // fxa-client-configuration has long lived cache headers which are not
      // awesome for unit testing of client config changes.
      return $.getJSON('/.well-known/fxa-client-configuration?' + Date.now())
        .then((result) => {
          config = result;
        });
    });

    beforeEach(function () {
      relier = new Relier();
      client = new FxaClientWrapper({
        authServerUrl: config.auth_server_base_url,
        relier: relier
      });
      assertionLibrary = new Assertion({
        fxaClient: client
      });
      email = ' ' + TestHelpers.createEmail() + ' ';

      return client.signUp(email, PASSWORD, relier, {
        preVerified: true
      })
      .then(function (result) {
        sessionToken = result.sessionToken;
      });
    });

    describe('validate', function () {
      it('generates a valid assertion', function () {
        var assertion;
        return assertionLibrary.generate(sessionToken, AUDIENCE)
          .then(function (ass) {
            assertion = ass;
            assert.isNotNull(ass, 'Assertion is not null');
            assert.include(ass, '~', 'Result has the ~');
          })
          .then(function () {
            var defer = p.defer();
            const issuer = Url.getOrigin(config.auth_server_base_url);
            $.getJSON(issuer + '/.well-known/browserid', function (data) {
              try {
                assert.ok(data, 'Received .well-known data');
                var fxaRootKey = jwcrypto.loadPublicKeyFromObject(data['public-key']);
                var fullAssertion = jwcrypto.cert.unbundle(assertion);
                var components = jwcrypto.extractComponents(fullAssertion.certs[0]);
                var assertionPublicKey = jwcrypto.loadPublicKey(JSON.stringify(components.payload['public-key']));
                // construct the checkDate based on the assertion's expiry time, not the certificate's
                var assertionComponents = jwcrypto.extractComponents(fullAssertion.signedAssertion);
                var checkDate = new Date(assertionComponents.payload.exp - 1);

                assert.ok(components.payload.iss, 'Issuer exists');
                assert.ok(components.payload.iat, 'Issued date exists');
                assert.ok(components.payload.exp, 'Expire date exists');

                assert.isNumber(components.payload.iat, 'cert lacks an "issued at" (.iat) field');
                assert.isNumber(components.payload.exp, 'cert lacks an "expires" (.exp) field');

                if (components.payload.exp < components.payload.iat) {
                  throw new Error('assertion expires before cert is valid');
                }

                if (components.payload.exp > (components.payload.exp + 5000)) {
                  throw new Error('assertion was likely issued after cert expired');
                }

                if (assertionComponents.payload.exp < (Date.now() + LONG_LIVED_ASSERTION_DURATION - 5000)) {
                  throw new Error('assertion should be long lived');
                }

                jwcrypto.assertion.verify(jwcrypto,
                  fullAssertion.signedAssertion, assertionPublicKey, checkDate,
                  function (err, payload, assertionParams) {
                    if (err) {
                      defer.reject(new Error('assertion is NOT properly signed: ' + err ));
                    } else {
                      assert.ok(payload, 'has payload');
                      assert.ok(assertionParams, 'has assertion params');
                      defer.resolve({
                        assertion: assertion,
                        assertionParams: assertionParams,
                        checkDate: checkDate,
                        fxaRootKey: fxaRootKey,
                        payload: payload
                      });
                    }
                  }
                );

              } catch (e) {
                defer.reject(e);
              }
            })
            .fail(function () {
              defer.reject(new Error('failed to feth .well-known/browserid'));
            });

            return defer.promise;
          });
      });
    });

  });
});

