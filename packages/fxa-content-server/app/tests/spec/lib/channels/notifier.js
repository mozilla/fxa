/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var Backbone = require('backbone');
  var chai = require('chai');
  var Notifier = require('lib/channels/notifier');
  var NullChannel = require('lib/channels/null');
  var sinon = require('sinon');

  var assert = chai.assert;

  describe('lib/channels/notifier', function () {
    var NOTIFICATION = Notifier.COMPLETE_RESET_PASSWORD_TAB_OPEN;

    var iframeChannelMock;
    var notifier;
    var tabChannelMock;
    var webChannelMock;

    beforeEach(function () {
      iframeChannelMock = new NullChannel();
      sinon.spy(iframeChannelMock, 'send');

      webChannelMock = new NullChannel();
      sinon.spy(webChannelMock, 'send');

      // Use a Backbone.Events based stub object so events
      // can be triggered on the mock for the tests. This will
      // require that `send` is mocked in.
      tabChannelMock = Object.create(Backbone.Events);
      tabChannelMock.send = sinon.spy();
      sinon.spy(tabChannelMock, 'on');


      notifier = new Notifier({
        iframeChannel: iframeChannelMock,
        tabChannel: tabChannelMock,
        webChannel: webChannelMock
      });
    });

    it('listens on initialization', function () {
      assert.equal(tabChannelMock.on.callCount,
                   Object.keys(Notifier.prototype.EVENTS).length);
    });

    it('emits events received from other tabs', function (done) {
      var message = {
        data: { uid: '123' },
        event: NOTIFICATION
      };

      notifier.on(NOTIFICATION, function (data) {
        try {
          assert.deepEqual(data, message);
        } catch (e) {
          return done(e);
        }
        done();
      });

      tabChannelMock.trigger(NOTIFICATION, message);
    });

    describe('triggerAll', function () {
      it('triggers events on all channels and self', function () {
        var ev = 'some event';
        var data = { foo: 'bar' };
        var spy = sinon.spy();

        notifier.on(ev, spy);
        notifier.triggerAll(ev, data);

        assert.isTrue(webChannelMock.send.calledWith(ev, data));
        assert.isTrue(tabChannelMock.send.calledWith(ev, data));
        assert.isTrue(iframeChannelMock.send.calledWith(ev, data));
        assert.isTrue(spy.called);
      });
    });

    it('triggerRemote triggers events on remote channels but not self', function () {
      var ev = 'some other event';
      var data = { baz: 'qux' };
      var spy = sinon.spy();

      notifier.on(ev, spy);
      notifier.triggerRemote(ev, data);

      assert.isTrue(webChannelMock.send.calledWith(ev, data));
      assert.isTrue(tabChannelMock.send.calledWith(ev, data));
      assert.isTrue(iframeChannelMock.send.calledWith(ev, data));
      assert.isFalse(spy.called);
    });
  });
});

