/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'lib/channels/null'
],
function (chai, NullChannel) {
  var channel;

  describe('lib/channel/null', function () {
    beforeEach(function() {
      channel = new NullChannel();
      channel.init();
    });

    describe('send', function (done) {
      it('is a standin that does nothing', function() {
        channel.send('heya', function() {
          done();
        });
      });
    });
  });
});


