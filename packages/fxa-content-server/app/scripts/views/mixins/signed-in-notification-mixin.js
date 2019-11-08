/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Handle signed-in notifications.

import Notifier from '../../lib/channels/notifier';

var Mixin = {
  notifications: {
    // populated below using event name aliases
  },

  _navigateToSignedInView(event) {
    if (this.broker.hasCapability('handleSignedInNotification')) {
      this.user.setSignedInAccountByUid(event.uid);
      this.navigate(this.relier.get('redirectTo') || 'settings');
    }

    return Promise.resolve();
  },
};

Mixin.notifications[Notifier.SIGNED_IN] = '_navigateToSignedInView';

export default Mixin;
