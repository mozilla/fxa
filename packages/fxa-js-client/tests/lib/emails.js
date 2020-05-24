/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('chai').assert;
const sinon = require('sinon');

var user2;
var user2Email;
const Environment = require('../addons/environment');

describe('emails', function () {
  var accountHelper;
  var respond;
  var mail;
  var client;
  var RequestMocks;
  var account;
  var env;
  var xhr;
  var xhrOpen;
  var xhrSend;

  beforeEach(function () {
    env = new Environment();
    accountHelper = env.accountHelper;
    respond = env.respond;
    mail = env.mail;
    client = env.client;
    RequestMocks = env.RequestMocks;

    user2 = 'anotherEmail' + new Date().getTime();
    user2Email = user2 + '@restmail.net';

    xhr = env.xhr;
    xhrOpen = sinon.spy(xhr.prototype, 'open');
    xhrSend = sinon.spy(xhr.prototype, 'send');
  });

  afterEach(function () {
    xhrOpen.restore();
    xhrSend.restore();
  });

  function recoveryEmailCreate(options = {}) {
    return accountHelper.newVerifiedAccount().then(function (res) {
      account = res;
      return respond(
        client.recoveryEmailCreate(
          account.signIn.sessionToken,
          user2Email,
          options
        ),
        RequestMocks.recoveryEmailCreate
      );
    }, handleError);
  }

  function handleError(err) {
    console.log(err);
    assert.fail();
  }

  it('#recoveryEmailCreate', function () {
    return recoveryEmailCreate().then(function (res) {
      assert.ok(res);
    }, handleError);
  });

  it('#recoveryEmails', function () {
    return recoveryEmailCreate()
      .then(function (res) {
        assert.ok(res);
        return respond(
          client.recoveryEmails(account.signIn.sessionToken),
          RequestMocks.recoveryEmailsUnverified
        );
      }, handleError)
      .then(function (res) {
        assert.ok(res);
        assert.equal(res.length, 2, 'returned two emails');
        assert.equal(res[1].verified, false, 'returned not verified');
      }, handleError);
  });

  it('#verifyCode', function () {
    return recoveryEmailCreate()
      .then(function (res) {
        assert.ok(res);

        return respond(mail.wait(user2, 1), RequestMocks.mailUnverifiedEmail);
      }, handleError)
      .then(function (emails) {
        var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];

        return respond(
          client.verifyCode(account.signIn.uid, code, {
            type: 'secondary',
          }),
          RequestMocks.verifyCode
        );
      })
      .then(function (res) {
        assert.ok(res);

        return respond(
          client.recoveryEmails(account.signIn.sessionToken),
          RequestMocks.recoveryEmailsVerified
        );
      }, handleError)
      .then(function (res) {
        assert.ok(res);
        assert.equal(res.length, 2, 'returned one email');
        assert.equal(res[1].verified, true, 'returned not verified');
      }, handleError);
  });

  it('#recoveryEmailDestroy', function () {
    return recoveryEmailCreate()
      .then(function (res) {
        assert.ok(res);

        return respond(
          client.recoveryEmails(account.signIn.sessionToken),
          RequestMocks.recoveryEmailsUnverified
        );
      }, handleError)
      .then(function (res) {
        assert.ok(res);
        assert.equal(res.length, 2, 'returned two email');
        assert.equal(res[1].verified, false, 'returned not verified');

        return respond(
          client.recoveryEmailDestroy(account.signIn.sessionToken, user2Email),
          RequestMocks.recoveryEmailDestroy
        );
      }, handleError)
      .then(function (res) {
        assert.ok(res);

        return respond(
          client.recoveryEmails(account.signIn.sessionToken),
          RequestMocks.recoveryEmails
        );
      }, handleError)
      .then(function (res) {
        assert.ok(res);
        assert.equal(res.length, 1, 'returned one email');
      }, handleError);
  });

  it('#recoveryEmailSetPrimaryEmail', function () {
    return recoveryEmailCreate()
      .then(function (res) {
        assert.ok(res);

        return respond(mail.wait(user2, 1), RequestMocks.mailUnverifiedEmail);
      }, handleError)
      .then(function (emails) {
        var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];

        return respond(
          client.verifyCode(account.signIn.uid, code, {
            type: 'secondary',
          }),
          RequestMocks.verifyCode
        );
      })
      .then(function (res) {
        assert.ok(res);

        return respond(
          client.recoveryEmailSetPrimaryEmail(
            account.signIn.sessionToken,
            user2Email
          ),
          RequestMocks.recoveryEmailSetPrimaryEmail
        );
      }, handleError)
      .then(function (res) {
        assert.ok(res);

        return respond(
          client.recoveryEmails(account.signIn.sessionToken),
          RequestMocks.recoveryEmailsSetPrimaryVerified
        );
      }, handleError)
      .then(function (res) {
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

  it('#recoveryEmailSecondaryVerifyCode', function () {
    var code;
    return recoveryEmailCreate({
      verificationMethod: 'email-otp',
    })
      .then(function (res) {
        assert.ok(res);

        return respond(mail.wait(user2, 1), RequestMocks.mailUnverifiedEmail);
      }, handleError)
      .then(function (emails) {
        code = emails[0].headers['x-verify-code'];

        return respond(
          client.recoveryEmailSecondaryVerifyCode(
            account.signIn.sessionToken,
            user2Email,
            code,
            {}
          ),
          RequestMocks.verifyCode
        );
      }, handleError)
      .then(function (res) {
        assert.ok(res);

        assert.equal(xhrOpen.args[6][0], 'POST', 'method is correct');
        assert.include(
          xhrOpen.args[6][1],
          '/recovery_email/secondary/verify_code',
          'path is correct'
        );
        var sentData = JSON.parse(xhrSend.args[6][0]);
        assert.equal(Object.keys(sentData).length, 2);
        assert.equal(sentData.code, code, 'code is correct');

        return respond(
          client.recoveryEmails(account.signIn.sessionToken),
          RequestMocks.recoveryEmailsVerified
        );
      }, handleError)
      .then(function (res) {
        assert.ok(res);
        assert.equal(res.length, 2, 'returned one email');
        assert.equal(res[1].verified, true, 'returned verified');
      }, handleError);
  });

  it('#recoveryEmailSecondaryResendCode', function () {
    var code;
    return recoveryEmailCreate({
      verificationMethod: 'email-otp',
    })
      .then(function (res) {
        assert.ok(res);
        return respond(mail.wait(user2, 1), RequestMocks.mailUnverifiedEmail);
      }, handleError)
      .then(function () {
        return respond(
          client.recoveryEmailSecondaryResendCode(
            account.signIn.sessionToken,
            user2Email
          ),
          RequestMocks.verifyCode
        );
      }, handleError)
      .then(function (res) {
        assert.ok(res);

        assert.equal(xhrOpen.args[6][0], 'POST', 'method is correct');
        assert.include(
          xhrOpen.args[6][1],
          '/recovery_email/secondary/resend_code',
          'path is correct'
        );
        var sentData = JSON.parse(xhrSend.args[6][0]);
        assert.equal(Object.keys(sentData).length, 1);
        assert.equal(sentData.email, user2Email, 'email is correct');

        return respond(
          mail.wait(user2, 2),
          RequestMocks.mailUnverifiedEmailResend
        );
      }, handleError)
      .then(function (emails) {
        code = emails[1].headers['x-verify-code'];

        return respond(
          client.recoveryEmailSecondaryVerifyCode(
            account.signIn.sessionToken,
            user2Email,
            code,
            {}
          ),
          RequestMocks.verifyCode
        );
      }, handleError)
      .then(function (res) {
        assert.ok(res);

        return respond(
          client.recoveryEmails(account.signIn.sessionToken),
          RequestMocks.recoveryEmailsVerified
        );
      }, handleError)
      .then(function (res) {
        assert.ok(res);
        assert.equal(res.length, 2, 'returned one email');
        assert.equal(res[1].verified, true, 'returned verified');
      }, handleError);
  });
});
