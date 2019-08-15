/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('chai').assert;
const Environment = require('../addons/environment');

const sinon = require('sinon');
describe('session', function() {
  var accountHelper;
  var respond;
  var requests;
  var client;
  var RequestMocks;
  var ErrorMocks;
  var xhr;
  let env;
  let mail;

  beforeEach(function() {
    env = new Environment();
    accountHelper = env.accountHelper;
    respond = env.respond;
    requests = env.requests;
    client = env.client;
    RequestMocks = env.RequestMocks;
    ErrorMocks = env.ErrorMocks;
    xhr = env.xhr;
    sinon.spy(xhr.prototype, 'open');
    sinon.spy(xhr.prototype, 'send');
    mail = env.mail;
  });

  afterEach(function() {
    xhr.prototype.open.restore();
    xhr.prototype.send.restore();
  });

  it('#destroy', function() {
    return accountHelper
      .newVerifiedAccount()
      .then(function(account) {
        return respond(
          client.sessionDestroy(account.signIn.sessionToken),
          RequestMocks.sessionDestroy
        );
      })
      .then(function(res) {
        assert.ok(res, 'got response');
      }, assert.fail);
  });

  it('#status', function() {
    return accountHelper
      .newVerifiedAccount()
      .then(function(account) {
        return respond(
          client.sessionStatus(account.signIn.sessionToken),
          RequestMocks.sessionStatus
        );
      })
      .then(function(res) {
        assert.isNotNull(res);
      }, assert.fail);
  });

  it('#status error with a false token', function() {
    return accountHelper
      .newVerifiedAccount()
      .then(function() {
        var fakeToken =
          'e838790265a45f6ee1130070d57d67d9bb20953706f73af0e34b0d4d92f10000';

        return respond(
          client.passwordForgotStatus(fakeToken),
          ErrorMocks.invalidAuthToken
        );
      })
      .then(assert.fail, function(err) {
        assert.equal(err.code, 401);
        assert.equal(err.errno, 110);
      });
  });

  it('#sessions', function() {
    return accountHelper
      .newVerifiedAccount()
      .then(function(account) {
        return respond(
          client.sessions(account.signIn.sessionToken),
          RequestMocks.sessions
        );
      })
      .then(function(res) {
        assert.equal(res.length, 2);
        var s = res[0];
        assert.ok(s.id);
        assert.ok(s.deviceType);
        assert.equal(s.isDevice, false);
        assert.ok(s.lastAccessTime);
        assert.ok(s.lastAccessTimeFormatted);
      }, assert.fail);
  });

  it('#sessions error', function() {
    return accountHelper
      .newVerifiedAccount()
      .then(function(account) {
        var fakeToken =
          'e838790265a45f6ee1130070d57d67d9bb20953706f73af0e34b0d4d92f10000';

        return respond(client.sessions(fakeToken), ErrorMocks.invalidAuthToken);
      })
      .then(assert.fail, function(err) {
        assert.equal(err.code, 401);
        assert.equal(err.errno, 110);
      });
  });

  it('#reauth', function() {
    return accountHelper.newVerifiedAccount().then(function(account) {
      var email = account.input.email;
      var password = account.input.password;

      return respond(
        client.sessionReauth(account.signIn.sessionToken, email, password),
        RequestMocks.sessionReauth
      ).then(function(res) {
        assert.ok(res.uid);
        assert.ok(res.verified);
        assert.ok(res.authAt);
        assert.notOk(res.keyFetchToken);
        assert.notOk(res.unwrapBKey);

        var args = xhr.prototype.open.args[xhr.prototype.open.args.length - 1];
        assert.equal(args[0], 'POST');
        assert.include(args[1], '/session/reauth');

        var payload = JSON.parse(
          xhr.prototype.send.args[xhr.prototype.send.args.length - 1][0]
        );
        assert.equal(Object.keys(payload).length, 2);
        assert.equal(payload.email, email);
        assert.equal(payload.authPW.length, 64);
      }, assert.fail);
    });
  });

  it('#reauth with keys', function() {
    return accountHelper.newVerifiedAccount().then(function(account) {
      var email = account.input.email;
      var password = account.input.password;

      return respond(
        client.sessionReauth(account.signIn.sessionToken, email, password, {
          keys: true,
        }),
        RequestMocks.sessionReauthWithKeys
      ).then(function(res) {
        assert.ok(res.uid);
        assert.ok(res.verified);
        assert.ok(res.authAt);
        assert.ok(res.keyFetchToken);
        assert.ok(res.unwrapBKey);

        var args = xhr.prototype.open.args[xhr.prototype.open.args.length - 1];
        assert.equal(args[0], 'POST');
        assert.include(args[1], '/session/reauth?keys=true');

        var payload = JSON.parse(
          xhr.prototype.send.args[xhr.prototype.send.args.length - 1][0]
        );
        assert.equal(Object.keys(payload).length, 2);
        assert.equal(payload.email, email);
        assert.equal(payload.authPW.length, 64);
      }, assert.fail);
    });
  });

  it('#reauth with incorrect password', function() {
    return accountHelper.newVerifiedAccount().then(function(account) {
      var email = account.input.email;
      var password = 'incorrect password';

      return respond(
        client.sessionReauth(account.signIn.sessionToken, email, password),
        ErrorMocks.accountIncorrectPassword
      ).then(
        function() {
          assert.fail();
        },
        function(res) {
          assert.equal(res.code, 400);
          assert.equal(res.errno, 103);
        }
      );
    });
  });

  it('#reauth with incorrect email case', function() {
    return accountHelper.newVerifiedAccount().then(function(account) {
      var numSetupRequests = requests ? requests.length : null;
      var sessionToken = account.signIn.sessionToken;
      var incorrectCaseEmail =
        account.input.email.charAt(0).toUpperCase() +
        account.input.email.slice(1);
      var password = account.input.password;

      respond(ErrorMocks.incorrectEmailCase);
      return respond(
        client.sessionReauth(sessionToken, incorrectCaseEmail, password),
        RequestMocks.sessionReauth
      ).then(function(res) {
        assert.property(res, 'uid');
        assert.property(res, 'verified');
        assert.property(res, 'authAt');

        if (requests) {
          assert.equal(requests.length - numSetupRequests, 2);
        }

        var args = xhr.prototype.open.args[xhr.prototype.open.args.length - 2];
        assert.equal(args[0], 'POST');
        assert.include(args[1], '/session/reauth');

        var payload = JSON.parse(
          xhr.prototype.send.args[xhr.prototype.send.args.length - 2][0]
        );
        assert.equal(Object.keys(payload).length, 2);
        assert.equal(payload.email, incorrectCaseEmail);
        assert.equal(payload.authPW.length, 64);

        args = xhr.prototype.open.args[xhr.prototype.open.args.length - 1];
        assert.equal(args[0], 'POST');
        assert.include(args[1], '/session/reauth');

        payload = JSON.parse(
          xhr.prototype.send.args[xhr.prototype.send.args.length - 1][0]
        );
        assert.equal(Object.keys(payload).length, 3);
        assert.notEqual(payload.email, incorrectCaseEmail);
        assert.equal(payload.originalLoginEmail, incorrectCaseEmail);
        assert.equal(payload.authPW.length, 64);
      }, assert.fail);
    });
  });

  it('#reauth with incorrect email case with skipCaseError', function() {
    return accountHelper.newVerifiedAccount().then(function(account) {
      var numSetupRequests = requests ? requests.length : null;
      var sessionToken = account.signIn.sessionToken;
      var incorrectCaseEmail =
        account.input.email.charAt(0).toUpperCase() +
        account.input.email.slice(1);
      var password = account.input.password;

      return respond(
        client.sessionReauth(sessionToken, incorrectCaseEmail, password, {
          skipCaseError: true,
        }),
        ErrorMocks.incorrectEmailCase
      ).then(
        function() {
          assert.fail();
        },
        function(res) {
          assert.equal(res.code, 400);
          assert.equal(res.errno, 120);

          if (requests) {
            assert.equal(requests.length - numSetupRequests, 1);
          }

          var args =
            xhr.prototype.open.args[xhr.prototype.open.args.length - 1];
          assert.equal(args[0], 'POST');
          assert.include(args[1], '/session/reauth');

          var payload = JSON.parse(
            xhr.prototype.send.args[xhr.prototype.send.args.length - 1][0]
          );
          assert.equal(Object.keys(payload).length, 2);
          assert.equal(payload.email, incorrectCaseEmail);
          assert.equal(payload.authPW.length, 64);
        }
      );
    });
  });

  it('#reauth with all the options', function() {
    return accountHelper.newVerifiedAccount().then(function(account) {
      var sessionToken = account.signIn.sessionToken;
      var email = account.input.email;
      var password = account.input.password;
      var options = {
        keys: true,
        metricsContext: {
          entrypoint: 'mock-entrypoint',
          entrypointExperiment: 'mock-entrypoint-experiment',
          entrypointVariation: 'mock-entrypoint-variation',
          utmCampaign: 'mock-utm-campaign',
          utmContent: 'mock-utm-content',
          utmMedium: 'mock-utm-medium',
          utmSource: 'mock-utm-source',
          utmTerm: 'mock-utm-term',
        },
        originalLoginEmail: email.toUpperCase(),
        reason: 'password_change',
        redirectTo: 'http://127.0.0.1',
        resume: 'RESUME_TOKEN',
        service: 'sync',
        verificationMethod: 'email-2fa',
      };

      return respond(
        client.sessionReauth(sessionToken, email, password, options),
        RequestMocks.sessionReauthWithKeys
      ).then(function(res) {
        assert.ok(res.uid);
        assert.ok(res.verified);
        assert.ok(res.authAt);
        assert.ok(res.keyFetchToken);
        assert.ok(res.unwrapBKey);

        var args = xhr.prototype.open.args[xhr.prototype.open.args.length - 1];
        assert.equal(args[0], 'POST');
        assert.include(args[1], '/session/reauth?keys=true');

        var payload = JSON.parse(
          xhr.prototype.send.args[xhr.prototype.send.args.length - 1][0]
        );
        assert.equal(Object.keys(payload).length, 9);
        assert.equal(payload.email, email);
        assert.equal(payload.authPW.length, 64);
        assert.deepEqual(payload.metricsContext, options.metricsContext);
        assert.equal(payload.originalLoginEmail, options.originalLoginEmail);
        assert.equal(payload.reason, options.reason);
        assert.equal(payload.redirectTo, options.redirectTo);
        assert.equal(payload.resume, options.resume);
        assert.equal(payload.service, options.service);
        assert.equal(payload.verificationMethod, options.verificationMethod);
      });
    });
  });

  describe('#verify_code', () => {
    it('with valid code', async () => {
      const account = await accountHelper.newUnconfirmedAccount({
        verificationMethod: 'email-otp',
      });
      const emails = await respond(
        mail.wait(account.input.user, 1),
        RequestMocks.signUpVerifyCodeEmailSent
      );
      const code = emails[0].headers['x-verify-short-code'];
      const response = await respond(
        client.sessionVerifyCode(account.signUp.sessionToken, code),
        RequestMocks.sessionVerifyCode
      );
      assert.deepEqual(response, {});

      const args = xhr.prototype.open.args[xhr.prototype.open.args.length - 1];
      assert.equal(args[0], 'POST');
      assert.include(args[1], '/session/verify_code');

      const payload = JSON.parse(
        xhr.prototype.send.args[xhr.prototype.send.args.length - 1][0]
      );
      assert.equal(Object.keys(payload).length, 1);
      assert.equal(payload.code, code);
    });

    it('with valid code and all options', async () => {
      const account = await accountHelper.newUnconfirmedAccount({
        verificationMethod: 'email-otp',
      });
      const emails = await respond(
        mail.wait(account.input.user, 1),
        RequestMocks.signUpVerifyCodeEmailSent
      );
      const code = emails[0].headers['x-verify-short-code'];

      const allOptions = {
        service: 'sync',
        style: 'trailhead',
        marketingOptIn: true,
        newsletters: ['test-pilot'],
      };
      const response = await respond(
        client.sessionVerifyCode(account.signUp.sessionToken, code, allOptions),
        RequestMocks.sessionVerifyCode
      );
      assert.deepEqual(response, {});

      const args = xhr.prototype.open.args[xhr.prototype.open.args.length - 1];
      assert.equal(args[0], 'POST');
      assert.include(args[1], '/session/verify_code');

      const payload = JSON.parse(
        xhr.prototype.send.args[xhr.prototype.send.args.length - 1][0]
      );
      assert.equal(Object.keys(payload).length, 5);
      assert.equal(payload.code, code);
      assert.equal(payload.service, allOptions.service);
      assert.equal(payload.style, allOptions.style);
      assert.equal(payload.marketingOptIn, allOptions.marketingOptIn);
      assert.deepEqual(payload.newsletters, allOptions.newsletters);
    });

    it('with invalid code', async () => {
      const account = await accountHelper.newUnconfirmedAccount({
        verificationMethod: 'email-otp',
      });
      const emails = await respond(
        mail.wait(account.input.user, 1),
        RequestMocks.signUpVerifyCodeEmailSent
      );
      const invalidCode =
        '123123' === emails[0].headers['x-verify-short-code']
          ? '123124'
          : '123123';

      let response;
      try {
        response = await respond(
          client.sessionVerifyCode(account.signUp.sessionToken, invalidCode),
          RequestMocks.sessionVerifyCodeInvalid
        );
        assert.isNotOk(response);
      } catch (err) {
        assert.equal(err.errno, 183);
      }

      const args = xhr.prototype.open.args[xhr.prototype.open.args.length - 1];
      assert.equal(args[0], 'POST');
      assert.include(args[1], '/session/verify_code');
    });
  });

  describe('#resend_code', () => {
    it('resend code', async () => {
      const account = await accountHelper.newUnconfirmedAccount({
        verificationMethod: 'email-otp',
      });
      let emails = await respond(
        mail.wait(account.input.user, 1),
        RequestMocks.signUpVerifyCodeEmailSent
      );
      const originalCode = emails[0].headers['x-verify-short-code'];

      const response = await respond(
        client.sessionResendVerifyCode(account.signUp.sessionToken),
        RequestMocks.sessionResendVerifyCode
      );
      assert.deepEqual(response, {});

      const args = xhr.prototype.open.args[xhr.prototype.open.args.length - 1];
      assert.equal(args[0], 'POST');
      assert.include(args[1], '/session/resend_code');

      const payload = JSON.parse(
        xhr.prototype.send.args[xhr.prototype.send.args.length - 1][0]
      );
      assert.equal(Object.keys(payload).length, 0);

      emails = await respond(
        mail.wait(account.input.user, 2),
        RequestMocks.sessionResendVerifyCodeEmail
      );
      const code = emails[1].headers['x-verify-short-code'];

      assert.equal(originalCode, code, 'codes match');
    });
  });
});
