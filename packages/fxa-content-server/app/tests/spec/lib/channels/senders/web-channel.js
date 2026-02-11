/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import sinon from 'sinon';
import WebChannelSender from 'lib/channels/senders/web-channel';
import WindowMock from '../../../../mocks/window';

let windowMock;
let sender;

describe('lib/channels/senders/web-channel', () => {
  beforeEach(() => {
    windowMock = new WindowMock();
    sender = new WebChannelSender();
    sender.initialize({
      webChannelId: 'channel_id',
      window: windowMock,
    });
  });

  afterEach(() => {
    sender.teardown();
  });

  function testStringifiedDetail(userAgent) {
    it('dispatches a CustomEvent with a stringified `detail` to the window', () => {
      windowMock.navigator.userAgent = userAgent;

      sinon.spy(windowMock, 'dispatchEvent');
      sinon.spy(windowMock, 'CustomEvent');

      var messageId = Date.now();
      return sender.send('ping', { key: 'value' }, messageId).then(() => {
        assert.isTrue(windowMock.dispatchEvent.called);

        var eventType = windowMock.CustomEvent.args[0][0];
        assert.equal(eventType, 'WebChannelMessageToChrome');

        var detail = windowMock.CustomEvent.args[0][1].detail;
        assert.isString(detail);

        var eventData = JSON.parse(detail);
        assert.equal(eventData.id, 'channel_id');
        assert.equal(eventData.message.messageId, messageId);
        assert.equal(eventData.message.command, 'ping');
        assert.equal(eventData.message.data.key, 'value');
      });
    });
  }

  function testNonStringifiedDetail(userAgent) {
    it('dispatches a CustomEvent with a non-stringified `detail` to the window', () => {
      windowMock.navigator.userAgent = userAgent;

      sinon.spy(windowMock, 'dispatchEvent');
      sinon.spy(windowMock, 'CustomEvent');

      var messageId = Date.now();
      return sender.send('ping', { key: 'value' }, messageId).then(() => {
        assert.isTrue(windowMock.dispatchEvent.called);

        var eventType = windowMock.CustomEvent.args[0][0];
        assert.equal(eventType, 'WebChannelMessageToChrome');

        var eventData = windowMock.CustomEvent.args[0][1].detail;
        assert.equal(eventData.id, 'channel_id');
        assert.equal(eventData.message.messageId, messageId);
        assert.equal(eventData.message.command, 'ping');
        assert.equal(eventData.message.data.key, 'value');
      });
    });
  }

  describe('send', () => {
    describe('Fx Desktop >= 50', () => {
      testStringifiedDetail(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:50.0) Gecko/20100101 Firefox/50.0'
      );
    });

    describe('Fx Desktop < 50', () => {
      testNonStringifiedDetail(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:49.0) Gecko/20100101 Firefox/49.0'
      );
    });

    describe('Fx Android >= 50', () => {
      testStringifiedDetail(
        'Mozilla/5.0 (Android 4.4; Mobile; rv:50.0) Gecko/50.0 Firefox/50.0'
      );
    });

    describe('Fx Android < 50', () => {
      testNonStringifiedDetail(
        'Mozilla/5.0 (Android 4.4; Mobile; rv:49.0) Gecko/49.0 Firefox/49.0'
      );
    });
  });

  describe('_saveEventForTests', () => {
    it('saves a dispatched command into sessionStorage if in test environment', () => {
      windowMock.navigator.userAgent = 'FxATester 68.0';

      sender._saveEventForTests('some:test', { foo: 'bar' });
      assert.equal(
        windowMock.sessionStorage.getItem('webChannelEvents'),
        '[{"command":"some:test","data":{"foo":"bar"}}]'
      );
      sender._saveEventForTests('some:othertest');
      assert.equal(
        windowMock.sessionStorage.getItem('webChannelEvents'),
        '[{"command":"some:test","data":{"foo":"bar"}},{"command":"some:othertest"}]'
      );
    });

    it('does not save dispatched command into sessionStorage in non-test environments', () => {
      // specifically setting a userAgent is necessary for tests to
      // pass on CircleCI under Selenium
      windowMock.navigator.userAgent =
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:72.0) Gecko/20100101 Firefox/72.0';
      windowMock.navigator.webdriver = false;

      sender._saveEventForTests('some:test');
      assert.isUndefined(windowMock.sessionStorage.getItem('webChannelEvents'));
      sender._saveEventForTests('some:othertest');
      assert.isUndefined(windowMock.sessionStorage.getItem('webChannelEvents'));
    });
  });
});
