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
  const Relier = require('models/reliers/relier');
  const sinon = require('sinon');
  const TestHelpers = require('../../lib/helpers');
  const Url = require('lib/url');

  const AUDIENCE = 'http://123done.org';
  const LONG_LIVED_ASSERTION_DURATION = new Duration('52w').milliseconds() * 25;// 25 years
  const PASSWORD = 'password';
  const SERVICE = '0123456789abcdef';

  let email;
  let client;
  let assertionLibrary;
  let relier;
  let sessionToken;
  let config;

  describe('lib/assertion', () => {
    before(() => {
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

    beforeEach(() => {
      relier = new Relier();
      client = new FxaClientWrapper({
        authServerUrl: config.auth_server_base_url,
        relier: relier
      });
      sinon.spy(client, 'certificateSign');
      assertionLibrary = new Assertion({
        fxaClient: client
      });
      email = ' ' + TestHelpers.createEmail() + ' ';

      return client.signUp(email, PASSWORD, relier, {
        preVerified: true
      }).then(function (result) {
        sessionToken = result.sessionToken;
      });
    });

    describe('validate', () => {
      it('generates a valid assertion', () => {
        let assertion;
        return assertionLibrary.generate(sessionToken, AUDIENCE, SERVICE)
          .then(function (ass) {
            assertion = ass;
            assert.isNotNull(ass, 'Assertion is not null');
            assert.include(ass, '~', 'Result has the ~');
            assert.equal(client.certificateSign.callCount, 1, 'fxaClient.certificateSign was called once');
            const args = client.certificateSign.args[0];
            assert.lengthOf(args, 4, 'fxaClient.certificateSign was passed 4 arguments');
            assert.equal(args[3], SERVICE, 'service was set correctly');
          })
          .then(() => {
            return new Promise((resolve, reject) => {
              const issuer = Url.getOrigin(config.auth_server_base_url);
              $.getJSON(issuer + '/.well-known/browserid', (data) => {
                try {
                  assert.ok(data, 'Received .well-known data');
                  const fxaRootKey = jwcrypto.loadPublicKeyFromObject(data['public-key']);
                  const fullAssertion = jwcrypto.cert.unbundle(assertion);
                  const components = jwcrypto.extractComponents(fullAssertion.certs[0]);
                  const assertionPublicKey = jwcrypto.loadPublicKey(JSON.stringify(components.payload['public-key']));
                  // construct the checkDate based on the assertion's expiry time, not the certificate's
                  const assertionComponents = jwcrypto.extractComponents(fullAssertion.signedAssertion);
                  const checkDate = new Date(assertionComponents.payload.exp - 1);

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
                    fullAssertion.signedAssertion, assertionPublicKey, checkDate, (err, payload, assertionParams) => {
                      if (err) {
                        reject(new Error('assertion is NOT properly signed: ' + err ));
                      } else {
                        assert.ok(payload, 'has payload');
                        assert.ok(assertionParams, 'has assertion params');
                        resolve({
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
                  reject(e);
                }
              }).catch(() => {
                reject(new Error('failed to feth .well-known/browserid'));
              });
            });
          });
      });
    });

    describe('validate with default service', () => {
      it('generates a valid assertion', () => {
        return assertionLibrary.generate(sessionToken, AUDIENCE)
          .then(assertion => {
            assert.isNotNull(assertion, 'Assertion is not null');
            assert.include(assertion, '~', 'Result has the ~');

            assert.equal(client.certificateSign.callCount, 1, 'fxaClient.certificateSign was called once');
            const args = client.certificateSign.args[0];
            assert.lengthOf(args, 4, 'fxaClient.certificateSign was passed 4 arguments');
            assert.isUndefined(args[3], 'service was undefined');
          });
      });
    });
  });
});

