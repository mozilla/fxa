/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('chai').assert;
const Environment = require('../addons/environment');

const sinon = require('sinon');
describe('signUp', function() {
  var accountHelper;
  var respond;
  var mail;
  var client;
  var RequestMocks;
  var ErrorMocks;
  var xhr;
  var xhrOpen;
  var xhrSend;
  let env;

  beforeEach(function() {
    env = new Environment();
    accountHelper = env.accountHelper;
    respond = env.respond;
    mail = env.mail;
    client = env.client;
    RequestMocks = env.RequestMocks;
    ErrorMocks = env.ErrorMocks;
    xhr = env.xhr;
    xhrOpen = sinon.spy(xhr.prototype, 'open');
    xhrSend = sinon.spy(xhr.prototype, 'send');
  });

  afterEach(function() {
    xhrOpen.restore();
    xhrSend.restore();
  });

  it('#basic', function() {
    var email = 'test' + new Date().getTime() + '@restmail.net';
    var password = 'iliketurtles';

    return respond(client.signUp(email, password), RequestMocks.signUp).then(
      function(res) {
        assert.property(res, 'uid', 'uid should be returned on signUp');
        assert.property(
          res,
          'sessionToken',
          'sessionToken should be returned on signUp'
        );
        assert.notProperty(
          res,
          'keyFetchToken',
          'keyFetchToken should not be returned on signUp'
        );

        assert.equal(xhrOpen.args[0][0], 'POST', 'method is correct');
        assert.include(
          xhrOpen.args[0][1],
          '/account/create',
          'path is correct'
        );
        var sentData = JSON.parse(xhrSend.args[0][0]);
        assert.equal(Object.keys(sentData).length, 2);
        assert.equal(sentData.email, email, 'email is correct');
        assert.equal(sentData.authPW.length, 64, 'length of authPW');
      },
      assert.fail
    );
  });

  it('#withKeys', function() {
    var email = 'test' + new Date().getTime() + '@restmail.net';
    var password = 'iliketurtles';
    var opts = {
      keys: true,
    };

    return respond(
      client.signUp(email, password, opts),
      RequestMocks.signUpKeys
    ).then(function(res) {
      assert.property(res, 'uid', 'uid should be returned on signUp');
      assert.property(
        res,
        'sessionToken',
        'sessionToken should be returned on signUp'
      );
      assert.property(
        res,
        'keyFetchToken',
        'keyFetchToken should be returned on signUp'
      );
      assert.property(
        res,
        'unwrapBKey',
        'unwrapBKey should be returned on signUp'
      );

      assert.equal(xhrOpen.args[0][0], 'POST', 'method is correct');
      assert.include(
        xhrOpen.args[0][1],
        '/account/create?keys=true',
        'path is correct'
      );
    }, assert.fail);
  });

  it('#create account with service, redirectTo, and resume', function() {
    var user = 'test' + new Date().getTime();
    var email = user + '@restmail.net';
    var password = 'iliketurtles';
    var opts = {
      service: 'sync',
      redirectTo: 'https://sync.127.0.0.1/after_reset',
      resume: 'resumejwt',
    };

    return respond(client.signUp(email, password, opts), RequestMocks.signUp)
      .then(function(res) {
        assert.ok(res.uid);
        return respond(mail.wait(user), RequestMocks.mailServiceAndRedirect);
      })
      .then(function(emails) {
        var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
        var service = emails[0].html.match(/service=([A-Za-z0-9]+)/)[1];
        var redirectTo = emails[0].html.match(/redirectTo=([A-Za-z0-9]+)/)[1];
        var resume = emails[0].html.match(/resume=([A-Za-z0-9]+)/)[1];

        assert.ok(code, 'code is returned');
        assert.ok(service, 'service is returned');
        assert.ok(redirectTo, 'redirectTo is returned');
        assert.ok(resume, 'resume is returned');

        assert.include(
          xhrOpen.args[0][1],
          '/account/create',
          'path is correct'
        );
        var sentData = JSON.parse(xhrSend.args[0][0]);
        assert.equal(Object.keys(sentData).length, 5);
        assert.equal(sentData.email, email, 'email is correct');
        assert.equal(sentData.authPW.length, 64, 'length of authPW');
        assert.equal(sentData.service, opts.service);
        assert.equal(sentData.resume, opts.resume);
        assert.equal(sentData.redirectTo, opts.redirectTo);
      }, assert.fail);
  });

  it('#withService', function() {
    var user = 'test' + new Date().getTime();
    var email = user + '@restmail.net';
    var password = 'iliketurtles';
    var opts = {
      service: 'sync',
    };

    return respond(client.signUp(email, password, opts), RequestMocks.signUp)
      .then(function(res) {
        assert.ok(res.uid);
        return respond(mail.wait(user), RequestMocks.mailServiceAndRedirect);
      })
      .then(function(emails) {
        var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
        var service = emails[0].html.match(/service=([A-Za-z0-9]+)/)[1];

        assert.ok(code, 'code is returned');
        assert.ok(service, 'service is returned');
      }, assert.fail);
  });

  it('#withRedirectTo', function() {
    var user = 'test' + new Date().getTime();
    var email = user + '@restmail.net';
    var password = 'iliketurtles';
    var opts = {
      redirectTo: 'http://sync.127.0.0.1/after_reset',
    };

    return respond(client.signUp(email, password, opts), RequestMocks.signUp)
      .then(function(res) {
        assert.ok(res.uid);
        return respond(mail.wait(user), RequestMocks.mailServiceAndRedirect);
      })
      .then(function(emails) {
        var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
        var redirectTo = emails[0].html.match(/redirectTo=([A-Za-z0-9]+)/)[1];

        assert.ok(code, 'code is returned');
        assert.ok(redirectTo, 'redirectTo is returned');
      }, assert.fail);
  });

  it('#withResume', function() {
    var user = 'test' + new Date().getTime();
    var email = user + '@restmail.net';
    var password = 'iliketurtles';
    var opts = {
      resume: 'resumejwt',
    };

    return respond(client.signUp(email, password, opts), RequestMocks.signUp)
      .then(function(res) {
        assert.ok(res.uid);
        return respond(mail.wait(user), RequestMocks.mailServiceAndRedirect);
      })
      .then(function(emails) {
        var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
        var resume = emails[0].html.match(/resume=([A-Za-z0-9]+)/)[1];

        assert.ok(code, 'code is returned');
        assert.ok(resume, 'resume is returned');
      }, assert.fail);
  });

  it('#preVerified', function() {
    var email = 'test' + new Date().getTime() + '@restmail.net';
    var password = 'iliketurtles';
    var opts = {
      preVerified: true,
    };

    return respond(client.signUp(email, password, opts), RequestMocks.signUp)
      .then(function(res) {
        assert.ok(res.uid);

        return respond(client.signIn(email, password), RequestMocks.signIn);
      })
      .then(function(res) {
        assert.equal(res.verified, true, '== account is verified');
      });
  });

  it('#accountExists', function() {
    return accountHelper
      .newVerifiedAccount()
      .then(function(account) {
        return respond(
          client.signUp(account.input.email, 'somepass'),
          ErrorMocks.accountExists
        );
      })
      .then(
        function(res) {
          assert.fail();
        },
        function(err) {
          assert.equal(err.code, 400);
          assert.equal(err.errno, 101);
        }
      );
  });

  it('#with metricsContext metadata', function() {
    var email = 'test' + new Date().getTime() + '@restmail.net';
    var password = 'iliketurtles';

    return respond(
      client.signUp(email, password, {
        metricsContext: {
          deviceId: '0123456789abcdef0123456789abcdef',
          flowId:
            '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
          flowBeginTime: Date.now(),
          utmCampaign: 'mock-campaign',
          utmContent: 'mock-content',
          utmMedium: 'mock-medium',
          utmSource: 'mock-source',
          utmTerm: 'mock-term',
          forbiddenProperty: 666,
        },
      }),
      RequestMocks.signUp
    ).then(function(resp) {
      assert.ok(resp);
    }, assert.fail);
  });

  it('#with verificationMethod `email-otp`', async function() {
    const account = await accountHelper.newUnconfirmedAccount({
      verificationMethod: 'email-otp',
    });

    const args = xhr.prototype.open.args[xhr.prototype.open.args.length - 1];
    assert.equal(args[0], 'POST');
    assert.include(args[1], '/account/create');

    const payload = JSON.parse(
      xhr.prototype.send.args[xhr.prototype.send.args.length - 1][0]
    );
    assert.equal(Object.keys(payload).length, 3);
    assert.equal(payload.verificationMethod, 'email-otp');
    assert.equal(payload.email, account.input.email);
    assert.equal(payload.authPW.length, 64, 'length of authPW');

    // Verify the account for good measure
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
  });
});
