/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import DuplexChannel from 'lib/channels/duplex';
import NullReceiver from 'lib/channels/receivers/null';
import NullSender from 'lib/channels/senders/null';
import sinon from 'sinon';
import WindowMock from '../../../mocks/window';

var channel;
var windowMock;
var receiver;
var sender;

describe('lib/channels/duplex', () => {
  beforeEach(() => {
    windowMock = new WindowMock();
    sender = new NullSender();
    receiver = new NullReceiver();

    channel = new DuplexChannel();
    channel.initialize({
      receiver: receiver,
      sender: sender,
      window: windowMock,
    });
  });

  afterEach(() => {
    channel.teardown();
  });

  describe('initialize', () => {
    it('throws if no `sender`', () => {
      assert.throws(() => {
        channel.initialize({
          receiver: receiver,
          window: windowMock,
        });
      });
    });

    it('throws if no `receiver`', () => {
      assert.throws(() => {
        channel.initialize({
          sender: sender,
          window: windowMock,
        });
      });
    });
  });

  describe('send', () => {
    it('sends a message to the sender', () => {
      sinon.spy(sender, 'send');
      return channel.send('message', { key: 'value' }).then(() => {
        assert.isTrue(
          sender.send.calledWith('message', { key: 'value' }, null)
        );
      });
    });

    it('can send a message with no data', () => {
      sinon.spy(sender, 'send');
      return channel.send('message').then(() => {
        assert.isTrue(sender.send.calledWith('message', undefined, null));
      });
    });

    it('returns any errors from the sender', () => {
      sinon.stub(sender, 'send').callsFake(() => {
        throw new Error('uh oh');
      });

      return channel.send('ping').then(assert.fail, function (err) {
        assert.equal(err.message, 'uh oh');
      });
    });
  });

  describe('request', () => {
    it('prints a message to the console if there is no response', function (done) {
      sinon.stub(windowMock, 'setTimeout').callsFake(function (callback) {
        callback();
      });

      sinon.stub(windowMock.console, 'error').callsFake(() => {
        done();
      });

      channel.request('ping', {});
    });

    it('returns any errors in sending', () => {
      sinon.stub(sender, 'send').callsFake(() => {
        throw new Error('uh oh');
      });

      return channel.request('ping').then(assert.fail, function (err) {
        assert.equal(err.message, 'uh oh');
      });
    });

    it('returns any error responses from the sender', () => {
      const responseData = {
        error: {
          message: 'uh oh',
        },
      };

      sinon.stub(sender, 'send').callsFake(function (command, data, messageId) {
        responseData.messageId = messageId;
        receiver.trigger('error', responseData);
      });

      var errorSpy = sinon.spy();
      channel.on('error', errorSpy);

      return channel.request('ping').then(assert.fail, function (error) {
        assert.equal(error.message, 'uh oh');
        assert.equal(errorSpy.args[0][0].message, 'uh oh');
      });
    });

    it('returns the response received by the receiver', () => {
      sinon.stub(sender, 'send').callsFake(function (command, data, messageId) {
        receiver.trigger('message', {
          data,
          messageId,
        });
      });

      return channel.request('echo', { key: 'value' }).then(function (resp) {
        assert.equal(resp.key, 'value');
      });
    });
  });

  describe('rejectAllOutstandingRequests', () => {
    it('rejects all outstanding requests with `reason`', () => {
      sinon.stub(sender, 'send').callsFake(() => {});

      setTimeout(() => {
        channel.rejectAllOutstandingRequests('reason');
      }, 5);

      return Promise.all([
        channel.request('ping').then(assert.fail, (err) => err),
        channel.request('ping1').then(assert.fail, (err) => err),
      ]).then(([err1, err2]) => {
        assert.equal(err1, 'reason');
        assert.equal(err2, 'reason');
      });
    });
  });
});
