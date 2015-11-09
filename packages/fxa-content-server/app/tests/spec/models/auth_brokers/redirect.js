/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var chai = require('chai');
  var Constants = require('lib/constants');
  var p = require('lib/promise');
  var RedirectAuthenticationBroker = require('models/auth_brokers/redirect');
  var Relier = require('models/reliers/base');
  var Session = require('lib/session');
  var sinon = require('sinon');
  var User = require('models/user');
  var WindowMock = require('../../../mocks/window');

  var assert = chai.assert;
  var REDIRECT_TO = 'https://redirect.here';

  describe('models/auth_brokers/redirect', function () {
    var account;
    var broker;
    var metrics;
    var relier;
    var user;
    var windowMock;

    beforeEach(function () {
      metrics = { flush: sinon.spy(p) };
      relier = new Relier();
      user = new User();
      windowMock = new WindowMock();

      account = user.initAccount({
        sessionToken: 'abc123'
      });
      broker = new RedirectAuthenticationBroker({
        metrics: metrics,
        relier: relier,
        session: Session,
        window: windowMock
      });

      sinon.stub(broker, 'finishOAuthFlow', function () {
        return p();
      });
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
      describe('with no error', function () {
        it('prepares window to be closed', function () {
          return broker.sendOAuthResultToRelier({
            redirect: REDIRECT_TO
          })
          .then(function () {
            assert.isTrue(metrics.flush.calledOnce);
            assert.lengthOf(metrics.flush.getCall(0).args, 0);
            assert.equal(windowMock.location.href, REDIRECT_TO);
          });
        });
      });

      describe('with an error', function () {
        it('appends an error query parameter', function () {
          return broker.sendOAuthResultToRelier({
            error: 'error',
            redirect: REDIRECT_TO
          })
          .then(function () {
            assert.isTrue(metrics.flush.calledOnce);
            assert.lengthOf(metrics.flush.getCall(0).args, 0);
            assert.include(windowMock.location.href, REDIRECT_TO);
            assert.include(windowMock.location.href, 'error=error');
          });
        });
      });

      describe('with an action', function () {
        it('appends an action query parameter', function () {
          var action = Constants.OAUTH_ACTION_SIGNIN;
          return broker.sendOAuthResultToRelier({
            action: action,
            redirect: REDIRECT_TO
          })
          .then(function () {
            assert.isTrue(metrics.flush.calledOnce);
            assert.lengthOf(metrics.flush.getCall(0).args, 0);
            assert.include(windowMock.location.href, REDIRECT_TO);
            assert.include(windowMock.location.href, 'action=' + action);
          });
        });
      });

      describe('with existing query parameters', function () {
        it('passes through existing parameters unchanged', function () {
          return broker.sendOAuthResultToRelier({
            error: 'error',
            redirect: REDIRECT_TO + '?test=param'
          })
          .then(function () {
            assert.isTrue(metrics.flush.calledOnce);
            assert.lengthOf(metrics.flush.getCall(0).args, 0);
            assert.include(windowMock.location.href, REDIRECT_TO);
            assert.include(windowMock.location.href, 'test=param');
            assert.include(windowMock.location.href, 'error=error');
          });
        });
      });
    });

    describe('persistVerificationData', function () {
      it('sets the Original Tab marker', function () {
        return broker.persistVerificationData(account)
          .then(function () {
            assert.isTrue(broker.isOriginalTab());
          });
      });
    });

    describe('finishOAuthFlow', function () {
      it('clears the original tab marker', function () {
        broker.finishOAuthFlow.restore();

        sinon.stub(broker, 'getOAuthResult', function () {
          return p({});
        });

        sinon.stub(broker, 'sendOAuthResultToRelier', function () {
          return p();
        });

        return broker.persistVerificationData(account)
          .then(function () {
            return broker.finishOAuthFlow(account);
          })
          .then(function () {
            assert.isTrue(broker.getOAuthResult.calledWith(account));
            assert.isFalse(broker.isOriginalTab());
          });
      });
    });

    describe('afterCompleteSignUp', function () {
      it('finishes the oauth flow if the user verifies in the original tab', function () {
        return broker.persistVerificationData(account)
          .then(function () {
            return broker.afterCompleteSignUp(account);
          })
          .then(function () {
            assert.isTrue(broker.finishOAuthFlow.calledWith(account, {
              action: Constants.OAUTH_ACTION_SIGNUP
            }));
          });
      });

      it('does not finish the oauth flow if the user verifies in another tab', function () {
        return broker.afterCompleteSignUp(account)
          .then(function () {
            assert.isFalse(broker.finishOAuthFlow.calledWith(account));
          });
      });
    });

    describe('afterCompleteResetPassword', function () {
      it('finishes the oauth flow if the user verifies in the original tab', function () {
        return broker.persistVerificationData(account)
          .then(function () {
            return broker.afterCompleteResetPassword(account);
          })
          .then(function () {
            assert.isTrue(broker.finishOAuthFlow.calledWith(account, {
              action: Constants.OAUTH_ACTION_SIGNIN
            }));
          });
      });

      it('does not finish the oauth flow if the user verifies in another tab', function () {
        return broker.afterCompleteResetPassword(account)
          .then(function () {
            assert.isFalse(broker.finishOAuthFlow.calledWith(account));
          });
      });
    });
  });
});


