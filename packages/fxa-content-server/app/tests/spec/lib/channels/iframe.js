/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'sinon',
  'lib/channels/iframe',
  'lib/auth-errors',
  'lib/metrics',
  '../../../mocks/window',
  '../../../lib/helpers'
],
function (chai, sinon, IFrameChannel, AuthErrors, Metrics,
  WindowMock, TestHelpers) {
  var channel;
  var windowMock;
  var parentMock;
  var metrics;

  var assert = chai.assert;

  describe('lib/channels/iframe', function () {
    beforeEach(function () {
      windowMock = new WindowMock();
      parentMock = new WindowMock();
      windowMock.parent = parentMock;
      metrics = new Metrics();

      channel = new IFrameChannel();
      return channel.init({
        window: windowMock,
        origin: 'https://trusted-parent.org',
        metrics: metrics
      });
    });

    afterEach(function () {
      channel.teardown();
    });

    describe('send', function () {
      it('sends a message to the parent, at specified origin', function (done) {
        sinon.stub(parentMock, 'postMessage', function (msg, targetOrigin) {
          TestHelpers.wrapAssertion(function () {
            var parsed = IFrameChannel.parse(msg);
            var command = parsed.command;
            var data = parsed.data;

            assert.equal(command, 'ping');
            assert.equal(data.key, 'value');
            assert.equal(targetOrigin, 'https://trusted-parent.org');
          }, done);
        });

        channel.send('ping', { key: 'value' });
      });

      it('can send a message with no data', function (done) {
        sinon.stub(parentMock, 'postMessage', function (msg) {
          TestHelpers.wrapAssertion(function () {
            var parsed = IFrameChannel.parse(msg);
            var command = parsed.command;
            var data = parsed.data;

            assert.equal(command, 'ping');
            assert.equal(Object.keys(data).length, 0);
          }, done);
        });

        channel.send('ping');
      });

      it('prints a message to the console if there is no response', function (done) {
        // drop the message on the ground.
        sinon.stub(parentMock, 'postMessage', function () {
        });

        sinon.stub(windowMock, 'setTimeout', function (callback) {
          callback();
        });

        sinon.stub(windowMock.console, 'error', function () {
          done();
        });

        channel.send('ping', {});
      });

      it('returns any errors in `dispatchCommand`', function (done) {
        sinon.stub(channel, 'dispatchCommand', function () {
          throw new Error('uh oh');
        });

        channel.send('ping', {}, function (err) {
          TestHelpers.wrapAssertion(function () {
            assert.equal(err.message, 'uh oh');
          }, done);
        });
      });
    });

    describe('receiveMessage', function () {
      it('triggers an event if message is from trusted origin', function () {
        sinon.spy(channel, 'trigger');

        channel.receiveMessage({
          data: IFrameChannel.stringify('message_type', { key: 'value' }),
          origin: 'https://trusted-parent.org'
        });

        assert.isTrue(
          channel.trigger.calledWith('message_type', { key: 'value' }));
      });

      it('ignores and logs messages from untrusted origins', function () {
        sinon.spy(channel, 'trigger');
        sinon.spy(metrics, 'logError');

        channel.receiveMessage({
          data: IFrameChannel.stringify('message_type', { key: 'value' }),
          origin: 'https://untrusted-parent.org'
        });

        assert.equal(
          metrics.logError.args[0][0].context, 'https://untrusted-parent.org');
        assert.isFalse(channel.trigger.called);
      });

      it('can handle a malformed message', function () {
        var invalidMsg = '{';
        channel.receiveMessage({
          data: invalidMsg
        });
      });
    });

    describe('the full cycle', function () {
      it('calls the callback with the data received from the parentWindow', function (done) {
        channel.send('ping', {}, function (err, data) {
          TestHelpers.wrapAssertion(function () {
            assert.equal(data.key, 'value');
            assert.equal(data.origin, 'https://trusted-parent.org');
          }, done);
        });

        // synthesize receiving a message over postMessage
        var message = IFrameChannel.stringify('ping', { key: 'value' });
        channel.receiveMessage({
          data: message,
          origin: 'https://trusted-parent.org'
        });
      });
    });
  });
});
