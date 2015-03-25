/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'sinon',
  'lib/channels/duplex',
  'lib/channels/senders/null',
  'lib/channels/receivers/null',
  'lib/auth-errors',
  '../../../mocks/window'
],
function (chai, sinon, DuplexChannel, NullSender, NullReceiver, AuthErrors,
  WindowMock) {
  var channel;
  var windowMock;
  var receiver;
  var sender;

  var assert = chai.assert;

  describe('lib/channels/duplex', function () {
    beforeEach(function () {
      windowMock = new WindowMock();
      sender = new NullSender();
      receiver = new NullReceiver();

      channel = new DuplexChannel();
      channel.init({
        window: windowMock,
        sender: sender,
        receiver: receiver
      });
    });

    afterEach(function () {
      channel.teardown();
    });

    describe('init', function () {
      it('throws if no `sender`', function () {
        assert.throws(function () {
          channel.init({
            window: windowMock,
            receiver: receiver
          });
        });
      });

      it('throws if no `receiver`', function () {
        assert.throws(function () {
          channel.init({
            window: windowMock,
            sender: sender
          });
        });
      });
    });

    describe('send', function () {
      it('sends a message to the sender', function () {
        sinon.spy(sender, 'send');
        return channel.send('message', { key: 'value' })
          .then(function () {
            assert.isTrue(sender.send.calledWith('message', { key: 'value' }, null));
          });
      });

      it('can send a message with no data', function () {
        sinon.spy(sender, 'send');
        return channel.send('message')
          .then(function () {
            assert.isTrue(sender.send.calledWith('message', undefined, null));
          });
      });

      it('returns any errors from the sender', function () {
        sinon.stub(sender, 'send', function () {
          throw new Error('uh oh');
        });

        return channel.send('ping')
          .then(assert.fail, function (err) {
            assert.equal(err.message, 'uh oh');
          });
      });
    });

    describe('request', function () {
      it('prints a message to the console if there is no response', function (done) {
        sinon.stub(windowMock, 'setTimeout', function (callback) {
          callback();
        });

        sinon.stub(windowMock.console, 'error', function () {
          done();
        });

        channel.request('ping', {});
      });

      it('returns any errors in from the sender', function () {
        sinon.stub(sender, 'send', function () {
          throw new Error('uh oh');
        });

        return channel.request('ping')
          .then(assert.fail, function (err) {
            assert.equal(err.message, 'uh oh');
          });
      });

      it('returns the response received by the receiver', function () {
        sinon.stub(sender, 'send', function (command, data, messageId) {
          receiver.trigger('message', {
            data: data,
            messageId: messageId
          });
        });

        return channel.request('echo', { key: 'value' })
          .then(function (resp) {
            assert.equal(resp.key, 'value');
          });
      });
    });
  });
});
