/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'sinon',
  'lib/channels/iframe',
  'lib/auth-errors',
  '../../../mocks/window',
  '../../../lib/helpers'
],
function (chai, sinon, IFrameChannel, AuthErrors, WindowMock, TestHelpers) {
  var channel;
  var windowMock;
  var parentMock;

  var assert = chai.assert;

  describe('lib/channels/iframe', function () {
    beforeEach(function () {
      windowMock = new WindowMock();
      parentMock = new WindowMock();
      windowMock.parent = parentMock;

      channel = new IFrameChannel();
      return channel.init({
        window: windowMock
      });
    });

    afterEach(function () {
      channel.teardown();
    });

    describe('send', function () {
      it('sends a message to the parent', function (done) {
        sinon.stub(parentMock, 'postMessage', function (msg, targetOrigin) {
          TestHelpers.wrapAssertion(function () {
            var parsed = IFrameChannel.parse(msg);
            var command = parsed.command;
            var data = parsed.data;

            assert.equal(command, 'ping');
            assert.equal(data.key, 'value');
            assert.ok(targetOrigin);
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

      it('times out if there is no response', function (done) {
        // drop the message on the ground.
        sinon.stub(parentMock, 'postMessage', function () {
        });

        sinon.stub(windowMock, 'setTimeout', function (callback) {
          callback();
        });

        channel.send('ping', {}, function (err) {
          TestHelpers.wrapAssertion(function () {
            assert.isTrue(AuthErrors.is(err, 'CHANNEL_TIMEOUT'));
          }, done);
        });
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
      it('triggers an event', function (done) {
        channel.on('message_type', function (data) {
          TestHelpers.wrapAssertion(function () {
            assert.equal(data.key, 'value');
          }, done);
        });

        channel.receiveMessage({
          data: IFrameChannel.stringify('message_type', { key: 'value' })
        });
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
            assert.equal(data.origin, 'https://marketplace.firefox.com');
          }, done);
        });

        // synthesize receiving a message over postMessage
        var message = IFrameChannel.stringify('ping', { key: 'value' });
        channel.receiveMessage({
          data: message,
          origin: 'https://marketplace.firefox.com'
        });
      });
    });
  });
});
