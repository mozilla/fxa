/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A null sender. Sends messages nowhere.
 */

function NullSender() {
  // nothing to do here.
}

NullSender.prototype = {
  initialize(/*options*/) {},

  send(/*command, data, messageId*/) {
    return Promise.resolve();
  },

  teardown() {},
};

export default NullSender;
