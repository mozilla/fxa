/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'sinon',
  '../../../mocks/crosstab',
  'lib/channels/inter-tab'
], function (chai, sinon, CrossTabMock, InterTabChannel) {
  'use strict';

  describe('lib/channels/inter-tab', function () {
    var assert = chai.assert;

    var interTabChannel;
    var crossTabMock;

    beforeEach(function () {
      crossTabMock = new CrossTabMock();

      interTabChannel = new InterTabChannel({
        crosstab: crossTabMock
      });
    });

    afterEach(function () {
    });

    describe('send', function () {
      it('does not send a message if no other tab is ready', function () {
        sinon.stub(crossTabMock.util, 'tabCount', function () {
          return 1;
        });

        sinon.spy(crossTabMock, 'broadcast');

        interTabChannel.send('message');
        assert.isFalse(crossTabMock.broadcast.called);
      });

      it('send a message if another tab is ready', function () {
        sinon.stub(crossTabMock.util, 'tabCount', function () {
          return 2;
        });

        sinon.spy(crossTabMock, 'broadcast');

        interTabChannel.send('message');
        assert.isTrue(crossTabMock.broadcast.called);
      });

      it('does not blow up if the browser is not supported', function () {
        sinon.stub(crossTabMock.util, 'tabCount', function () {
          return 2;
        });

        sinon.stub(crossTabMock, 'broadcast', function () {
          throw new Error('unsupported browser');
        });

        interTabChannel.send('message');
      });
    });

    describe('on', function () {
      it('register a callback to be called when a message is sent', function () {
        sinon.spy(crossTabMock.util.events, 'on');
        var key = interTabChannel.on('message', function () {});

        assert.isTrue(crossTabMock.util.events.on.called);
        assert.ok(key);
      });
    });

    describe('off', function () {
      it('unregister a callback to be called when a message is sent', function () {
        sinon.spy(crossTabMock.util.events, 'off');

        var callback = function () {};
        var key = interTabChannel.on('message', callback);
        interTabChannel.off('message', key);

        assert.isTrue(
          crossTabMock.util.events.off.calledWith('message', key));
      });
    });

    describe('clearMessages', function () {
      it('clears all stored messages', function () {
        sinon.spy(crossTabMock.util, 'clearMessages');
        interTabChannel.clearMessages();

        assert.isTrue(crossTabMock.util.clearMessages.called);
      });
    });
  });
});


