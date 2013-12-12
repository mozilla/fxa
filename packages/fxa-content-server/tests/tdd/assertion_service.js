/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!tdd',
  'intern/chai!assert',
  'intern/node_modules/dojo/Deferred',
  'intern/node_modules/dojo/request',
  'intern/order!static/js/gherkin.js',
  'intern/order!static/javascripts/vendor/bidbundle.js',
  'intern/order!static/javascripts/assertion_service.js'
],
function (tdd, assert, Deferred, request, gherkin, bidbundle, AssertionService) {
    'use strict';

    tdd.suite('assertion_service', function () {
      var client;
      var assertionService;
      var serverUrl = 'http://127.0.0.1:9000';
      //var serverUrl = 'https://api-accounts.dev.lcip.org';

      // before the suite starts
      tdd.before(function () {
        var setupDfd = new Deferred();

        var Client = gherkin.Client;
        var email = 'some' + new Date().getTime() + '@example.com';
        var password = '12345678';

        Client
          .create(serverUrl, email, password)
          .then(function (x) {
            client = x;

            return client.login();
          })
          .done(function () {

            setupDfd.resolve();
          });

        return setupDfd.promise;
      });

      tdd.beforeEach(function () {
        assertionService = new AssertionService(client);
      });

      tdd.test('client session check', function () {
        assert.ok(client.sessionToken, 'token', 'Session should have a sessionToken');
      });

      tdd.test('#getAssertion (async)', function () {
        // test will time out after 9 seconds
        var dfd = this.async(9000);

        // dfd.callback resolves the promise as long as no errors are thrown from within the callback function
        assertionService.getAssertion(dfd.callback(function (err, assertion) {
          assert.isNull(err, 'there was no error');
          assert.isNotNull(assertion, 'Assertion is not null');
          assert.isTrue(assertion.indexOf('~') > -1, 'Result has the ~');
        }));
      });

      tdd.test('#generateKeys (async)', function () {
        var dfd = this.async(9000);

        // dfd.callback resolves the promise as long as no errors are thrown from within the callback function
        assertionService.generateKeys(dfd.callback(function (err) {
          assert.isNull(err, 'there was no error');
          assert.ok(assertionService.sk, 'SecretKey exists');
          assert.ok(assertionService.sk.algorithm, 'SecretKey algorithm exists');
          assert.ok(assertionService.sk.keysize, 'SecretKey keysize exists');

          assert.ok(assertionService.pk, 'PublicKey exists');
          assert.ok(assertionService.pk.algorithm, 'PublicKey algorithm exists');
          assert.ok(assertionService.pk.keysize, 'PublicKey keysize exists');
        }));
      });

      tdd.test('#testVerify (async)', function () {
        var dfd = this.async(9000);

        // dfd.callback resolves the promise as long as no errors are thrown from within the callback function
        assertionService.getAssertion(dfd.callback(function (err, assertion) {
          assert.isNull(err, 'there was no error');
          assert.isNotNull(assertion, 'Assertion is not null');
          assert.isTrue(assertion.indexOf('~') > -1, 'Result has the ~');
        }));

      });

      tdd.test('#checkAssertion (async)', function () {
        var dfd = this.async(9000);
        var jwcrypto = require('./lib/jwcrypto');

        assertionService.getAssertion(function (err, assertion) {
          assert.isNull(err, 'there was no error');
          assert.isNotNull(assertion, 'Assertion is not null');
          assert.isTrue(assertion.indexOf('~') > -1, 'Result has the ~');

          request
            .get(serverUrl + '/.well-known/browserid', {
              headers: {
                'X-Requested-With': ''
              }
            })
            .then(
            function (data) {
              assert.ok(data, 'Received .well-known data');

              var rk;
              try {
                rk = JSON.stringify(JSON.parse(data)['public-key']);
              } catch (e) {
                console.log(e);
                dfd.reject(new assert.AssertionError({ message: 'Could not parse public key out of .well-known' }));
              }

              // jwcrypto verification can go wrong
              var fxaRootKey;
              var fullAssertion;
              var components;
              var assertionPublicKey;
              var checkDate;
              try {
                fxaRootKey = jwcrypto.loadPublicKeyFromObject(JSON.parse(rk));
                fullAssertion = jwcrypto.cert.unbundle(assertion);
                components = jwcrypto.extractComponents(fullAssertion.certs[0]);
                assertionPublicKey = jwcrypto.loadPublicKey(JSON.stringify(components.payload['public-key']));

                checkDate = new Date(components.payload.exp - 1);
              } catch (e) {
                dfd.reject(new assert.AssertionError({ message: e }));
              }

              assert.ok(components.payload.iss, 'Issuer exists');
              assert.ok(components.payload.iat, 'Issued date exists');
              assert.ok(components.payload.exp, 'Expire date exists');

              if (typeof components.payload.iat !== 'number') {
                dfd.reject(new assert.AssertionError({ message: 'cert lacks an "issued at" (.iat) field' }));
              }

              if (typeof components.payload.exp !== 'number') {
                dfd.reject(new assert.AssertionError({ message: 'cert lacks an "expires" (.exp) field' }));
              }

              if (components.payload.exp < components.payload.iat) {
                dfd.reject(new assert.AssertionError({ message: 'assertion expires before cert is valid' }));
              }

              if (components.payload.exp > (components.payload.exp + 5000)) {
                dfd.reject(new assert.AssertionError({ message: 'assertion was likely issued after cert expired' }));
              }

              return {
                assertion: assertion,
                fxaRootKey: fxaRootKey,
                fullAssertion: fullAssertion,
                assertionPublicKey: assertionPublicKey,
                checkDate: checkDate
              };

            },
            function (err) {
              dfd.reject();
              assert.fail(err, null, '.well-known request failed');
            }
          )
            .then(
            function (objs) {
              var verifyDeferred = new Deferred();

              jwcrypto.assertion.verify(
                objs.fullAssertion.signedAssertion, objs.assertionPublicKey, objs.checkDate,
                function (err, payload, assertionParams) {
                  if (err) {
                    verifyDeferred.reject(new assert.AssertionError({ message: 'assertion is NOT properly signed: ' + err }));
                  } else {
                    assert.isNull(err, 'Assertion is properly signed');
                    verifyDeferred.resolve({
                      fxaRootKey: objs.fxaRootKey,
                      payload: payload,
                      checkDate: objs.checkDate,
                      assertion: assertion,
                      assertionParams: assertionParams
                    });
                  }
                }
              );

              return verifyDeferred.promise;
            }
          )
            .then(function (objs) {
              var verifyBundleDeferred = new Deferred();

              jwcrypto.cert.verifyBundle(
                objs.assertion,
                objs.checkDate, function (issuer, next) {
                  assert.ok(issuer, 'issuer is okay');
                  assert.isString(issuer, 'Issuer is a string');
                  next(null, objs.fxaRootKey);
                },
                function (err, certParamsArray, payload, assertionParams) {
                  if (err) {
                    dfd.reject(new assert.AssertionError({ message: 'verifyBundle failed.' }));
                  } else {
                    var principal = certParamsArray[certParamsArray.length - 1].certParams.principal;

                    assert.isNull(err, 'bundle *seems* to verify ok');
                    assert.ok(certParamsArray.length, 'bundle length ok');
                    assert.ok(assertionParams.audience, 'bundle audience ok');
                    assert.ok(principal.email.replace(/^.*@/, ''), 'bundle principle ok');
                    dfd.resolve();
                  }
                });

              return verifyBundleDeferred.promise;
            }
          ).otherwise(function (error) { dfd.reject(error); });

        });

        return dfd.promise;
      });

    });
  });
