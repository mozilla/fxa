/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!tdd',
  'intern/chai!assert',
  'tests/addons/environment',
], function(tdd, assert, Environment) {
  var user2;
  var user2Email;

  with (tdd) {
    suite('emails', function() {
      var accountHelper;
      var respond;
      var mail;
      var client;
      var RequestMocks;
      var account;

      beforeEach(function() {
        var env = new Environment();
        accountHelper = env.accountHelper;
        respond = env.respond;
        mail = env.mail;
        client = env.client;
        RequestMocks = env.RequestMocks;

        user2 = 'anotherEmail' + new Date().getTime();
        user2Email = user2 + '@restmail.net';
      });

      function recoveryEmailCreate() {
        return accountHelper.newVerifiedAccount().then(function(res) {
          account = res;
          return respond(
            client.recoveryEmailCreate(account.signIn.sessionToken, user2Email),
            RequestMocks.recoveryEmailCreate
          );
        }, handleError);
      }

      function handleError(err) {
        console.log(err);
        assert.notOk();
      }

      test('#recoveryEmailCreate', function() {
        return recoveryEmailCreate().then(function(res) {
          assert.ok(res);
        }, handleError);
      });

      test('#recoveryEmails', function() {
        return recoveryEmailCreate()
          .then(function(res) {
            assert.ok(res);
            return respond(
              client.recoveryEmails(account.signIn.sessionToken),
              RequestMocks.recoveryEmailsUnverified
            );
          }, handleError)
          .then(function(res) {
            assert.ok(res);
            assert.equal(res.length, 2, 'returned two emails');
            assert.equal(res[1].verified, false, 'returned not verified');
          }, handleError);
      });

      test('#verifyCode', function() {
        return recoveryEmailCreate()
          .then(function(res) {
            assert.ok(res);

            return respond(
              mail.wait(user2, 1),
              RequestMocks.mailUnverifiedEmail
            );
          }, handleError)
          .then(function(emails) {
            var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];

            return respond(
              client.verifyCode(account.signIn.uid, code, {
                type: 'secondary',
              }),
              RequestMocks.verifyCode
            );
          })
          .then(function(res) {
            assert.ok(res);

            return respond(
              client.recoveryEmails(account.signIn.sessionToken),
              RequestMocks.recoveryEmailsVerified
            );
          }, handleError)
          .then(function(res) {
            assert.ok(res);
            assert.equal(res.length, 2, 'returned one email');
            assert.equal(res[1].verified, true, 'returned not verified');
          }, handleError);
      });

      test('#recoveryEmailDestroy', function() {
        return recoveryEmailCreate()
          .then(function(res) {
            assert.ok(res);

            return respond(
              client.recoveryEmails(account.signIn.sessionToken),
              RequestMocks.recoveryEmailsUnverified
            );
          }, handleError)
          .then(function(res) {
            assert.ok(res);
            assert.equal(res.length, 2, 'returned two email');
            assert.equal(res[1].verified, false, 'returned not verified');

            return respond(
              client.recoveryEmailDestroy(
                account.signIn.sessionToken,
                user2Email
              ),
              RequestMocks.recoveryEmailDestroy
            );
          }, handleError)
          .then(function(res) {
            assert.ok(res);

            return respond(
              client.recoveryEmails(account.signIn.sessionToken),
              RequestMocks.recoveryEmails
            );
          }, handleError)
          .then(function(res) {
            assert.ok(res);
            assert.equal(res.length, 1, 'returned one email');
          }, handleError);
      });

      test('#recoveryEmailSetPrimaryEmail', function() {
        return recoveryEmailCreate()
          .then(function(res) {
            assert.ok(res);

            return respond(
              mail.wait(user2, 1),
              RequestMocks.mailUnverifiedEmail
            );
          }, handleError)
          .then(function(emails) {
            var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];

            return respond(
              client.verifyCode(account.signIn.uid, code, {
                type: 'secondary',
              }),
              RequestMocks.verifyCode
            );
          })
          .then(function(res) {
            assert.ok(res);

            return respond(
              client.recoveryEmailSetPrimaryEmail(
                account.signIn.sessionToken,
                user2Email
              ),
              RequestMocks.recoveryEmailSetPrimaryEmail
            );
          }, handleError)
          .then(function(res) {
            assert.ok(res);

            return respond(
              client.recoveryEmails(account.signIn.sessionToken),
              RequestMocks.recoveryEmailsSetPrimaryVerified
            );
          }, handleError)
          .then(function(res) {
            assert.ok(res);
            assert.equal(res.length, 2, 'returned two emails');

            assert.equal(
              true,
              res[0].email.indexOf('anotherEmail') > -1,
              'returned correct primary email'
            );
            assert.equal(res[0].verified, true, 'returned verified');
            assert.equal(res[0].isPrimary, true, 'returned isPrimary true');

            assert.equal(res[1].verified, true, 'returned verified');
            assert.equal(res[1].isPrimary, false, 'returned isPrimary false');
          }, handleError);
      });
    });
  }
});
