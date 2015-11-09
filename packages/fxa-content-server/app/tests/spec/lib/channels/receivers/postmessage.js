/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var AuthErrors = require('lib/auth-errors');
  var chai = require('chai');
  var PostMessageReceiver = require('lib/channels/receivers/postmessage');
  var sinon = require('sinon');
  var WindowMock = require('../../../../mocks/window');

  var windowMock;
  var receiver;

  var assert = chai.assert;

  describe('lib/channels/receivers/postmessage', function () {
    beforeEach(function () {
      windowMock = new WindowMock();
      receiver = new PostMessageReceiver();
      receiver.initialize({
        origin: 'http://firstrun.firefox.org',
        window: windowMock
      });
    });

    afterEach(function () {
      receiver.teardown();
    });

    describe('isOriginTrusted', function () {
      it('accepts an origin of the string constant `null`', function () {
        // `message` events that come from the Fx Desktop browser have an
        // origin of the string constant 'null'. See
        // https://developer.mozilla.org/docs/Web/API/Window/postMessage#Using_win.postMessage_in_extensions
        // and
        // https://bugzilla.mozilla.org/show_bug.cgi?id=1040257
        // These messages are trusted by default.
        assert.isTrue(receiver.isOriginTrusted('null'));

        // does not accept null, the object.
        assert.isFalse(receiver.isOriginTrusted(null));
        // does not accept false
        assert.isFalse(receiver.isOriginTrusted(false));
        // does not accept undefined
        assert.isFalse(receiver.isOriginTrusted(undefined));
      });

      it('accepts an origin if it matches the passed in origin', function () {
        assert.isTrue(receiver.isOriginTrusted('http://firstrun.firefox.org'));
        // scheme mismatch
        assert.isFalse(receiver.isOriginTrusted('https://firstrun.firefox.org'));
        assert.isFalse(receiver.isOriginTrusted('https://untrusted.org'));
      });
    });

    describe('receiveEvent', function () {
      it('ignores messages with an incorrect type', function () {
        var errorSpy = sinon.spy();
        receiver.on('error', errorSpy);

        var messageSpy = sinon.spy();
        receiver.on('message', messageSpy);

        receiver.receiveEvent({
          data: {},
          type: 'click'
        });

        assert.isFalse(errorSpy.called);
        assert.isFalse(messageSpy.called);
      });

      it('triggers an `error` message if the postMessage event is malformed', function () {
        var errorSpy = sinon.spy();
        receiver.on('error', errorSpy);

        // missing data
        receiver.receiveEvent({
          origin: 'null',
          type: 'message'
        });
        assert.equal(errorSpy.callCount, 1);
      });

      it('triggers an `error` message if the postMessage event is from an untrusted origin', function () {
        var errorSpy = sinon.spy();
        receiver.on('error', errorSpy);

        // invalid origin
        receiver.receiveEvent({
          data: {},
          origin: 'http://non-trusted-origin.org',
          type: 'message'
        });

        assert.equal(errorSpy.callCount, 1);
        assert.isTrue(AuthErrors.is(errorSpy.args[0][0], 'UNEXPECTED_POSTMESSAGE_ORIGIN'));
      });

      it('triggers a `message` event with event\'s message', function () {
        var messageSpy = sinon.spy();
        receiver.on('message', messageSpy);

        receiver.receiveEvent({
          data: { key: 'value' },
          origin: 'null',
          type: 'message'
        });

        assert.isTrue(messageSpy.calledWith({ key: 'value' }));
      });
    });
  });
});
