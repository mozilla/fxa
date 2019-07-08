/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var SIGNIN_CODE = '123456-_';
var FLOW_ID =
  '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
var FLOW_BEGIN_TIME = Date.now();

define([
  'intern!tdd',
  'intern/chai!assert',
  'tests/addons/environment',
], function(tdd, assert, Environment) {
  var env = new Environment();

  with (tdd) {
    suite('signinCodes', function() {
      var respond;
      var client;
      var RequestMocks;

      beforeEach(function() {
        env = new Environment();
        respond = env.respond;
        client = env.client;
        RequestMocks = env.RequestMocks;
      });

      if (env.useRemoteServer) {
        // This test is intended to run against a local auth-server. To test
        // against a mock auth-server would be pointless for this assertion.
        test('consumeSigninCode with invalid signinCode', function() {
          return client
            .consumeSigninCode(SIGNIN_CODE, FLOW_ID, FLOW_BEGIN_TIME)
            .then(
              function() {
                assert.fail(
                  'client.consumeSigninCode should reject if signinCode is invalid'
                );
              },
              function(err) {
                assert.ok(
                  err,
                  'client.consumeSigninCode should return an error'
                );
                assert.equal(
                  err.code,
                  400,
                  'client.consumeSigninCode should return a 400 response'
                );
                assert.equal(
                  err.errno,
                  146,
                  'client.consumeSigninCode should return errno 146'
                );
              }
            );
        });
      } else {
        // This test is intended to run against a mock auth-server. To test
        // against a local auth-server, we'd need to know a valid signinCode.
        test('consumeSigninCode', function() {
          return respond(
            client.consumeSigninCode(SIGNIN_CODE, FLOW_ID, FLOW_BEGIN_TIME),
            RequestMocks.consumeSigninCode
          ).then(assert.ok, assert.fail);
        });
      }

      test('consumeSigninCode with missing code', function() {
        return client.consumeSigninCode(null, FLOW_ID, FLOW_BEGIN_TIME).then(
          function() {
            assert.fail(
              'client.consumeSigninCode should reject if code is missing'
            );
          },
          function(err) {
            assert.equal(err.message, 'Missing code');
          }
        );
      });

      test('consumeSigninCode with missing flowId', function() {
        return client
          .consumeSigninCode(SIGNIN_CODE, null, FLOW_BEGIN_TIME)
          .then(
            function() {
              assert.fail(
                'client.consumeSigninCode should reject if flowId is missing'
              );
            },
            function(err) {
              assert.equal(err.message, 'Missing flowId');
            }
          );
      });

      test('consumeSigninCode with missing flowBeginTime', function() {
        return client.consumeSigninCode(SIGNIN_CODE, FLOW_ID, null).then(
          function() {
            assert.fail(
              'client.consumeSigninCode should reject if flowBeginTime is missing'
            );
          },
          function(err) {
            assert.equal(err.message, 'Missing flowBeginTime');
          }
        );
      });
    });
  }
});
