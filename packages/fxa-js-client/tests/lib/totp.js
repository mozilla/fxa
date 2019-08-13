/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('chai').assert;
const Environment = require('../addons/environment');

const sinon = require('sinon');
const otplib = require('otplib');
describe('totp', function() {
  var authenticator;
  var account;
  var accountHelper;
  var respond;
  var client;
  var RequestMocks;
  var env;
  var xhr;
  var xhrOpen;
  var xhrSend;
  var secret;
  var opts = {
    metricsContext: {
      flowBeginTime: Date.now(),
      flowId:
        '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    },
    service: 'sync',
  };

  beforeEach(function() {
    env = new Environment();
    accountHelper = env.accountHelper;
    respond = env.respond;
    client = env.client;
    RequestMocks = env.RequestMocks;

    return accountHelper
      .newVerifiedAccount()
      .then(function(newAccount) {
        account = newAccount;
        return respond(
          client.createTotpToken(account.signIn.sessionToken),
          RequestMocks.createTotpToken
        );
      })
      .then(function(res) {
        assert.ok(res.qrCodeUrl, 'should return QR code data encoded url');
        assert.ok(res.secret, 'should return secret that is encoded in url');

        // Create a new authenticator instance with shared options
        authenticator = new otplib.authenticator.Authenticator();
        authenticator.options = otplib.authenticator.options;
        secret = res.secret;

        xhr = env.xhr;
        xhrOpen = sinon.spy(xhr.prototype, 'open');
        xhrSend = sinon.spy(xhr.prototype, 'send');
      });
  });

  afterEach(function() {
    xhrOpen.restore();
    xhrSend.restore();
  });

  it('#createTotpToken - fails if already exists', function() {
    return respond(
      client.createTotpToken(account.signIn.sessionToken),
      RequestMocks.createTotpTokenDuplicate
    ).then(assert.fail, function(err) {
      assert.equal(xhrOpen.args[0][0], 'POST', 'method is correct');
      assert.include(xhrOpen.args[0][1], '/totp/create', 'path is correct');
      assert.equal(err.errno, 154, 'token already exists for account errno');
    });
  });

  it('#deleteTotpToken', function() {
    return respond(
      client.deleteTotpToken(account.signIn.sessionToken),
      RequestMocks.deleteTotpToken
    ).then(function(res) {
      assert.equal(xhrOpen.args[0][0], 'POST', 'method is correct');
      assert.include(xhrOpen.args[0][1], '/totp/destroy', 'path is correct');
      assert.ok(res, 'should return empty response');
    });
  });

  it('#checkTotpTokenExists - does not exist returns false', function() {
    return accountHelper.newVerifiedAccount().then(function(newAccount) {
      return respond(
        client.checkTotpTokenExists(newAccount.signIn.sessionToken),
        RequestMocks.checkTotpTokenExistsFalse
      ).then(function(res) {
        assert.equal(xhrOpen.args[4][0], 'GET', 'method is correct');
        assert.include(xhrOpen.args[4][1], '/totp/exists', 'path is correct');
        assert.equal(res.exists, false);
      });
    });
  });

  it('#checkTotpTokenExists - created token but not verified returns false', function() {
    return respond(
      client.checkTotpTokenExists(account.signIn.sessionToken),
      RequestMocks.checkTotpTokenExistsFalse
    ).then(function(res) {
      assert.equal(xhrOpen.args[0][0], 'GET', 'method is correct');
      assert.include(xhrOpen.args[0][1], '/totp/exists', 'path is correct');
      assert.equal(res.exists, false);
    });
  });

  it('#checkTotpTokenExists - verified token returns true', function() {
    var code = authenticator.generate(secret);
    return respond(
      client.verifyTotpCode(account.signIn.sessionToken, code),
      RequestMocks.verifyTotpCodeTrue
    ).then(function(res) {
      assert.equal(xhrOpen.args[0][0], 'POST', 'method is correct');
      assert.include(
        xhrOpen.args[0][1],
        '/session/verify/totp',
        'path is correct'
      );
      var sentData = JSON.parse(xhrSend.args[0][0]);
      assert.equal(Object.keys(sentData).length, 1);
      assert.equal(sentData.code, code, 'code is correct');

      assert.equal(res.success, true);
      return respond(
        client.checkTotpTokenExists(account.signIn.sessionToken),
        RequestMocks.checkTotpTokenExistsTrue
      ).then(function(res) {
        assert.equal(xhrOpen.args[1][0], 'GET', 'method is correct');
        assert.include(xhrOpen.args[1][1], '/totp/exists', 'path is correct');
        assert.equal(res.exists, true);
      });
    });
  });

  it('#verifyTotpCode - succeeds for valid code', function() {
    var code = authenticator.generate(secret);
    return respond(
      client.verifyTotpCode(account.signIn.sessionToken, code, opts),
      RequestMocks.verifyTotpCodeTrue
    ).then(function(res) {
      assert.equal(xhrOpen.args[0][0], 'POST', 'method is correct');
      assert.include(
        xhrOpen.args[0][1],
        '/session/verify/totp',
        'path is correct'
      );
      var sentData = JSON.parse(xhrSend.args[0][0]);
      assert.lengthOf(Object.keys(sentData), 2);
      assert.equal(sentData.code, code, 'code is correct');
      assert.equal(sentData.service, opts.service, 'service is correct');

      assert.equal(res.success, true);
    });
  });

  it('#verifyTotpCode - fails for invalid code', function() {
    var code =
      authenticator.generate(secret) === '000000' ? '000001' : '000000';
    return respond(
      client.verifyTotpCode(account.signIn.sessionToken, code, opts),
      RequestMocks.verifyTotpCodeFalse
    ).then(function(res) {
      assert.equal(xhrOpen.args[0][0], 'POST', 'method is correct');
      assert.include(
        xhrOpen.args[0][1],
        '/session/verify/totp',
        'path is correct'
      );
      var sentData = JSON.parse(xhrSend.args[0][0]);
      assert.lengthOf(Object.keys(sentData), 2);
      assert.equal(sentData.code, code, 'code is correct');
      assert.equal(sentData.service, opts.service, 'service is correct');

      assert.equal(res.success, false);
    });
  });
});
