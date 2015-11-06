/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var chai = require('chai');
  var DuplexChannel = require('lib/channels/duplex');
  var NullReceiver = require('lib/channels/receivers/null');
  var NullSender = require('lib/channels/senders/null');
  var sinon = require('sinon');
  var WindowMock = require('../../../mocks/window');

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
      channel.initialize({
        receiver: receiver,
        sender: sender,
        window: windowMock
      });
    });

    afterEach(function () {
      channel.teardown();
    });

    describe('initialize', function () {
      it('throws if no `sender`', function () {
        assert.throws(function () {
          channel.initialize({
            receiver: receiver,
            window: windowMock
          });
        });
      });

      it('throws if no `receiver`', function () {
        assert.throws(function () {
          channel.initialize({
            sender: sender,
            window: windowMock
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

    describe('errors', function () {
      it('receiver errors are propagated', function () {
        var errorSpy = sinon.spy();
        channel.on('error', errorSpy);

        var error = new Error('malformed message');
        receiver.trigger('error', error);

        assert.isTrue(errorSpy.calledWith(error));
      });
    });
  });
});
