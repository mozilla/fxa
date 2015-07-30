/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'sinon',
  'lib/promise',
  'lib/constants',
  'lib/session',
  'models/auth_brokers/redirect',
  'models/reliers/base',
  'models/user',
  '../../../mocks/window'
],
function (chai, sinon, p, Constants, Session, RedirectAuthenticationBroker,
    Relier, User, WindowMock) {
  'use strict';

  var assert = chai.assert;
  var REDIRECT_TO = 'https://redirect.here';

  describe('models/auth_brokers/redirect', function () {
    var relier;
    var broker;
    var windowMock;
    var user;
    var account;
    var metrics;

    beforeEach(function () {
      windowMock = new WindowMock();
      relier = new Relier();
      user = new User();
      account = user.initAccount({
        sessionToken: 'abc123'
      });

      metrics = { flush: sinon.spy(p) };

      broker = new RedirectAuthenticationBroker({
        relier: relier,
        window: windowMock,
        session: Session,
        metrics: metrics
      });

      sinon.stub(broker, 'finishOAuthFlow', function () {
        return p();
      });
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
            redirect: REDIRECT_TO,
            error: 'error'
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
            redirect: REDIRECT_TO,
            action: action
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
            redirect: REDIRECT_TO + '?test=param',
            error: 'error'
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

    describe('persist', function () {
      it('sets the Original Tab marker', function () {
        return broker.persist()
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

        return broker.persist()
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
        return broker.persist()
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
        return broker.persist()
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


