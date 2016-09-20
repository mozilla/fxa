/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!tdd',
  'intern/chai!assert',
  'tests/addons/environment'
], function (tdd, assert, Environment) {

  with (tdd) {
    suite('verifyCode', function () {
      var respond;
      var mail;
      var client;
      var RequestMocks;

      beforeEach(function () {
        var env = new Environment();
        respond = env.respond;
        mail = env.mail;
        client = env.client;
        RequestMocks = env.RequestMocks;
      });

      test('#verifyEmail', function () {
        var user = 'test3' + new Date().getTime();
        var email = user + '@restmail.net';
        var password = 'iliketurtles';
        var uid;

        return respond(client.signUp(email, password), RequestMocks.signUp)
          .then(function (result) {
            uid = result.uid;
            assert.ok(uid, 'uid is returned');

            return respond(mail.wait(user), RequestMocks.mail);
          })
          .then(function (emails) {
            var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
            assert.ok(code, 'code is returned');

            return respond(client.verifyCode(uid, code), RequestMocks.verifyCode);
          })
          .then(
            function (result) {
              assert.ok(result);
            },
            assert.notOk
          );
      });

      test('#verifyEmailCheckStatus', function () {
        var user = 'test4' + new Date().getTime();
        var email = user + '@restmail.net';
        var password = 'iliketurtles';
        var uid;
        var sessionToken;

        return respond(client.signUp(email, password), RequestMocks.signUp)
          .then(function (result) {
            uid = result.uid;
            assert.ok(uid, 'uid is returned');

            return respond(client.signIn(email, password), RequestMocks.signIn);
          })
          .then(function (result) {
            assert.ok(result.sessionToken, 'sessionToken is returned');
            sessionToken = result.sessionToken;

            return respond(client.recoveryEmailStatus(sessionToken),
                    RequestMocks.recoveryEmailUnverified);
          })
          .then(function (result) {
            assert.equal(result.verified, false, 'Email should not be verified.');

            return respond(mail.wait(user, 2), RequestMocks.mailUnverifiedSignin);
          })
          .then(function (emails) {
            var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
            assert.ok(code, 'code is returned: ' + code);

            return respond(client.verifyCode(uid, code),
                    RequestMocks.verifyCode);
          })
          .then(function (result) {

            return respond(client.recoveryEmailStatus(sessionToken),
                    RequestMocks.recoveryEmailVerified);
          })
          .then(
            function (result) {
              assert.equal(result.verified, true, 'Email should be verified.');
            },
            assert.notOk
          );
      });

      test('#verifyEmail with service param', function () {
        var user = 'test5' + new Date().getTime();
        var email = user + '@restmail.net';
        var password = 'iliketurtles';
        var uid;

        return respond(client.signUp(email, password), RequestMocks.signUp)
          .then(function (result) {
            uid = result.uid;
            assert.ok(uid, 'uid is returned');

            return respond(mail.wait(user), RequestMocks.mail);
          })
          .then(function (emails) {
            var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
            assert.ok(code, 'code is returned');

            return respond(client.verifyCode(uid, code, { service: 'sync' }),
                    RequestMocks.verifyCode);
          })
          .then(
            function (result) {
              assert.ok(result);
            },
            assert.notOk
          );
      });

      test('#verifyEmail with reminder param', function () {
        var user = 'test6' + new Date().getTime();
        var email = user + '@restmail.net';
        var password = 'iliketurtles';
        var uid;

        return respond(client.signUp(email, password), RequestMocks.signUp)
          .then(function (result) {
            uid = result.uid;
            assert.ok(uid, 'uid is returned');

            return respond(mail.wait(user), RequestMocks.mail);
          })
          .then(function (emails) {
            var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
            assert.ok(code, 'code is returned');

            return respond(client.verifyCode(uid, code, { reminder: 'first' }),
              RequestMocks.verifyCode);
          })
          .then(
            function (result) {
              assert.ok(result);
            },
            assert.notOk
          );
      });
    });
  }
});
