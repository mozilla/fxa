/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var chai = require('chai');
  var FxDesktopV1Sender = require('lib/channels/senders/fx-desktop-v1');
  var sinon = require('sinon');
  var WindowMock = require('../../../../mocks/window');

  var windowMock;
  var sender;

  var assert = chai.assert;

  describe('lib/channels/senders/fx-desktop-v1', function () {
    beforeEach(function () {
      windowMock = new WindowMock();
      sender = new FxDesktopV1Sender();
      sender.initialize({
        window: windowMock
      });
    });

    afterEach(function () {
      sender.teardown();
    });

    describe('send', function () {
      it('dispatches a CustomEvent to the window', function () {
        sinon.spy(windowMock, 'dispatchEvent');
        sinon.spy(windowMock, 'CustomEvent');

        var messageId = Date.now();
        return sender.send('ping', { key: 'value' }, messageId)
          .then(function () {
            assert.isTrue(windowMock.dispatchEvent.called);

            var eventType = windowMock.CustomEvent.args[0][0];
            assert.equal(eventType, 'FirefoxAccountsCommand');

            var eventData = windowMock.CustomEvent.args[0][1].detail;
            assert.equal(eventData.bubbles, true);
            assert.equal(eventData.command, 'ping');
            assert.equal(eventData.data.key, 'value');
          });
      });
    });
  });
});
