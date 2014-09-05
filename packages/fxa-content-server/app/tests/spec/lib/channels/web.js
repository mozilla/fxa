/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'underscore',
  'chai',
  'router',
  'views/sign_in',
  'lib/channels/web',
  '/tests/mocks/window.js'
],
function (_, chai, Router, View, WebChannel, WindowMock) {
  var assert = chai.assert;

  describe('lib/channel/web', function () {
    it('requires an id', function (done) {
      try {
        new WebChannel();
      } catch (e) {
        assert.equal(e.message, 'WebChannel must have an id');
        done();
      }
    });

    describe('send', function () {
      var windowMock;
      var channel;

      beforeEach(function () {
        windowMock = new WindowMock();
      });

      it('sends an event with a callback', function (done) {
        channel = new WebChannel('MyChannel', windowMock);
        channel.init({
          window: windowMock
        });

        channel.send('after_render', {}, function (err, response) {
          assert.notOk(err);
          assert.ok(windowMock.dispatchedEvents['after_render']);
          done();
        });
      });

      it('throws an error if dispatchEvent fails', function (done) {
        windowMock.dispatchEvent = function () {
          throw new Error('Not supported');
        };

        channel = new WebChannel('MyChannel', windowMock);
        channel.init({
          window: windowMock
        });

        channel.send('after_render', {}, function (err, response) {
          assert.equal(err.message, 'Not supported');
          assert.notOk(response);
          done();
        });
      });
    });
  });
});
