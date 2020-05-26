/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import NullChannel from 'lib/channels/null';

var channel;

describe('lib/channel/null', function () {
  beforeEach(function () {
    channel = new NullChannel();
    channel.initialize();
  });

  describe('send', function () {
    it('is a standin that does nothing', function (done) {
      channel.send('heya', {}, done);
    });
  });
});
