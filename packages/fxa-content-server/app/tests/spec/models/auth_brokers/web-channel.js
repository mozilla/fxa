/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'sinon',
  'models/auth_brokers/web-channel',
  'models/reliers/relier',
  'lib/promise',
  'lib/channels/null',
  'lib/session',
  'lib/auth-errors',
  'views/base',
  '../../../mocks/window'
],
function (chai, sinon, WebChannelAuthenticationBroker, Relier, p, NullChannel,
      Session, AuthErrors, BaseView, WindowMock) {
  var assert = chai.assert;

  describe('models/auth_brokers/web-channel', function () {
    var broker;
    var windowMock;
    var relierMock;
    var channelMock;

    beforeEach(function () {
      windowMock = new WindowMock();
      relierMock = new Relier();

      channelMock = new NullChannel();
      sinon.spy(channelMock, 'send');

      broker = new WebChannelAuthenticationBroker({
        window: windowMock,
        relier: relierMock,
        channel: channelMock,
        session: Session
      });
    });

    describe('fetch', function () {
      describe('for the signin/signup flow', function () {
        it('fetches the webChannelId from the query parameters', function () {
          windowMock.location.search = '?webChannelId=test';

          return broker.fetch()
            .then(function () {
              assert.equal(broker.get('webChannelId'), 'test');
            });
        });
      });

      describe('for the verification flow', function () {
        it('fetches the webChannelId from Session.oauth if it exists', function () {
          windowMock.location.search = '?code=code';
          Session.set('oauth', {
            webChannelId: 'test'
          });

          return broker.fetch()
            .then(function () {
              assert.equal(broker.get('webChannelId'), 'test');
            });
        });

        it('does not set webChannelId if Session.oauth does not exist', function () {
          windowMock.location.search = '?code=code';

          return broker.fetch()
            .then(function () {
              assert.isFalse(broker.has('webChannelId'));
            });
        });
      });
    });

    describe('sendOAuthResultToRelier', function () {
      it('prepares window to be closed', function () {
        return broker.sendOAuthResultToRelier({})
          .then(function () {
            assert.isTrue(channelMock.send.calledWith('oauth_complete', {
              closeWindow: true
            }));
          });
      });
    });

    describe('getChannel', function () {
      it('creates a WebChannel with the id set in the broker', function () {
        var broker = new WebChannelAuthenticationBroker({
          windowMock: windowMock,
          relier: relierMock
        });

        broker.set('webChannelId', 'test');

        var channel = broker.getChannel();
        assert.equal(channel.id, 'test');
      });
    });

    describe('afterSignIn', function () {
      it('calls sendOAuthResultToRelier', function () {
        var view = new BaseView({
          window: windowMock
        });

        sinon.stub(broker, 'getOAuthResult', function () {
          return p({});
        });

        sinon.stub(broker, 'sendOAuthResultToRelier', function () {
          return p();
        });

        sinon.spy(view, 'displayError');

        return broker.afterSignIn(view);
      });
    });
  });
});


