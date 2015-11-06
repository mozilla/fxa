/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var Assertion = require('lib/assertion');
  var AuthErrors = require('lib/auth-errors');
  var chai = require('chai');
  var Constants = require('lib/constants');
  var OAuthAuthenticationBroker = require('models/auth_brokers/oauth');
  var OAuthClient = require('lib/oauth-client');
  var OAuthErrors = require('lib/oauth-errors');
  var p = require('lib/promise');
  var Relier = require('models/reliers/relier');
  var Session = require('lib/session');
  var sinon = require('sinon');
  var User = require('models/user');

  var assert = chai.assert;

  var HEX_CHARSET = '0123456789abcdef';
  function generateOAuthCode() {
    var code = '';

    for (var i = 0; i < 64; ++i) {
      code += HEX_CHARSET.charAt(Math.floor(Math.random() * 16));
    }

    return code;
  }

  var VALID_OAUTH_CODE = generateOAuthCode();
  var VALID_OAUTH_CODE_REDIRECT_URL = 'https://127.0.0.1:8080?state=state&code=' + VALID_OAUTH_CODE;
  var INVALID_OAUTH_CODE_REDIRECT_URL = 'https://127.0.0.1:8080?code=code&state=state';

  describe('models/auth_brokers/oauth', function () {
    var account;
    var assertionLibrary;
    var broker;
    var oAuthClient;
    var relier;
    var user;

    beforeEach(function () {
      oAuthClient = new OAuthClient();
      sinon.stub(oAuthClient, 'getCode', function () {
        return p({
          redirect: VALID_OAUTH_CODE_REDIRECT_URL
        });
      });

      assertionLibrary = new Assertion({});
      sinon.stub(assertionLibrary, 'generate', function () {
        return p('assertion');
      });

      relier = new Relier();
      relier.set({
        action: 'action',
        clientId: 'clientId',
        scope: 'scope',
        state: 'state',
        webChannelId: 'webChannelId'
      });

      user = new User();

      account = user.initAccount({
        sessionToken: 'abc123'
      });

      broker = new OAuthAuthenticationBroker({
        assertionLibrary: assertionLibrary,
        oAuthClient: oAuthClient,
        relier: relier,
        session: Session
      });

      sinon.spy(broker, 'finishOAuthFlow');
    });

    it('has the `signup` capability by default', function () {
      assert.isTrue(broker.hasCapability('signup'));
    });

    it('does not have the `handleSignedInNotification` capability by default', function () {
      assert.isFalse(broker.hasCapability('handleSignedInNotification'));
    });

    it('has the `emailVerificationMarketingSnippet` capability by default', function () {
      assert.isTrue(broker.hasCapability('emailVerificationMarketingSnippet'));
    });

    it('does not have the `syncPreferencesNotification` capability by default', function () {
      assert.isFalse(broker.hasCapability('syncPreferencesNotification'));
    });

    describe('sendOAuthResultToRelier', function () {
      it('must be overridden', function () {
        return broker.sendOAuthResultToRelier()
          .then(assert.fail, function (err) {
            assert.ok(err);
          });
      });
    });

    describe('afterSignIn', function () {
      it('calls sendOAuthResultToRelier with the correct options', function () {
        sinon.stub(broker, 'sendOAuthResultToRelier', function () {
          return p();
        });

        return broker.afterSignIn(account)
          .then(function () {
            assert.isTrue(broker.finishOAuthFlow.calledWith(account, {
              action: Constants.OAUTH_ACTION_SIGNIN
            }));
            assert.isTrue(broker.sendOAuthResultToRelier.calledWith({
              action: Constants.OAUTH_ACTION_SIGNIN,
              code: VALID_OAUTH_CODE,
              redirect: VALID_OAUTH_CODE_REDIRECT_URL,
              state: 'state'
            }));
          });
      });

      it('returns any errors returned by getOAuthResult', function () {
        sinon.stub(broker, 'getOAuthResult', function () {
          return p.reject(new Error('uh oh'));
        });

        return broker.afterSignIn(account)
          .then(assert.fail, function (err) {
            assert.equal(err.message, 'uh oh');
          });
      });
    });

    describe('persistVerificationData', function () {
      it('saves OAuth params to session', function () {
        return broker.persistVerificationData(account)
          .then(function () {
            assert.ok(!! Session.oauth);
          });
      });
    });

    describe('afterSignUp', function () {
      it('causes a redirect to `signup_permissions` if the user needs to add permissions', function () {
        sinon.stub(relier, 'accountNeedsPermissions', function () {
          return true;
        });

        return broker.afterSignUp(account)
          .then(function (behavior) {
            assert.equal(behavior.endpoint, 'signup_permissions');
          });
      });

      it('does nothing if the user does not need to add permissions', function () {
        sinon.stub(relier, 'accountNeedsPermissions', function () {
          return false;
        });

        return broker.afterSignUp(account)
          .then(function (behavior) {
            assert.isUndefined(behavior);
          });
      });
    });

    describe('afterSignUpConfirmationPoll', function () {
      it('calls sendOAuthResultToRelier with the correct options', function () {
        sinon.stub(broker, 'sendOAuthResultToRelier', function () {
          return p();
        });

        return broker.afterSignUpConfirmationPoll(account)
          .then(function () {
            assert.isTrue(broker.finishOAuthFlow.calledWith(account, {
              action: Constants.OAUTH_ACTION_SIGNUP
            }));
            assert.isTrue(broker.sendOAuthResultToRelier.calledWith({
              action: Constants.OAUTH_ACTION_SIGNUP,
              code: VALID_OAUTH_CODE,
              redirect: VALID_OAUTH_CODE_REDIRECT_URL,
              state: 'state'
            }));
          });
      });
    });

    describe('afterResetPasswordConfirmationPoll', function () {
      it('calls sendOAuthResultToRelier with the expected options', function () {
        sinon.stub(broker, 'sendOAuthResultToRelier', function () {
          return p();
        });

        return broker.afterResetPasswordConfirmationPoll(account)
          .then(function () {
            assert.isTrue(broker.finishOAuthFlow.calledWith(account, {
              action: Constants.OAUTH_ACTION_SIGNIN
            }));
            assert.isTrue(broker.sendOAuthResultToRelier.calledWith({
              action: Constants.OAUTH_ACTION_SIGNIN,
              code: VALID_OAUTH_CODE,
              redirect: VALID_OAUTH_CODE_REDIRECT_URL,
              state: 'state'
            }));
          });
      });
    });

    describe('getOAuthResult', function () {
      it('gets an object with the OAuth login information', function () {
        return broker.getOAuthResult(account)
          .then(function (result) {
            assert.isTrue(assertionLibrary.generate.calledWith(account.get('sessionToken')));
            assert.equal(result.redirect, VALID_OAUTH_CODE_REDIRECT_URL);
            assert.equal(result.state, 'state');
            assert.equal(result.code, VALID_OAUTH_CODE);
          });
      });

      it('passes on errors from assertion generation', function () {
        assertionLibrary.generate.restore();
        sinon.stub(assertionLibrary, 'generate', function () {
          return p.reject(new Error('uh oh'));
        });

        return broker.getOAuthResult(account)
          .then(assert.fail, function (err) {
            assert.equal(err.message, 'uh oh');
          });
      });

      it('passes on errors from oAuthClient.getCode', function () {
        oAuthClient.getCode.restore();
        sinon.stub(oAuthClient, 'getCode', function () {
          return p.reject(new Error('uh oh'));
        });

        return broker.getOAuthResult(account)
          .then(assert.fail, function (err) {
            assert.equal(err.message, 'uh oh');
          });
      });

      it('throws an error if oAuthClient.getCode returns nothing', function () {
        oAuthClient.getCode.restore();
        sinon.stub(oAuthClient, 'getCode', function () {
          return;
        });

        return broker.getOAuthResult(account)
          .then(assert.fail, function (err) {
            assert.isTrue(OAuthErrors.is(err, 'INVALID_RESULT'));
          });
      });

      it('throws an error if oAuthClient.getCode returns an empty object', function () {
        oAuthClient.getCode.restore();
        sinon.stub(oAuthClient, 'getCode', function () {
          return {};
        });

        return broker.getOAuthResult(account)
          .then(assert.fail, function (err) {
            assert.isTrue(OAuthErrors.is(err, 'INVALID_RESULT_REDIRECT'));
          });
      });

      it('throws an error if oAuthClient.getCode returns an invalid code', function () {
        oAuthClient.getCode.restore();
        sinon.stub(oAuthClient, 'getCode', function () {
          return {
            redirect: INVALID_OAUTH_CODE_REDIRECT_URL
          };
        });

        return broker.getOAuthResult(account)
          .then(assert.fail, function (err) {
            assert.isTrue(OAuthErrors.is(err, 'INVALID_RESULT_CODE'));
          });
      });

      it('throws an error if accountData is missing', function () {
        return broker.getOAuthResult()
          .then(assert.fail, function (err) {
            assert.isTrue(AuthErrors.is(err, 'INVALID_TOKEN'));
          });
      });

      it('throws an error if accountData is missing a sessionToken', function () {
        return broker.getOAuthResult(user.initAccount())
          .then(assert.fail, function (err) {
            assert.isTrue(AuthErrors.is(err, 'INVALID_TOKEN'));
          });
      });
    });

    describe('transformLink', function () {
      it('prepends `/oauth` to the link', function () {
        var transformed = broker.transformLink('/signin');
        assert.equal(transformed, '/oauth/signin');
      });
    });

  });
});


