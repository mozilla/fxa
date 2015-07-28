/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'sinon',
  'models/auth_brokers/fx-desktop',
  'models/user',
  'lib/auth-errors',
  'lib/channels/null',
  'lib/promise',
  '../../../mocks/window'
], function (chai, sinon, FxDesktopAuthenticationBroker, User,
        AuthErrors, NullChannel, p, WindowMock) {
  'use strict';

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
      channelMock.send = function () {
        return p();
      };
      channelMock.request = function () {
        return p();
      };

      user = new User();
      account = user.initAccount({
        email: 'testuser@testuser.com'
      });

      broker = new FxDesktopAuthenticationBroker({
        window: windowMock,
        channel: channelMock
      });
    });

    describe('afterLoaded', function () {
      it('sends a `loaded` message', function () {
        sinon.spy(channelMock, 'send');
        return broker.afterLoaded()
          .then(function () {
            assert.isTrue(channelMock.send.calledWith('loaded'));
          });
      });
    });

    describe('beforeSignIn', function () {
      it('is happy if the user clicks `yes`', function () {
        sinon.stub(channelMock, 'request', function () {
          return p({ ok: true });
        });

        return broker.beforeSignIn('testuser@testuser.com')
          .then(function () {
            assert.isTrue(channelMock.request.calledWith('can_link_account'));
          });
      });

      it('throws a USER_CANCELED_LOGIN error if user rejects', function () {
        sinon.stub(channelMock, 'request', function () {
          return p({ data: {}});
        });

        return broker.beforeSignIn('testuser@testuser.com')
          .then(assert.fail, function (err) {
            assert.isTrue(AuthErrors.is(err, 'USER_CANCELED_LOGIN'));
            assert.isTrue(channelMock.request.calledWith('can_link_account'));
          });
      });

      it('swallows errors returned by the browser', function () {
        sinon.stub(channelMock, 'request', function () {
          return p.reject(new Error('uh oh'));
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
        sinon.spy(channelMock, 'send');

        return broker._notifyRelierOfLogin(account)
          .then(function () {
            assert.isTrue(channelMock.send.calledWith('login'));

            var data = channelMock.send.args[0][1];
            assert.equal(data.email, 'testuser@testuser.com');
            assert.isFalse(data.verified);
            assert.isFalse(data.verifiedCanLinkAccount);
          });
      });

      it('sends a `login` message to the channel using current account data', function () {
        sinon.spy(channelMock, 'send');

        return broker._notifyRelierOfLogin(account)
          .then(function () {
            assert.isTrue(channelMock.send.calledWith('login'));

            var data = channelMock.send.args[0][1];
            assert.equal(data.email, 'testuser@testuser.com');
            assert.isFalse(data.verified);
            assert.isFalse(data.verifiedCanLinkAccount);
          });
      });

      it('tells the window not to re-verify if the user can link accounts if the question has already been asked', function () {
        sinon.stub(channelMock, 'send', function (message) {
          if (message === 'can_link_account') {
            return p({ data: { ok: true }});
          } else if (message === 'login') {
            return p();
          }
        });

        return broker.beforeSignIn('testuser@testuser.com')
          .then(function () {
            return broker._notifyRelierOfLogin(account);
          })
          .then(function () {
            assert.equal(channelMock.send.args[0][0], 'login');
            var data = channelMock.send.args[0][1];
            assert.equal(data.email, 'testuser@testuser.com');
            assert.isFalse(data.verified);
            assert.isTrue(data.verifiedCanLinkAccount);
          });
      });

      it('indicates whether the account is verified', function () {
        // set account as verified
        account.set('verified', true);

        sinon.stub(channelMock, 'send', function (message) {
          if (message === 'can_link_account') {
            return p({ data: { ok: true }});
          } else if (message === 'login') {
            return p();
          }
        });

        return broker.beforeSignIn('testuser@testuser.com')
          .then(function () {
            return broker._notifyRelierOfLogin(account);
          })
          .then(function () {
            var data = channelMock.send.args[0][1];
            assert.isTrue(data.verified);
          });
      });
    });

    describe('afterSignIn', function () {
      it('notifies the channel of login, halts by default', function () {
        sinon.spy(broker, 'send');
        account.set({
          uid: 'uid',
          sessionToken: 'session_token',
          sessionTokenContext: 'sync',
          unwrapBKey: 'unwrap_b_key',
          keyFetchToken: 'key_fetch_token',
          customizeSync: true,
          verified: true,
          notSent: 'not_sent'
        });

        return broker.afterSignIn(account)
          .then(function (result) {

            var args = broker.send.args[0];
            assert.equal(args[0], 'login');
            assert.equal(args[1].email, 'testuser@testuser.com');
            assert.equal(args[1].uid, 'uid');
            assert.equal(args[1].sessionToken, 'session_token');
            assert.equal(args[1].unwrapBKey, 'unwrap_b_key');
            assert.equal(args[1].customizeSync, true);
            assert.equal(args[1].verified, true);
            assert.isUndefined(args[1].sessionTokenContext);

            assert.isTrue(result.halt);
          });
      });

      it('does not halt with `haltAfterSignIn: false`', function () {
        broker = new FxDesktopAuthenticationBroker({
          channel: channelMock,
          haltAfterSignIn: false,
          window: windowMock,
        });

        return broker.afterSignIn(account)
          .then(function (result) {
            assert.isFalse(result.halt);
          });
      });
    });

    describe('beforeSignUpConfirmationPoll', function () {
      it('notifies the channel of login, halts the flow by default', function () {
        sinon.spy(broker, 'send');

        return broker.beforeSignUpConfirmationPoll(account)
          .then(function (result) {
            assert.isTrue(broker.send.calledWith('login'));
            assert.isTrue(result.halt);
          });
      });

      it('does not halt with `haltBeforeSignUpConfirmationPoll: false`', function () {
        broker = new FxDesktopAuthenticationBroker({
          channel: channelMock,
          haltBeforeSignUpConfirmationPoll: false,
          window: windowMock
        });

        return broker.beforeSignUpConfirmationPoll(account)
          .then(function (result) {
            assert.isFalse(result.halt);
          });
      });
    });

    describe('afterResetPasswordConfirmationPoll', function () {
      it('notifies the channel of login, halts by default', function () {
        sinon.spy(broker, 'send');

        return broker.afterResetPasswordConfirmationPoll(account)
          .then(function (result) {
            assert.isTrue(broker.send.calledWith('login'));
            assert.isTrue(result.halt);
          });
      });

      it('does not halt with `haltAfterResetPasswordConfirmationPoll: false`', function () {
        broker = new FxDesktopAuthenticationBroker({
          channel: channelMock,
          haltAfterResetPasswordConfirmationPoll: false,
          window: windowMock
        });

        return broker.afterResetPasswordConfirmationPoll(account)
          .then(function (result) {
            assert.isFalse(result.halt);
          });
      });
    });

    describe('afterChangePassword', function () {
      it('notifies the channel of change_password with the new login info', function () {
        sinon.spy(broker, 'send');

        account.set({
          uid: 'uid',
          sessionToken: 'session_token',
          sessionTokenContext: 'sync',
          unwrapBKey: 'unwrap_b_key',
          keyFetchToken: 'key_fetch_token',
          customizeSync: true,
          verified: true,
          notSent: 'not_sent'
        });

        return broker.afterChangePassword(account)
          .then(function () {
            var args = broker.send.args[0];
            assert.equal(args[0], 'change_password');
            assert.equal(args[1].email, 'testuser@testuser.com');
            assert.equal(args[1].uid, 'uid');
            assert.equal(args[1].sessionToken, 'session_token');
            assert.equal(args[1].unwrapBKey, 'unwrap_b_key');
            assert.equal(args[1].customizeSync, true);
            assert.equal(args[1].verified, true);
            assert.isFalse('notSent' in args[1]);
            assert.isUndefined(args[1].sessionTokenContext);
          });
      });
    });

    describe('afterDeleteAccount', function () {
      it('notifies the channel of delete_account', function () {
        sinon.spy(broker, 'send');

        account.set('uid', 'uid');

        return broker.afterDeleteAccount(account)
          .then(function () {
            var args = broker.send.args[0];
            assert.equal(args[0], 'delete_account');
            assert.equal(args[1].email, 'testuser@testuser.com');
            assert.equal(args[1].uid, 'uid');
          });
      });
    });

    describe('getChannel', function () {
      it('creates a channel if not already available', function () {
        delete broker._channel;
        assert.ok(broker.getChannel());
      });
    });

    describe('channel errors', function () {
      it('are propagated outwards', function () {
        var channel = broker.createChannel();

        var errorSpy = sinon.spy();
        broker.on('error', errorSpy);

        var error = new Error('malformed message');
        channel.trigger('error', error);
        assert.isTrue(errorSpy.calledWith(error));
      });
    });
  });
});

