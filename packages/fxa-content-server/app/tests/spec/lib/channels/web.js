/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var chai = require('chai');
  var sinon = require('sinon');
  var WebChannel = require('lib/channels/web');
  var WindowMock = require('/tests/mocks/window.js');

  var assert = chai.assert;

  describe('lib/channels/web', function () {
    var channel;
    var windowMock;

    beforeEach(function () {
      windowMock = new WindowMock();
    });


    afterEach(function () {
      if (channel) {
        channel.teardown();
      }
    });

    it('requires an id', function () {
      assert.throws(function () {
        new WebChannel();//eslint-disable-line no-new
      }, 'WebChannel must have an id');
    });

    describe('send', function () {
      it('sends a message', function () {
        channel = new WebChannel('MyChannel');
        channel.initialize({
          window: windowMock
        });

        return channel.send('after_render', {})
          .then(function () {
            assert.ok(windowMock.dispatchedEvents['after_render']);
          });
      });

      it('throws an error if dispatchEvent fails', function () {
        sinon.stub(windowMock, 'dispatchEvent', function () {
          throw new Error('Not supported');
        });

        channel = new WebChannel('MyChannel');
        channel.initialize({
          window: windowMock
        });

        channel.send('after_render', {})
          .then(assert.fail, function (err) {
            assert.equal(err.message, 'Not supported');
          });
      });
    });

    describe('request', function () {
      it('sends a message, waits for a response, ', function () {
        channel = new WebChannel('MyChannel');
        channel.initialize({
          window: windowMock
        });

        sinon.stub(windowMock, 'dispatchEvent', function (dispatched) {
          console.log('dispatched: %s', JSON.stringify(dispatched));
          channel._receiver.trigger('message', {
            command: 'can_link_account',
            data: { ok: true },
            messageId: dispatched.detail.message.messageId
          });
        });

        return channel.request('can_link_account', { email: 'testuser@testuser.com' })
          .then(function (response) {
            assert.isTrue(response.ok);
          });
      });
    });
  });
});
