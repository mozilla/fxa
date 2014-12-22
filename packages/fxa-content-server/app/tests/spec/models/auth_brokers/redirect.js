/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'sinon',
  'lib/promise',
  'lib/session',
  'models/auth_brokers/redirect',
  'models/reliers/base',
  'models/user',
  '../../../mocks/window'
],
function (chai, sinon, p, Session, RedirectAuthenticationBroker,
    Relier, User, WindowMock) {
  var assert = chai.assert;
  var REDIRECT_TO = 'https://redirect.here';

  describe('models/auth_brokers/redirect', function () {
    var relier;
    var broker;
    var windowMock;
    var user;
    var account;

    beforeEach(function () {
      windowMock = new WindowMock();
      relier = new Relier();
      user = new User();
      account = user.initAccount({
        sessionToken: 'abc123'
      });

      broker = new RedirectAuthenticationBroker({
        relier: relier,
        window: windowMock,
        session: Session
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
            assert.include(windowMock.location.href, REDIRECT_TO);
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
            assert.isTrue(broker.finishOAuthFlow.calledWith(account));
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
            assert.isTrue(broker.finishOAuthFlow.calledWith(account));
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


