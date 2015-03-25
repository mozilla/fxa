/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'sinon',
  'lib/auth-errors',
  'lib/channels/fx-desktop',
  '../../../mocks/window'
],
function (chai, sinon, AuthErrors, FxDesktopChannel, WindowMock) {
  var assert = chai.assert;
  var channel;

  describe('lib/channel/fx-desktop', function () {
    var windowMock;
    var parentMock;

    function dispatchEvent(status, data) {
      windowMock.dispatchEvent({
        detail: {
          command: 'message',
          data: {
            status: status,
            data: data
          }
        }
      });
    }

    beforeEach(function () {
      windowMock = new WindowMock();
      parentMock = new WindowMock();
      windowMock.parent = parentMock;

      channel = new FxDesktopChannel();
      channel.init({
        window: windowMock,
        sendTimeoutLength: 10
      });
    });

    afterEach(function () {
      if (channel) {
        channel.teardown();
      }
    });

    describe('send', function () {
      it('sends a message to the browser', function () {
        channel.send('test-command', { key: 'value' });
        assert.isTrue(windowMock.dispatchedEvents['test-command']);
      });


      it('prints a message to the console if browser does not respond', function (done) {
        sinon.stub(parentMock, 'postMessage', function () {
        });

        sinon.stub(windowMock, 'setTimeout', function (callback) {
          callback();
        });

        sinon.stub(windowMock.console, 'error', function () {
          done();
        });

        channel.send('wait-for-response', {});
      });

      it('does not except on timeout if callback is not given', function (done) {
        // if there is an exception, done is never called.
        setTimeout(done, 500);
        channel.send('wait-for-response', { key: 'value' });
      });
    });

    describe('on', function () {
      it('registers a callback to be called when the browser sends ' +
            'the registered message', function (done) {

              channel.on('call-the-callback', function () {
                done();
              });

              dispatchEvent('call-the-callback');
            });
    });
  });
});


