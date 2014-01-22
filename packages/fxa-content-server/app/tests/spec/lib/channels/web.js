/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'mocha',
  'chai',
  'lib/channels/web'
],
function (mocha, chai, WebChannel) {
  /*global describe, beforeEach, afterEach, it*/
  var assert = chai.assert;
  var channel;

  describe('lib/channel/web', function () {
    beforeEach(function() {
      channel = new WebChannel();
      channel.init();
    });

    describe('send', function () {
      it('is a standin that does nothing', function() {
        channel.send('heya');
      });
    });
  });
});


