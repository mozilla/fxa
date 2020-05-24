/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('chai').assert;
const Environment = require('../addons/environment');

const sinon = require('sinon');
describe('recovery key', function () {
  var account;
  var accountHelper;
  var respond;
  var client;
  var email;
  var RequestMocks;
  var env;
  var xhr;
  var xhrOpen;
  var xhrSend;
  var keys;
  var passwordForgotToken;
  var accountResetToken;
  var mail;
  var newPassword = '~(_8^(I)';
  var recoveryKeyId = 'edc243a821582ee9e979583be9989ee7';
  var bundle =
    'eyJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIiwia2lkIjoiODE4NDIwZjBkYTU4ZDIwZjZhZTR' +
    'kMmM5YmVhYjkyNTEifQ..D29EXHp8ubLvftaZ.xHJd2Nl2Uco2RyywYPLkUU7fHpgO2FztY12Zjpq1ffiyLRIUcQVfmiNC6aMiHB' +
    'l7Hp-lXEbb5mR1uXHrTH9iRXEBVaAfyf9KEAWOukWGVSH8EaOkr7cfu2Yr0K93Ec8glsssjiKp8NGB8VKTUJ-lmBv2cIrG68V4eTUVDo' +
    'DhMbXhrF-Mv4JNeh338pPeatTnyg.Ow2bhEYWxzxfSPMxVwKmSA';

  beforeEach(function () {
    env = new Environment();
    accountHelper = env.accountHelper;
    respond = env.respond;
    client = env.client;
    RequestMocks = env.RequestMocks;
    mail = env.mail;

    return accountHelper
      .newVerifiedAccount()
      .then(function (newAccount) {
        account = newAccount;
        email = account.input.email;
        return respond(
          client.accountKeys(
            account.signIn.keyFetchToken,
            account.signIn.unwrapBKey
          ),
          RequestMocks.accountKeys
        );
      })
      .then(function (result) {
        keys = result;
        xhr = env.xhr;
        xhrOpen = sinon.spy(xhr.prototype, 'open');
        xhrSend = sinon.spy(xhr.prototype, 'send');
      });
  });

  afterEach(function () {
    xhrOpen.restore();
    xhrSend.restore();
  });

  it('#can create and get a recovery key that can be used to reset an account', function () {
    return respond(
      client.createRecoveryKey(
        account.signIn.sessionToken,
        recoveryKeyId,
        bundle,
        true
      ),
      RequestMocks.createRecoveryKey
    )
      .then(function (res) {
        assert.ok(res);
        return respond(
          client.passwordForgotSendCode(email),
          RequestMocks.passwordForgotSendCode
        );
      })
      .then(function (result) {
        passwordForgotToken = result.passwordForgotToken;
        assert.ok(passwordForgotToken, 'passwordForgotToken is returned');

        return respond(
          mail.wait(account.input.user, 4),
          RequestMocks.resetMailpasswordForgotRecoveryKey
        );
      })
      .then(function (emails) {
        var code = emails[3].html.match(/code=([A-Za-z0-9]+)/)[1];
        assert.ok(code, 'code is returned: ' + code);

        return respond(
          client.passwordForgotVerifyCode(code, passwordForgotToken, {
            accountResetWithRecoveryKey: true,
          }),
          RequestMocks.passwordForgotVerifyCode
        );
      })
      .then(function (result) {
        accountResetToken = result.accountResetToken;
        assert.ok(accountResetToken, 'accountResetToken is returned');

        assert.equal(xhrOpen.args[3][0], 'POST', 'method is correct');
        assert.include(
          xhrOpen.args[3][1],
          '/password/forgot/verify_code',
          'path is correct'
        );
        var sentData = JSON.parse(xhrSend.args[3][0]);
        assert.equal(Object.keys(sentData).length, 2);
        assert.equal(sentData.accountResetWithRecoveryKey, true, 'param set');
        return respond(
          client.getRecoveryKey(accountResetToken, recoveryKeyId),
          RequestMocks.getRecoveryKey
        );
      })
      .then(function (res) {
        assert.equal(xhrOpen.args[4][0], 'GET', 'method is correct');
        assert.include(
          xhrOpen.args[4][1],
          '/recoveryKey/' + recoveryKeyId,
          'path is correct'
        );
        assert.ok(res.recoveryData, 'contains recovery data');

        var options = {
          keys: true,
          metricsContext: {
            deviceId: '0123456789abcdef0123456789abcdef',
            flowBeginTime: 1480615985437,
            flowId:
              '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
            utmCampaign: 'mock-campaign',
            utmContent: 'mock-content',
            utmMedium: 'mock-medium',
            utmSource: 'mock-source',
            utmTerm: 'mock-term',
          },
          sessionToken: true,
        };
        return respond(
          client.resetPasswordWithRecoveryKey(
            accountResetToken,
            email,
            newPassword,
            recoveryKeyId,
            keys,
            options
          ),
          RequestMocks.accountReset
        );
      })
      .then(function (res) {
        assert.ok(res.keyFetchToken);
        assert.ok(res.sessionToken);
        assert.ok(res.unwrapBKey);
        assert.ok(res.uid);

        // Attempt to login with new password and retrieve keys
        return respond(
          client.signIn(email, newPassword, { keys: true }),
          RequestMocks.signInWithKeys
        );
      })
      .then(function (res) {
        return respond(
          client.accountKeys(res.keyFetchToken, res.unwrapBKey),
          RequestMocks.accountKeys
        );
      })
      .then(function (res) {
        if (!env.useRemoteServer) {
          assert.ok(res.kB, 'kB exists');
        } else {
          assert.equal(res.kB, keys.kB, 'kB is equal to original kB');
        }
      });
  });

  it('#can create and delete recovery key', function () {
    return respond(
      client.createRecoveryKey(
        account.signIn.sessionToken,
        recoveryKeyId,
        bundle,
        true
      ),
      RequestMocks.createRecoveryKey
    )
      .then(function (res) {
        assert.ok(res);
        return respond(
          client.deleteRecoveryKey(account.signIn.sessionToken),
          RequestMocks.deleteRecoveryKey
        );
      })
      .then(function (res) {
        assert.ok(res);
        assert.equal(xhrOpen.args[1][0], 'DELETE', 'method is correct');
        assert.include(xhrOpen.args[1][1], '/recoveryKey', 'path is correct');
      });
  });

  it('#can check if recovery exist using sessionToken', function () {
    return respond(
      client.recoveryKeyExists(account.signIn.sessionToken),
      RequestMocks.recoveryKeyExistsFalse
    )
      .then(function (res) {
        assert.equal(res.exists, false, 'recovery key does not exist');
        assert.equal(xhrOpen.args[0][0], 'POST', 'method is correct');
        assert.include(
          xhrOpen.args[0][1],
          '/recoveryKey/exists',
          'path is correct'
        );
        return respond(
          client.createRecoveryKey(
            account.signIn.sessionToken,
            recoveryKeyId,
            bundle,
            true
          ),
          RequestMocks.createRecoveryKey
        );
      })
      .then(function (res) {
        assert.ok(res);
        return respond(
          client.recoveryKeyExists(account.signIn.sessionToken),
          RequestMocks.recoveryKeyExistsTrue
        );
      })
      .then(function (res) {
        assert.equal(res.exists, true, 'recovery key exists');
        assert.equal(xhrOpen.args[2][0], 'POST', 'method is correct');
        assert.include(
          xhrOpen.args[2][1],
          '/recoveryKey/exists',
          'path is correct'
        );
      });
  });

  it('#can check if recovery exist using email', function () {
    return respond(
      client.recoveryKeyExists(undefined, account.input.email),
      RequestMocks.recoveryKeyExistsFalse
    )
      .then(function (res) {
        assert.equal(res.exists, false, 'recovery key does not exist');
        assert.equal(xhrOpen.args[0][0], 'POST', 'method is correct');
        assert.include(
          xhrOpen.args[0][1],
          '/recoveryKey/exists',
          'path is correct'
        );

        return respond(
          client.createRecoveryKey(
            account.signIn.sessionToken,
            recoveryKeyId,
            bundle,
            true
          ),
          RequestMocks.createRecoveryKey
        );
      })
      .then(function (res) {
        assert.ok(res);
        return respond(
          client.recoveryKeyExists(undefined, account.input.email),
          RequestMocks.recoveryKeyExistsTrue
        );
      })
      .then(function (res) {
        assert.equal(res.exists, true, 'recovery key exists');
        assert.equal(xhrOpen.args[2][0], 'POST', 'method is correct');
        assert.include(
          xhrOpen.args[2][1],
          '/recoveryKey/exists',
          'path is correct'
        );
      });
  });
});
