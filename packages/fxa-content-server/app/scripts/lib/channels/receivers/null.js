/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A null receiver. Doesn't actually receive any messages
 */

import _ from 'underscore';
import Backbone from 'backbone';

function NullReceiver() {
  // nothing to do
}
_.extend(NullReceiver.prototype, Backbone.Events, {
  initialize() {},

  teardown() {},
});

export default NullReceiver;
