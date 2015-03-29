/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'sinon',
  'lib/auth-errors',
  'lib/metrics',
  'lib/channels/fx-desktop',
  '../../../mocks/window'
],
function (chai, sinon, AuthErrors, Metrics, FxDesktopChannel, WindowMock) {
  var assert = chai.assert;
  var channel;
  // events from Fx Desktop have an origin of the string 'null'
  var FX_DESKTOP_ORIGIN = 'null';
  var CONTENT_SERVER_ORIGIN = document.location.origin;

  describe('lib/channel/fx-desktop', function () {
    var windowMock;
    var parentMock;
    var metrics;

    function dispatchEvent(status, data) {
      windowMock.dispatchEvent({
        detail: {
          command: 'message',
          data: {
            status: status,
            data: data
          }
        },
        origin: CONTENT_SERVER_ORIGIN
      });
    }

    beforeEach(function () {
      windowMock = new WindowMock();
      parentMock = new WindowMock();
      windowMock.parent = parentMock;
      metrics = new Metrics();

      channel = new FxDesktopChannel();
      channel.init({
        window: windowMock,
        origin: CONTENT_SERVER_ORIGIN,
        sendTimeoutLength: 10,
        metrics: metrics
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

    describe('receiveMessage', function () {
      it('ignores and logs messages that come from an unexpected origin', function () {
        sinon.spy(channel, 'trigger');
        sinon.spy(metrics, 'logError');

        channel.receiveMessage({
          origin: 'https://nefarious.domain.org'
        });

        assert.equal(
          metrics.logError.args[0][0].context, 'https://nefarious.domain.org');
        assert.isFalse(channel.trigger.called);
      });

      it('allows messages that come from the expected domain', function () {
        sinon.spy(channel, 'trigger');
        sinon.spy(metrics, 'logError');

        channel.receiveMessage({
          origin: CONTENT_SERVER_ORIGIN,
          data: {
            type: 'message',
            content: {
              status: 'can_link_account'
            }
          }
        });

        assert.isFalse(metrics.logError.called);
        assert.isTrue(channel.trigger.calledWith('can_link_account'));
      });

      it('allows messages that come from Firefox Desktop', function () {
        sinon.spy(channel, 'trigger');
        sinon.spy(metrics, 'logError');

        channel.receiveMessage({
          origin: FX_DESKTOP_ORIGIN,
          data: {
            type: 'message',
            content: {
              status: 'can_link_account'
            }
          }
        });

        assert.isFalse(metrics.logError.called);
        assert.isTrue(channel.trigger.calledWith('can_link_account'));
      });
    });
  });
});


