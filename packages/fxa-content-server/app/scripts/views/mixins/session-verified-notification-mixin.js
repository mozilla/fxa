/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Notifier from '../../lib/channels/notifier';

const Mixin = {
  notifications: {
    [Notifier.SESSION_VERIFIED]: '_render',
  },

  _render() {
    this.render();
  },
};

export default Mixin;
