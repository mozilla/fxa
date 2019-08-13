/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('chai').assert;
const Environment = require('../addons/environment');

const sinon = require('sinon');
const otplib = require('otplib');
describe('recovery codes', function() {
  var account;
  var accountHelper;
  var respond;
  var client;
  var RequestMocks;
  var env;
  var xhr;
  var xhrOpen;
  var xhrSend;
  var recoveryCodes;
  var metricsContext;

  beforeEach(function() {
    env = new Environment();
    accountHelper = env.accountHelper;
    respond = env.respond;
    client = env.client;
    RequestMocks = env.RequestMocks;
    metricsContext = {
      flowBeginTime: Date.now(),
      flowId:
        '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    };

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

        var authenticator = new otplib.authenticator.Authenticator();
        authenticator.options = otplib.authenticator.options;

        var code = authenticator.generate(res.secret);
        return respond(
          client.verifyTotpCode(account.signIn.sessionToken, code),
          RequestMocks.verifyTotpCodeTrueEnableToken
        );
      })
      .then(function(res) {
        assert.equal(
          res.recoveryCodes.length,
          3,
          'should return recovery codes'
        );
        recoveryCodes = res.recoveryCodes;

        xhr = env.xhr;
        xhrOpen = sinon.spy(xhr.prototype, 'open');
        xhrSend = sinon.spy(xhr.prototype, 'send');
      });
  });

  afterEach(function() {
    xhrOpen.restore();
    xhrSend.restore();
  });

  it('#consumeRecoveryCode - fails for invalid code', function() {
    return respond(
      client.consumeRecoveryCode(account.signIn.sessionToken, '00000000'),
      RequestMocks.consumeRecoveryCodeInvalidCode
    ).then(assert.fail, function(err) {
      assert.equal(xhrOpen.args[0][0], 'POST', 'method is correct');
      assert.include(
        xhrOpen.args[0][1],
        '/session/verify/recoveryCode',
        'path is correct'
      );
      assert.equal(err.errno, 156, 'invalid recovery code errno');
    });
  });

  it('#consumeRecoveryCode - consumes valid code', function() {
    var code = recoveryCodes[0];
    return respond(
      client.consumeRecoveryCode(account.signIn.sessionToken, code, {
        metricsContext: metricsContext,
      }),
      RequestMocks.consumeRecoveryCodeSuccess
    ).then(function(res) {
      assert.equal(xhrOpen.args[0][0], 'POST', 'method is correct');
      assert.include(
        xhrOpen.args[0][1],
        '/session/verify/recoveryCode',
        'path is correct'
      );
      var sentData = JSON.parse(xhrSend.args[0][0]);
      assert.lengthOf(Object.keys(sentData), 1);
      assert.equal(sentData.code, code, 'code is correct');

      assert.equal(res.remaining, 2, 'correct remaining recovery codes');
    });
  });

  it('#replaceRecoveryCodes - replaces current recovery codes', function() {
    return respond(
      client.replaceRecoveryCodes(account.signIn.sessionToken),
      RequestMocks.replaceRecoveryCodesSuccessNew
    ).then(function(res) {
      assert.equal(xhrOpen.args[0][0], 'GET', 'method is correct');
      assert.include(xhrOpen.args[0][1], '/recoveryCodes', 'path is correct');

      assert.equal(res.recoveryCodes.length, 3, 'should return recovery codes');
      assert.notDeepEqual(
        res.recoveryCodes,
        recoveryCodes,
        'should not be the same codes'
      );
    });
  });
});
