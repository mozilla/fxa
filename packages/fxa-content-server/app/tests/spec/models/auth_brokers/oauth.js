/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'sinon',
  'lib/session',
  'lib/promise',
  'lib/oauth-client',
  'lib/assertion',
  'lib/auth-errors',
  'lib/oauth-errors',
  'models/reliers/relier',
  'models/auth_brokers/oauth'
],
function (chai, sinon, Session, p, OAuthClient, Assertion, AuthErrors,
      OAuthErrors, Relier, OAuthAuthenticationBroker) {
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
  var BASE_REDIRECT_URL = 'http://127.0.0.1:8080/api/oauth';
  var VALID_OAUTH_CODE_REDIRECT_URL = 'https://127.0.0.1:8080?state=state&code=' + VALID_OAUTH_CODE;
  var INVALID_OAUTH_CODE_REDIRECT_URL = 'https://127.0.0.1:8080?code=code&state=state';

  describe('models/auth_brokers/oauth', function () {
    var broker;
    var oAuthClient;
    var assertionLibrary;
    var relier;

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
        webChannelId: 'webChannelId',
        clientId: 'clientId',
        state: 'state',
        scope: 'scope',
        action: 'action'
      });


      broker = new OAuthAuthenticationBroker({
        session: Session,
        assertionLibrary: assertionLibrary,
        oAuthClient: oAuthClient,
        oAuthUrl: BASE_REDIRECT_URL,
        relier: relier
      });
    });

    describe('finishOAuthFlow', function () {
      it('must be overridden', function () {
        return broker.finishOAuthFlow()
          .then(assert.fail, function (err) {
            assert.ok(err);
          });
      });
    });

    describe('afterSignIn', function () {
      it('calls finishOAuthFlow with the correct options', function () {
        sinon.stub(broker, 'finishOAuthFlow', function () {
          return p();
        });

        return broker.afterSignIn()
          .then(function () {
            assert.isTrue(broker.finishOAuthFlow.calledWith({
              redirect:  VALID_OAUTH_CODE_REDIRECT_URL,
              state: 'state',
              code: VALID_OAUTH_CODE
            }, 'signin'));
          });
      });
    });

    describe('beforeSignUpConfirmationPoll', function () {
      it('saves OAuth params to session', function () {
        return broker.beforeSignUpConfirmationPoll()
          .then(function () {
            assert.ok(!! Session.oauth);
          });
      });
    });

    describe('afterSignUpConfirmationPoll', function () {
      it('calls finishOAuthFlow with the correct options', function () {
        sinon.stub(broker, 'finishOAuthFlow', function () {
          return p();
        });

        return broker.afterSignUpConfirmationPoll()
          .then(function () {
            assert.isTrue(broker.finishOAuthFlow.calledWith({
              redirect:  VALID_OAUTH_CODE_REDIRECT_URL,
              state: 'state',
              code: VALID_OAUTH_CODE
            }, 'signup'));
          });
      });
    });

    describe('afterSignUpVerified', function () {
      it('for future use', function () {
        sinon.spy(broker, 'finishOAuthFlow');

        return broker.afterSignUpVerified();
      });
    });

    describe('beforeResetPasswordConfirmationPoll', function () {
      it('saves OAuth params to session', function () {
        return broker.beforeResetPasswordConfirmationPoll()
          .then(function () {
            assert.ok(!! Session.oauth);
          });
      });
    });


    describe('afterResetPasswordConfirmationPoll', function () {
      it('calls finishOAuthFlow with the expected options', function () {
        sinon.stub(broker, 'finishOAuthFlow', function () {
          return p();
        });

        return broker.afterResetPasswordConfirmationPoll()
          .then(function () {
            assert.isTrue(broker.finishOAuthFlow.calledWith({
              redirect:  VALID_OAUTH_CODE_REDIRECT_URL,
              state: 'state',
              code: VALID_OAUTH_CODE
            }, 'reset_password'));
          });
      });
    });

    describe('getOAuthResult', function () {
      it('gets an object with the OAuth login information', function () {
        return broker.getOAuthResult()
          .then(function (result) {
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

        return broker.getOAuthResult()
          .then(assert.fail, function (err) {
            assert.equal(err.message, 'uh oh');
          });
      });

      it('passes on errors from oAuthClient.getCode', function () {
        oAuthClient.getCode.restore();
        sinon.stub(oAuthClient, 'getCode', function () {
          return p.reject(new Error('uh oh'));
        });

        return broker.getOAuthResult()
          .then(assert.fail, function (err) {
            assert.equal(err.message, 'uh oh');
          });
      });

      it('throws an error if oAuthClient.getCode returns nothing', function () {
        oAuthClient.getCode.restore();
        sinon.stub(oAuthClient, 'getCode', function () {
          return;
        });

        return broker.getOAuthResult()
          .then(assert.fail, function (err) {
            assert.isTrue(OAuthErrors.is(err, 'INVALID_RESULT'));
          });
      });

      it('throws an error if oAuthClient.getCode returns an empty object', function () {
        oAuthClient.getCode.restore();
        sinon.stub(oAuthClient, 'getCode', function () {
          return {};
        });

        return broker.getOAuthResult()
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

        return broker.getOAuthResult()
          .then(assert.fail, function (err) {
            assert.isTrue(OAuthErrors.is(err, 'INVALID_RESULT_CODE'));
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


