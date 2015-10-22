/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'sinon',
  'models/notifications',
  'lib/channels/null'
],
function (chai, sinon, Notifications, NullChannel) {
  'use strict';

  var assert = chai.assert;

  describe('models/notifications', function () {
    var NOTIFICATION = 'fxaccounts:delete';
    var notifications;
    var webChannelMock;
    var tabChannelMock;
    var iframeChannelMock;

    beforeEach(function () {
      webChannelMock = new NullChannel();
      tabChannelMock = new NullChannel();
      iframeChannelMock = new NullChannel();
      sinon.spy(webChannelMock, 'send');
      sinon.spy(tabChannelMock, 'send');
      sinon.spy(iframeChannelMock, 'send');

      sinon.spy(tabChannelMock, 'on');

      notifications = new Notifications({
        iframeChannel: iframeChannelMock,
        tabChannel: tabChannelMock,
        webChannel: webChannelMock
      });
    });

    it('listens on initialization', function () {
      assert.isTrue(tabChannelMock.on.called);
      assert.equal(tabChannelMock.on.args[0][0], NOTIFICATION);
    });

    it('emits events received from other tabs', function (done) {
      var message = {
        data: { uid: '123' },
        event: NOTIFICATION
      };
      notifications.on(NOTIFICATION, function (data) {
        try {
          assert.deepEqual(data, message);
        } catch (e) {
          return done(e);
        }
        done();
      });
      var callback = tabChannelMock.on.args[0][1];
      // manually trigger the event callback
      callback(message);
    });

    describe('broadcast', function () {
      it('broadcasts to all channels and triggers self', function () {
        var ev = 'some event';
        var data = { foo: 'bar' };
        var spy = sinon.spy();

        notifications.on(ev, spy);
        notifications.broadcast(ev, data);

        assert.isTrue(webChannelMock.send.calledWith(ev, data));
        assert.isTrue(tabChannelMock.send.calledWith(ev, data));
        assert.isTrue(iframeChannelMock.send.calledWith(ev, data));
        assert.isTrue(spy.called);
      });

      it('notifies profile image change', function () {
        var ev = notifications.EVENTS.PROFILE_CHANGE;
        var data = { foo: 'bar' };

        notifications.profileUpdated(data);

        assert.isTrue(webChannelMock.send.calledWith(ev, data));
        assert.isTrue(tabChannelMock.send.calledWith(ev, data));
        assert.isTrue(iframeChannelMock.send.calledWith(ev, data));
      });

      it('notifies account deletions', function () {
        var ev = notifications.EVENTS.DELETE;
        var data = { foo: 'bar' };

        notifications.accountDeleted(data);

        assert.isTrue(webChannelMock.send.calledWith(ev, data));
        assert.isTrue(tabChannelMock.send.calledWith(ev, data));
        assert.isTrue(iframeChannelMock.send.calledWith(ev, data));
      });
    });

    it('triggerRemote sends to all channels but does not trigger self', function () {
      var ev = 'some other event';
      var data = { baz: 'qux' };
      var spy = sinon.spy();

      notifications.on(ev, spy);
      notifications.triggerRemote(ev, data);

      assert.isTrue(webChannelMock.send.calledWith(ev, data));
      assert.isTrue(tabChannelMock.send.calledWith(ev, data));
      assert.isTrue(iframeChannelMock.send.calledWith(ev, data));
      assert.isFalse(spy.called);
    });
  });
});

