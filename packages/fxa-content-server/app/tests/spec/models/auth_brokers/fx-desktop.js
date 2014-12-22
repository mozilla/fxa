/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'chai',
  'sinon',
  'underscore',
  'models/auth_brokers/fx-desktop',
  'models/user',
  'lib/constants',
  'lib/auth-errors',
  'lib/channels/null',
  'lib/promise',
  'lib/session',
  '../../../mocks/window'
], function (chai, sinon, _, FxDesktopAuthenticationBroker, User,
        Constants, AuthErrors, NullChannel, p, Session, WindowMock) {
  var assert = chai.assert;

  describe('models/auth_brokers/fx-desktop', function () {
    var windowMock;
    var channelMock;
    var broker;
    var user;
    var account;

    beforeEach(function () {
      windowMock = new WindowMock();
      channelMock = new NullChannel();
      user = new User();
      account = user.initAccount({
        email: 'testuser@testuser.com'
      });

      broker = new FxDesktopAuthenticationBroker({
        window: windowMock,
        channel: channelMock,
        session: Session
      });
    });

    describe('beforeSignIn', function () {
      it('is happy if the user clicks `yes`', function () {
        sinon.stub(channelMock, 'send', function (message, data, done) {
          if (message === 'can_link_account') {
            done(null, { data: { ok: true }});
          }
        });

        return broker.beforeSignIn('testuser@testuser.com');
      });

      it('throws a USER_CANCELED_LOGIN error if user rejects', function () {
        sinon.stub(channelMock, 'send', function (message, data, done) {
          if (message === 'can_link_account') {
            done(null, { data: {} });
          }
        });

        return broker.beforeSignIn('testuser@testuser.com')
          .then(function () {
            assert(false, 'should throw USER_CANCELED_LOGIN');
          }, function (err) {
            assert.isTrue(AuthErrors.is(err, 'USER_CANCELED_LOGIN'));
          });
      });

      it('swallows errors returned by the browser', function () {
        sinon.stub(channelMock, 'send', function (message, data, done) {
          if (message === 'can_link_account') {
            done(new Error('uh oh'));
          }
        });

        sinon.spy(console, 'error');

        return broker.beforeSignIn('testuser@testuser.com')
          .then(function () {
            assert.isTrue(console.error.called);
            console.error.restore();
          });
      });
    });

    describe('_notifyRelierOfLogin', function () {
      it('sends a `login` message to the channel', function () {
        var data;
        sinon.stub(channelMock, 'send', function (message, _data, done) {
          if (message === 'login') {
            data = _data;

            done(null);
          }
        });

        return broker._notifyRelierOfLogin(account)
          .then(function () {
            assert.equal(data.email, 'testuser@testuser.com');
            assert.isFalse(data.verifiedCanLinkAccount);
          });
      });
      it('sends a `login` message to the channel using current account data', function () {
        var data;
        sinon.stub(channelMock, 'send', function (message, _data, done) {
          if (message === 'login') {
            data = _data;

            done(null);
          }
        });

        return broker._notifyRelierOfLogin(account)
          .then(function () {
            assert.equal(data.email, 'testuser@testuser.com');
            assert.isFalse(data.verifiedCanLinkAccount);
          });
      });

      it('tells the window not to re-verify if the user can link accounts if the question has already been asked', function () {
        var data;
        sinon.stub(channelMock, 'send', function (message, _data, done) {
          if (message === 'can_link_account') {
            return done(null, { data: { ok: true }});
          } else if (message === 'login') {
            data = _data;
            return done(null);
          }
        });

        return broker.beforeSignIn('testuser@testuser.com')
          .then(function () {
            return broker._notifyRelierOfLogin(account);
          })
          .then(function () {
            assert.equal(data.email, 'testuser@testuser.com');
            assert.isTrue(data.verifiedCanLinkAccount);
          });
      });
    });

    describe('afterSignIn', function () {
      it('notifies the channel of login', function () {
        sinon.stub(broker, '_notifyRelierOfLogin', function () {
          return p();
        });

        return broker.afterSignIn(account)
          .then(function () {
            assert.isTrue(broker._notifyRelierOfLogin.calledWith(account));
          });
      });
    });

    describe('beforeSignUpConfirmationPoll', function () {
      it('notifies the channel of login', function () {
        sinon.stub(broker, '_notifyRelierOfLogin', function () {
          return p();
        });

        return broker.beforeSignUpConfirmationPoll(account)
          .then(function () {
            assert.isTrue(broker._notifyRelierOfLogin.calledWith(account));
          });
      });
    });

    describe('afterSignUpConfirmationPoll', function () {
      it('halts', function () {
        return broker.afterSignUpConfirmationPoll()
          .then(function (result) {
            assert.isTrue(result.halt);
          });
      });
    });

    describe('afterResetPasswordConfirmationPoll', function () {
      it('notifies the channel of login', function () {
        sinon.stub(broker, '_notifyRelierOfLogin', function () {
          return p();
        });

        return broker.afterResetPasswordConfirmationPoll()
          .then(function () {
            assert.isTrue(broker._notifyRelierOfLogin.called);
          });
      });
    });
  });
});
