/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'chai',
  'sinon',
  'underscore',
  'models/auth_brokers/fx-desktop',
  'models/reliers/relier',
  'lib/constants',
  'lib/auth-errors',
  'lib/channels/null',
  'lib/promise',
  'lib/session',
  '../../../mocks/window'
], function (chai, sinon, _, FxDesktopAuthenticationBroker, Relier, Constants,
        AuthErrors, NullChannel, p, Session, WindowMock) {
  var assert = chai.assert;

  describe('models/auth_brokers/fx-desktop', function () {
    var windowMock;
    var relierMock;
    var channelMock;
    var broker;

    beforeEach(function () {
      windowMock = new WindowMock();
      relierMock = new Relier();
      channelMock = new NullChannel();

      broker = new FxDesktopAuthenticationBroker({
        window: windowMock,
        relier: relierMock,
        channel: channelMock,
        session: Session
      });
    });

    describe('fetch', function () {
      it('does nothing if verifying an email', function () {
        windowMock.location.search = '?code=code&service=sync';

        sinon.stub(channelMock, 'send', function () { });

        return broker.fetch()
          .then(function () {
            assert.isFalse(channelMock.send.called);
          });
      });

      it('sets up the email, if returned by the browser', function () {
        windowMock.location.search = '?context=fx_desktop_v1&service=sync';

        sinon.stub(channelMock, 'send', function (message, data, done) {
          if (message === 'session_status') {
            return done(null, {
              data: {
                email: 'testuser@testuser.com'
              }
            });
          }
        });

        return broker.fetch()
          .then(function () {
            assert.equal(Session.email, 'testuser@testuser.com');
          });
      });

      it('clears the session if the browser does not respond', function () {
        windowMock.location.search = '?context=fx_desktop_v1&service=sync';

        sinon.stub(channelMock, 'send', function (message, data, done) {
          if (message === 'session_status') {
            return done(null, {
              data: null
            });
          }
        });

        Session.set('email', 'testuser@testuser.com');
        return broker.fetch()
          .then(function () {
            assert.isUndefined(Session.email);
          });
      });

      it('clears the session if in forceAuth', function () {
        windowMock.location.search = '?context=fx_desktop_v1&service=sync';
        sinon.stub(broker, 'isForceAuth', function () {
          return true;
        });

        sinon.stub(channelMock, 'send', function (message, data, done) {
          if (message === 'session_status') {
            return done(null, {
              data: {
                email: 'testuser@testuser.com'
              }
            });
          }
        });

        Session.set('email', 'testuser@testuser.com');
        return broker.fetch()
          .then(function () {
            assert.isUndefined(Session.email);
          });
      });
    });

    describe('selectStartPage', function () {
      it('returns /settings if is signed in', function () {
        windowMock.location.search = '?context=fx_desktop_v1&service=sync';
        windowMock.location.pathname = '/';
        sinon.stub(channelMock, 'send', function (message, data, done) {
          if (message === 'session_status') {
            return done(null, {
              data: {
                email: 'testuser@testuser.com'
              }
            });
          }
        });

        return broker.fetch()
            .then(_.bind(broker.selectStartPage, broker))
            .then(function (page) {
              assert.equal(page, 'settings');
            });
      });

      it('returns /signup if no email is set, and no pathname is specified', function () {
        sinon.stub(channelMock, 'send', function (message, data, done) {
          if (message === 'session_status') {
            return done(null, {
              data: {}
            });
          }
        });

        return broker.fetch()
            .then(_.bind(broker.selectStartPage, broker))
            .then(function (page) {
              assert.equal(page, 'signup');
            });
      });

      it('returns /force_auth if /force_auth was loaded up', function () {
        sinon.stub(broker, 'isForceAuth', function () {
          return true;
        });

        sinon.stub(channelMock, 'send', function (message, data, done) {
          if (message === 'session_status') {
            return done(null, {
              data: {}
            });
          }
        });

        return broker.fetch()
            .then(_.bind(broker.selectStartPage, broker))
            .then(function (page) {
              assert.equal(page, 'force_auth');
            });
      });

      it('returns nothing if a route is present in the path', function () {
        windowMock.location.pathname = '/signin';

        sinon.stub(channelMock, 'send', function (message, data, done) {
          if (message === 'session_status') {
            return done(null, {
              data: {}
            });
          }
        });

        return broker.fetch()
            .then(_.bind(broker.selectStartPage, broker))
            .then(function (page) {
              assert.isUndefined(page);
            });
      });
    });

    describe('checkCanLinkAccount', function () {
      it('is happy if the user clicks `yes`', function () {
        sinon.stub(channelMock, 'send', function (message, data, done) {
          if (message === 'can_link_account') {
            done(null, { data: { ok: true }});
          }
        });

        return broker.checkCanLinkAccount('testuser@testuser.com');
      });

      it('throws a USER_CANCELED_LOGIN error if user rejects', function () {
        sinon.stub(channelMock, 'send', function (message, data, done) {
          if (message === 'can_link_account') {
            done(null, { data: {} });
          }
        });

        return broker.checkCanLinkAccount('testuser@testuser.com')
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

        return broker.checkCanLinkAccount('testuser@testuser.com')
          .then(function () {
            assert.isTrue(console.error.called);
            console.error.restore();
          });
      });
    });

    describe('notifyOfLogin', function () {
      it('sends a `login` message to the channel', function () {
        var data;
        sinon.stub(channelMock, 'send', function (message, _data, done) {
          if (message === 'login') {
            data = _data;

            done(null);
          }
        });

        Session.set('email', 'testuser@testuser.com');
        return broker.notifyOfLogin()
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

        Session.set('email', 'testuser@testuser.com');
        return broker.checkCanLinkAccount('testuser@testuser.com')
          .then(function () {
            return broker.notifyOfLogin();
          })
          .then(function () {
            assert.equal(data.email, 'testuser@testuser.com');
            assert.isTrue(data.verifiedCanLinkAccount);
          });
      });
    });

    describe('afterSignIn', function () {
      it('notifies the channel of login', function () {
        sinon.stub(broker, 'notifyOfLogin', function () {
          return p();
        });

        return broker.afterSignIn()
          .then(function () {
            assert.isTrue(broker.notifyOfLogin.called);
          });
      });
    });

    describe('shouldShowSettingsAfterSignIn', function () {
      it('should return false, the browser is notified and will show its own screen', function () {
        assert.isFalse(broker.shouldShowSettingsAfterSignIn());
      });
    });

    describe('afterSignUpConfirmationPoll', function () {
      it('notifies the channel of login', function () {
        sinon.stub(broker, 'notifyOfLogin', function () {
          return p();
        });

        return broker.afterSignUpConfirmationPoll()
          .then(function () {
            assert.isTrue(broker.notifyOfLogin.called);
          });
      });
    });

    describe('afterResetPasswordConfirmationPoll', function () {
      it('notifies the channel of login', function () {
        sinon.stub(broker, 'notifyOfLogin', function () {
          return p();
        });

        return broker.afterResetPasswordConfirmationPoll()
          .then(function () {
            assert.isTrue(broker.notifyOfLogin.called);
          });
      });
    });

    describe('shouldShowResetPasswordCompleteAfterPoll', function () {
      it('should return false, the browser is notified and will show its own screen', function () {
        assert.isFalse(broker.shouldShowResetPasswordCompleteAfterPoll());
      });
    });

  });
});
