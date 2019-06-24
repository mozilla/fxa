/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!tdd',
  'intern/chai!assert',
  'sjcl',
  'client/lib/credentials',
  'tests/addons/environment',
], function(tdd, assert, sjcl, credentials, Environment) {
  with (tdd) {
    suite('passwordChange', function() {
      var accountHelper;
      var respond;
      var mail;
      var client;
      var RequestMocks;
      var ErrorMocks;
      var requests;

      beforeEach(function() {
        var env = new Environment();
        accountHelper = env.accountHelper;
        respond = env.respond;
        mail = env.mail;
        client = env.client;
        RequestMocks = env.RequestMocks;
        ErrorMocks = env.ErrorMocks;
        requests = env.requests;
      });

      test('#basic', function() {
        var user = 'test7' + new Date().getTime();
        var email = user + '@restmail.net';
        var password = 'iliketurtles';
        var newPassword = 'ilikefoxes';
        var kB;
        var newUnwrapBKey;
        var oldCreds;
        var uid;
        var account;

        // newUnwrapBKey from email+newpassword. The submitted newWrapKB
        // should equal (kB XOR newUnwrapBKey). This way we don't need to
        // know what the server will return for wrapKB: handy, since
        // sometimes we're using a mock (with a fixed response), but
        // sometimes we're using a real server (which randomly creates
        // wrapKB)

        return credentials
          .setup(email, newPassword)
          .then(function(newCreds) {
            newUnwrapBKey = sjcl.codec.hex.fromBits(newCreds.unwrapBKey);
            return respond(client.signUp(email, password), RequestMocks.signUp);
          })
          .then(function(result) {
            uid = result.uid;

            return respond(mail.wait(user), RequestMocks.mail);
          })
          .then(function(emails) {
            var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];

            return respond(
              client.verifyCode(uid, code),
              RequestMocks.verifyCode
            );
          })
          .then(function() {
            return respond(
              client.signIn(email, password, { keys: true }),
              RequestMocks.signInWithKeys
            );
          })
          .then(function(result) {
            account = result;
          })
          .then(function() {
            return respond(
              client.accountKeys(account.keyFetchToken, account.unwrapBKey),
              RequestMocks.accountKeys
            );
          })
          .then(function(keys) {
            kB = keys.kB;
          })
          .then(function() {
            return respond(
              client._passwordChangeStart(email, password),
              RequestMocks.passwordChangeStart
            );
          })
          .then(function(credentials) {
            oldCreds = credentials;
            assert.equal(credentials.emailToHashWith, email);

            return respond(
              client._passwordChangeKeys(oldCreds),
              RequestMocks.accountKeys
            );
          })
          .then(function(keys) {
            return respond(
              client._passwordChangeFinish(email, newPassword, oldCreds, keys, {
                keys: false,
              }),
              RequestMocks.passwordChangeFinish
            );
          })
          .then(function(result) {
            // currently only available for mocked requests (issue #103)
            if (requests) {
              var req = requests[requests.length - 1];
              var args = JSON.parse(req.requestBody);
              var expectedNewWrapKB = sjcl.codec.hex.fromBits(
                credentials.xor(
                  sjcl.codec.hex.toBits(kB),
                  sjcl.codec.hex.toBits(newUnwrapBKey)
                )
              );
              assert.equal(args.wrapKb, expectedNewWrapKB);
            }
            assert.notProperty(result, 'keyFetchToken');

            return respond(
              client.signIn(email, newPassword),
              RequestMocks.signIn
            );
          })
          .then(
            function(res) {
              assert.property(res, 'sessionToken');
            },
            function(err) {
              throw err;
            }
          );
      });

      test('#keys', function() {
        var user = 'test7' + new Date().getTime();
        var email = user + '@restmail.net';
        var password = 'iliketurtles';
        var newPassword = 'ilikefoxes';
        var kB;
        var newUnwrapBKey;
        var oldCreds;
        var sessionToken;
        var uid;
        var account;

        // newUnwrapBKey from email+newpassword. The submitted newWrapKB
        // should equal (kB XOR newUnwrapBKey). This way we don't need to
        // know what the server will return for wrapKB: handy, since
        // sometimes we're using a mock (with a fixed response), but
        // sometimes we're using a real server (which randomly creates
        // wrapKB)

        return credentials
          .setup(email, newPassword)
          .then(function(newCreds) {
            newUnwrapBKey = sjcl.codec.hex.fromBits(newCreds.unwrapBKey);
            return respond(client.signUp(email, password), RequestMocks.signUp);
          })
          .then(function(result) {
            uid = result.uid;

            return respond(mail.wait(user), RequestMocks.mail);
          })
          .then(function(emails) {
            var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];

            return respond(
              client.verifyCode(uid, code),
              RequestMocks.verifyCode
            );
          })
          .then(function() {
            return respond(
              client.signIn(email, password, { keys: true }),
              RequestMocks.signInWithKeys
            );
          })
          .then(function(result) {
            sessionToken = result.sessionToken;
            account = result;
          })
          .then(function() {
            return respond(
              client.accountKeys(account.keyFetchToken, account.unwrapBKey),
              RequestMocks.accountKeys
            );
          })
          .then(function(keys) {
            kB = keys.kB;
          })
          .then(function() {
            return respond(
              client._passwordChangeStart(email, password),
              RequestMocks.passwordChangeStart
            );
          })
          .then(function(credentials) {
            oldCreds = credentials;
            assert.equal(credentials.emailToHashWith, email);

            return respond(
              client._passwordChangeKeys(oldCreds),
              RequestMocks.accountKeys
            );
          })
          .then(function(keys) {
            return respond(
              client._passwordChangeFinish(email, newPassword, oldCreds, keys, {
                keys: true,
                sessionToken: sessionToken,
              }),
              RequestMocks.passwordChangeFinishKeys
            );
          })
          .then(function(result) {
            // currently only available for mocked requests (issue #103)
            if (requests) {
              var req = requests[requests.length - 1];
              var args = JSON.parse(req.requestBody);
              var expectedNewWrapKB = sjcl.codec.hex.fromBits(
                credentials.xor(
                  sjcl.codec.hex.toBits(kB),
                  sjcl.codec.hex.toBits(newUnwrapBKey)
                )
              );
              assert.equal(args.wrapKb, expectedNewWrapKB);
            }
            assert.property(result, 'sessionToken');
            assert.property(result, 'keyFetchToken');
            assert.property(result, 'unwrapBKey');
            assert.isTrue(result.verified);

            return respond(
              client.signIn(email, newPassword),
              RequestMocks.signIn
            );
          })
          .then(
            function(res) {
              assert.property(res, 'sessionToken');
            },
            function(err) {
              throw err;
            }
          );
      });

      test('#with incorrect case', function() {
        var newPassword = 'ilikefoxes';
        var account;
        var oldCreds;

        return accountHelper
          .newVerifiedAccount()
          .then(function(acc) {
            account = acc;
            var incorrectCaseEmail =
              account.input.email.charAt(0).toUpperCase() +
              account.input.email.slice(1);

            return respond(
              client._passwordChangeStart(
                incorrectCaseEmail,
                account.input.password
              ),
              RequestMocks.passwordChangeStart
            );
          })
          .then(function(credentials) {
            oldCreds = credentials;

            return respond(
              client._passwordChangeKeys(oldCreds),
              RequestMocks.accountKeys
            );
          })
          .then(function(keys) {
            return respond(
              client._passwordChangeFinish(
                account.input.email,
                newPassword,
                oldCreds,
                keys
              ),
              RequestMocks.passwordChangeFinish
            );
          })
          .then(function(result) {
            assert.ok(result, '{}');

            return respond(
              client.signIn(account.input.email, newPassword),
              RequestMocks.signIn
            );
          })
          .then(
            function(res) {
              assert.property(res, 'sessionToken');
            },
            function(err) {
              throw err;
            }
          );
      });

      test('#with incorrect case with skipCaseError', function() {
        var account;

        return accountHelper
          .newVerifiedAccount()
          .then(function(acc) {
            account = acc;
            var incorrectCaseEmail =
              account.input.email.charAt(0).toUpperCase() +
              account.input.email.slice(1);

            return respond(
              client._passwordChangeStart(
                incorrectCaseEmail,
                account.input.password,
                { skipCaseError: true }
              ),
              ErrorMocks.incorrectEmailCase
            );
          })
          .then(
            function() {
              assert.fail();
            },
            function(res) {
              assert.equal(res.code, 400);
              assert.equal(res.errno, 120);
            }
          );
      });

      /**
       * Changing the Password failure
       */
      test('#changeFailure', function() {
        var user = 'test8' + new Date().getTime();
        var email = user + '@restmail.net';
        var password = 'iliketurtles';
        var newPassword = 'ilikefoxes';
        var wrongPassword = '12345678';
        var uid;
        var oldCreds;

        return respond(client.signUp(email, password), RequestMocks.signUp)
          .then(function(result) {
            uid = result.uid;

            return respond(mail.wait(user), RequestMocks.mail);
          })
          .then(function(emails) {
            var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];

            return respond(
              client.verifyCode(uid, code),
              RequestMocks.verifyCode
            );
          })
          .then(function() {
            return respond(
              client._passwordChangeStart(email, password),
              RequestMocks.passwordChangeStart
            );
          })
          .then(function(credentials) {
            oldCreds = credentials;
            assert.equal(credentials.emailToHashWith, email);
            return respond(
              client._passwordChangeKeys(oldCreds),
              RequestMocks.accountKeys
            );
          })
          .then(function(keys) {
            return respond(
              client._passwordChangeFinish(email, newPassword, oldCreds, keys),
              RequestMocks.passwordChangeFinish
            );
          })
          .then(function(result) {
            assert.ok(result);

            return respond(
              client.signIn(email, wrongPassword),
              ErrorMocks.accountIncorrectPassword
            );
          })
          .then(
            function() {
              assert.fail();
            },
            function(error) {
              assert.ok(error);
              assert.equal(
                error.message,
                'Incorrect password',
                '== Password is incorrect'
              );
              assert.equal(error.code, 400, '== Correct status code');
            }
          );
      });
    });
  }
});
