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
    /*global describe, beforeEach, it*/
    var assert = chai.assert;
    var channel;
    var windowMock;

    describe('lib/channel/web', function () {

      beforeEach(function () {
        windowMock = new WindowMock();
        channel = new WebChannel('MyChannel', windowMock);
      });

      describe('send', function () {
        it('sends an event with a callback', function (done) {
          channel.send('after_render', {}, function (err, response) {
              assert.notOk(err);
              done();
            }
          );
          assert.isTrue(windowMock.dispatchedEvents['after_render']);
        });
      });
    });
  });

