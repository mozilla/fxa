/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// A shell of a channel. Doesn't do anything yet, but is a useful standin.

'use strict';

import _ from 'underscore';
import BaseChannel from 'lib/channels/base';

function NullChannel() {
  // nothing to do.
}

_.extend(NullChannel.prototype, new BaseChannel());

export default NullChannel;
