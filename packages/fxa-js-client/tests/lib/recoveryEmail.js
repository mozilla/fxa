/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!tdd',
  'intern/chai!assert',
  'tests/addons/environment',
], function(tdd, assert, Environment) {
  with (tdd) {
    suite('recoveryEmail', function() {
      var accountHelper;
      var respond;
      var mail;
      var client;
      var RequestMocks;

      beforeEach(function() {
        var env = new Environment();
        accountHelper = env.accountHelper;
        respond = env.respond;
        mail = env.mail;
        client = env.client;
        RequestMocks = env.RequestMocks;
      });

      test('#recoveryEmail - recoveryEmailResendCode', function() {
        var user;

        return accountHelper
          .newUnverifiedAccount()
          .then(function(account) {
            user = account.input.user;

            return respond(
              client.recoveryEmailResendCode(account.signIn.sessionToken),
              RequestMocks.recoveryEmailResendCode
            );
          })
          .then(function(res) {
            assert.ok(res);

            return respond(
              mail.wait(user, 3),
              RequestMocks.resetMailrecoveryEmailResendCode
            );
          })
          .then(function(emails) {
            // second email, the code is resent.
            var code = emails[2].html.match(/code=([A-Za-z0-9]+)/)[1];
            assert.ok(code, 'code is returned');
          }, assert.notOk);
      });

      test('#recoveryEmailResendCode with service, redirectTo, type, style and resume', function() {
        var user;
        var opts = {
          service: 'sync',
          redirectTo: 'https://sync.127.0.0.1/after_reset',
          resume: 'resumejwt',
          style: 'trailhead',
          type: 'upgradeSession',
        };

        return accountHelper
          .newUnverifiedAccount()
          .then(function(account) {
            user = account.input.user;

            return respond(
              client.recoveryEmailResendCode(account.signIn.sessionToken, opts),
              RequestMocks.recoveryEmailResendCode
            );
          })
          .then(function(res) {
            assert.ok(res);

            return respond(
              mail.wait(user, 3),
              RequestMocks.resetMailWithServiceAndRedirectNoSignup
            );
          })
          .then(function(emails) {
            // second email, the code is resent.
            var code = emails[2].html.match(/code=([A-Za-z0-9]+)/);
            assert.ok(code, 'code found');
            var service = emails[2].html.match(/service=([A-Za-z0-9]+)/);
            assert.ok(service, 'service found');
            var redirectTo = emails[2].html.match(/redirectTo=([A-Za-z0-9]+)/);
            assert.ok(redirectTo, 'redirectTo found');
            var resume = emails[2].html.match(/resume=([A-Za-z0-9]+)/);
            assert.ok(resume, 'resume found');
            var style = emails[2].html.match(/style=trailhead/)[0];
            assert.ok(style, 'style found');

            assert.ok(code[1], 'code is returned');
            assert.equal(service[1], 'sync', 'service is returned');
            assert.equal(redirectTo[1], 'https', 'redirectTo is returned');
            assert.equal(resume[1], 'resumejwt', 'resume is returned');
            assert.ok(style, 'style is returned');
          }, assert.notOk);
      });
    });
  }
});
