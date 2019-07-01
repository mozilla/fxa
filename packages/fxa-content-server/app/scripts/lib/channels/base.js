/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// A channel interface.

import _ from 'underscore';
import Backbone from 'backbone';

function BaseChannel() {
  // nothing to do.
}

_.extend(BaseChannel.prototype, Backbone.Events, {
  initialize() {},

  teardown() {},

  send(command, data, done) {
    if (done) {
      done();
    }
  },
});

export default BaseChannel;
