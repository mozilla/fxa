/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const { assert } = require('chai');
  const Constants = require('lib/constants');
  const RedirectAuthenticationBroker = require('models/auth_brokers/oauth-redirect');
  const Relier = require('models/reliers/base');
  const Session = require('lib/session');
  const sinon = require('sinon');
  const User = require('models/user');
  const WindowMock = require('../../../mocks/window');

  var REDIRECT_TO = 'https://redirect.here';

  describe('models/auth_brokers/redirect', () => {
    var account;
    var broker;
    var metrics;
    var relier;
    var user;
    var windowMock;

    beforeEach(() => {
      metrics = {
        flush: sinon.spy(() => Promise.resolve()),
        logEvent: () => {}
      };
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
      broker.DELAY_BROKER_RESPONSE_MS = 0;

      sinon.stub(broker, 'finishOAuthFlow').callsFake(() => {
        return Promise.resolve();
      });
    });

    it('has the `signup` capability by default', () => {
      assert.isTrue(broker.hasCapability('signup'));
    });

    it('does not have the `handleSignedInNotification` capability by default', () => {
      assert.isFalse(broker.hasCapability('handleSignedInNotification'));
    });

    it('has the `emailVerificationMarketingSnippet` capability by default', () => {
      assert.isTrue(broker.hasCapability('emailVerificationMarketingSnippet'));
    });

    describe('sendOAuthResultToRelier', () => {
      describe('with no error', () => {
        it('prepares window to be closed', () => {
          return broker.sendOAuthResultToRelier({
            redirect: REDIRECT_TO
          })
          .then(() => {
            assert.isTrue(metrics.flush.calledOnce);
            assert.lengthOf(metrics.flush.getCall(0).args, 0);
            assert.equal(windowMock.location.href, REDIRECT_TO);
          });
        });
      });

      describe('with an error', () => {
        it('appends an error query parameter', () => {
          return broker.sendOAuthResultToRelier({
            error: 'error',
            redirect: REDIRECT_TO
          })
          .then(() => {
            assert.isTrue(metrics.flush.calledOnce);
            assert.lengthOf(metrics.flush.getCall(0).args, 0);
            assert.include(windowMock.location.href, REDIRECT_TO);
            assert.include(windowMock.location.href, 'error=error');
          });
        });
      });

      describe('with an action', () => {
        it('appends an action query parameter', () => {
          var action = Constants.OAUTH_ACTION_SIGNIN;
          return broker.sendOAuthResultToRelier({
            action: action,
            redirect: REDIRECT_TO
          })
          .then(() => {
            assert.isTrue(metrics.flush.calledOnce);
            assert.lengthOf(metrics.flush.getCall(0).args, 0);
            assert.include(windowMock.location.href, REDIRECT_TO);
            assert.include(windowMock.location.href, 'action=' + action);
          });
        });
      });

      describe('with existing query parameters', () => {
        it('passes through existing parameters unchanged', () => {
          return broker.sendOAuthResultToRelier({
            error: 'error',
            redirect: REDIRECT_TO + '?test=param'
          })
          .then(() => {
            assert.isTrue(metrics.flush.calledOnce);
            assert.lengthOf(metrics.flush.getCall(0).args, 0);
            assert.include(windowMock.location.href, REDIRECT_TO);
            assert.include(windowMock.location.href, 'test=param');
            assert.include(windowMock.location.href, 'error=error');
          });
        });
      });
    });

    describe('persistVerificationData', () => {
      it('sets the Original Tab marker', () => {
        return broker.persistVerificationData(account)
          .then(() => {
            assert.isTrue(broker.isOriginalTab());
          });
      });
    });

    describe('finishOAuthFlow', () => {
      it('clears the original tab marker', () => {
        broker.finishOAuthFlow.restore();

        sinon.stub(broker, 'getOAuthResult').callsFake(() => {
          return Promise.resolve({});
        });

        sinon.stub(broker, 'sendOAuthResultToRelier').callsFake(() => {
          return Promise.resolve();
        });

        return broker.persistVerificationData(account)
          .then(() => {
            return broker.finishOAuthFlow(account);
          })
          .then(() => {
            assert.isTrue(broker.getOAuthResult.calledWith(account));
            assert.isFalse(broker.isOriginalTab());
          });
      });
    });

    describe('afterCompleteSignUp', () => {
      it('finishes the oauth flow if the user verifies in the original tab', () => {
        return broker.persistVerificationData(account)
          .then(() => {
            return broker.afterCompleteSignUp(account);
          })
          .then(() => {
            assert.isTrue(broker.finishOAuthFlow.calledWith(account, {
              action: Constants.OAUTH_ACTION_SIGNUP
            }));
          });
      });

      it('does not finish the oauth flow if the user verifies in another tab', () => {
        return broker.afterCompleteSignUp(account)
          .then(() => {
            assert.isFalse(broker.finishOAuthFlow.calledWith(account));
          });
      });
    });

    describe('afterCompleteResetPassword', () => {
      it('finishes the oauth flow if the user verifies in the original tab', () => {
        return broker.persistVerificationData(account)
          .then(() => {
            return broker.afterCompleteResetPassword(account);
          })
          .then(() => {
            assert.isTrue(broker.finishOAuthFlow.calledWith(account, {
              action: Constants.OAUTH_ACTION_SIGNIN
            }));
          });
      });

      it('does not finish the oauth flow if the user verifies in another tab', () => {
        return broker.afterCompleteResetPassword(account)
          .then(() => {
            assert.isFalse(broker.finishOAuthFlow.calledWith(account));
          });
      });
    });
  });
});


