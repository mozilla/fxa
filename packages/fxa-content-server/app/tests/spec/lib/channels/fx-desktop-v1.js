/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import chai from 'chai';
import FxDesktopV1Channel from 'lib/channels/fx-desktop-v1';
import WindowMock from '../../../mocks/window';

var assert = chai.assert;

describe('lib/channels/fx-desktop-v1', function() {
  var channel;
  var windowMock;

  beforeEach(function() {
    windowMock = new WindowMock();

    channel = new FxDesktopV1Channel();
    channel.initialize({
      origin: 'http://firstrun.mozilla.org',
      window: windowMock,
    });
  });

  describe('public interface', function() {
    it('supports send/request', function() {
      assert.isFunction(channel.send);
      assert.isFunction(channel.request);
    });
  });

  describe('createMessageId', function() {
    it('returns the command as the message id', function() {
      assert.equal(channel.createMessageId('command'), 'command');
    });
  });

  describe('parseMessage', function() {
    it('throws an error if the message is malformed', function() {
      assert.throws(function() {
        channel.parseMessage({});
      });
    });

    it('returns the parsed message', function() {
      var fixtureMessage = {
        content: {
          data: { dataKey: 'data_value' },
          key: 'value',
          status: 'ok',
        },
      };
      var expectedResult = {
        command: 'ok',
        data: { dataKey: 'data_value' },
        messageId: 'ok',
      };

      assert.deepEqual(channel.parseMessage(fixtureMessage), expectedResult);
    });
  });
});
