/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import chai from 'chai';
import FxDesktopV1Sender from 'lib/channels/senders/fx-desktop-v1';
import sinon from 'sinon';
import WindowMock from '../../../../mocks/window';

var windowMock;
var sender;

var assert = chai.assert;

describe('lib/channels/senders/fx-desktop-v1', function() {
  beforeEach(function() {
    windowMock = new WindowMock();
    sender = new FxDesktopV1Sender();
    sender.initialize({
      window: windowMock,
    });
  });

  afterEach(function() {
    sender.teardown();
  });

  describe('send', function() {
    it('dispatches a CustomEvent to the window', function() {
      sinon.spy(windowMock, 'dispatchEvent');
      sinon.spy(windowMock, 'CustomEvent');

      var messageId = Date.now();
      return sender.send('ping', { key: 'value' }, messageId).then(function() {
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
