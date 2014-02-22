/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!tdd',
  'intern/chai!assert',
  'tests/addons/environment'
], function (tdd, assert, Environment) {

  with (tdd) {
    suite('recoveryEmail', function () {
      var accountHelper;
      var respond;
      var mail;
      var client;
      var RequestMocks;
      var ErrorMocks;

      beforeEach(function () {
        var env = new Environment();
        accountHelper = env.accountHelper;
        respond = env.respond;
        mail = env.mail;
        client = env.client;
        RequestMocks = env.RequestMocks;
        ErrorMocks = env.ErrorMocks;
      });

      test('#recoveryEmailResendCode', function () {
        var user;

        return accountHelper.newUnverifiedAccount()
          .then(function (account) {
            user = account.input.user;

            return respond(client.recoveryEmailResendCode(account.signIn.sessionToken), RequestMocks.recoveryEmailResendCode)
          })
          .then(
          function(res) {
            assert.ok(res);

            return respond(mail.wait(user, 2), RequestMocks.resetMail);
          })
          .then(
            function (emails) {
              // second email, the code is resent.
              var code = emails[1].html.match(/code=([A-Za-z0-9]+)/)[1];
              assert.ok(code, "code is returned");
            },
            assert.notOk
          );
      });

      test('#recoveryEmailResendCode with service and redirectTo', function () {
        var user;
        var opts = {
          service: 'sync',
          redirectTo: 'https://sync.firefox.com/after_reset'
        };

        return accountHelper.newUnverifiedAccount()
          .then(function (account) {
            user = account.input.user;

            return respond(client.recoveryEmailResendCode(account.signIn.sessionToken, opts), RequestMocks.recoveryEmailResendCode)
          })
          .then(
          function(res) {
            assert.ok(res);

            return respond(mail.wait(user, 2), RequestMocks.resetMailWithServiceAndRedirect);
          })
          .then(
          function (emails) {
            // second email, the code is resent.
            var code = emails[1].html.match(/code=([A-Za-z0-9]+)/);
            assert.ok(code, 'code found');
            var service = emails[1].html.match(/service=([A-Za-z0-9]+)/);
            assert.ok(service, 'service found');
            var redirectTo = emails[1].html.match(/redirectTo=([A-Za-z0-9]+)/);
            assert.ok(redirectTo, 'redirectTo found');

            assert.ok(code[1], 'code is returned');
            assert.equal(service[1], 'sync', 'service is returned');
            assert.equal(redirectTo[1], 'http', 'redirectTo is returned');
          },
          assert.notOk
        );
      });

    });
  }
});
