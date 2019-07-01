/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!tdd',
  'intern/chai!assert',
  'tests/addons/environment',
], function(tdd, assert, Environment) {
  with (tdd) {
    suite('tokenCodes', function() {
      var account;
      var accountHelper;
      var respond;
      var client;
      var mail;
      var RequestMocks;
      var env = new Environment();

      beforeEach(function() {
        env = new Environment();
        accountHelper = env.accountHelper;
        respond = env.respond;
        client = env.client;
        mail = env.mail;
        RequestMocks = env.RequestMocks;
        return accountHelper
          .newVerifiedAccount({ username: 'confirm.' + Date.now() })
          .then(function(newAccount) {
            account = newAccount;
          });
      });

      if (env.useRemoteServer) {
        // This test is intended to run against a local auth-server. To test
        // against a mock auth-server would be pointless for this assertion.
        test('verify session with invalid tokenCode', function() {
          var opts = { verificationMethod: 'email-2fa', keys: true };
          return respond(
            client.signIn(account.input.email, account.input.password, opts),
            RequestMocks.signInWithVerificationMethodEmail2faResponse
          )
            .then(function(res) {
              assert.equal(
                res.verificationMethod,
                'email-2fa',
                'should return correct verificationMethod'
              );
              assert.equal(
                res.verificationReason,
                'login',
                'should return correct verificationReason'
              );
              return respond(
                mail.wait(account.input.user, 3),
                RequestMocks.signInWithVerificationMethodEmail2faCode
              );
            })
            .then(function(emails) {
              // should contain token code
              var code = emails[2].headers['x-signin-verify-code'];
              code = code === '000000' ? '000001' : '000000';
              return client.verifyTokenCode(
                account.signIn.sessionToken,
                account.signIn.uid,
                code
              );
            })
            .then(
              function() {
                assert.fail('should reject if tokenCode is invalid');
              },
              function(err) {
                assert.ok(err, 'should return an error');
                assert.equal(err.code, 400, 'should return a 400 response');
                assert.equal(err.errno, 152, 'should return errno 152');
              }
            );
        });
      }

      test('#verify session with valid tokenCode', function() {
        var code;
        var opts = { verificationMethod: 'email-2fa', keys: true };
        return respond(
          client.signIn(account.input.email, account.input.password, opts),
          RequestMocks.signInWithVerificationMethodEmail2faResponse
        )
          .then(function(res) {
            assert.equal(
              res.verificationMethod,
              'email-2fa',
              'should return correct verificationMethod'
            );
            assert.equal(
              res.verificationReason,
              'login',
              'should return correct verificationReason'
            );
            return respond(
              mail.wait(account.input.user, 3),
              RequestMocks.signInWithVerificationMethodEmail2faCode
            );
          })
          .then(function(emails) {
            // should contain token code
            code = emails[2].headers['x-signin-verify-code'];
            assert.ok(code, 'code is returned');
            return respond(
              client.verifyTokenCode(
                account.signIn.sessionToken,
                account.signIn.uid,
                code
              ),
              RequestMocks.sessionVerifyTokenCodeSuccess
            );
          }, assert.notOk)
          .then(function(res) {
            assert.ok(res, 'res is ok');
          }, assert.notOk);
      });
    });
  }
});
