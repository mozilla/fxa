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
    var NOTIFICATION = 'profile:change';
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
        webChannel: webChannelMock,
        tabChannel: tabChannelMock,
        iframeChannel: iframeChannelMock
      });
    });

    it('listens on initialization', function () {
      assert.isTrue(tabChannelMock.on.called);
      assert.equal(tabChannelMock.on.args[0][0], NOTIFICATION);
    });

    it('emits events received from other tabs', function (done) {
      notifications.on(NOTIFICATION, function (data) {
        try {
          assert.equal(data.uid, '123');
        } catch (e) {
          return done(e);
        }
        done();
      });
      var message = {
        event: NOTIFICATION,
        data: { uid: '123' }
      };
      var callback = tabChannelMock.on.args[0][1];
      // manually trigger the event callback
      callback(message);
    });

    describe('broadcast', function () {
      it('broabcasts to all channels', function () {
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
    });

  });
});


