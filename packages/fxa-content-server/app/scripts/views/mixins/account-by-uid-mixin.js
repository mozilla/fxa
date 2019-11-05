/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Session from '../../lib/session';

export default {
  /**
   * Set the user's signed in account with the relier's uid.
   * Used in settings and support views.
   */
  getUidAndSetSignedInAccount() {
    const uid = this.relier.get('uid');
    this.notifier.trigger('set-uid', uid);

    // A uid param is set by RPs linking directly to the settings
    // page for a particular account.
    //
    // We set the current account to the one with `uid` if
    // it exists in our list of cached accounts. If the account is
    // not in the list of cached accounts, clear the current account.
    //
    if (! this.user.getAccountByUid(uid).isDefault()) {
      // The account with uid exists; set it to our current account.
      this.user.setSignedInAccountByUid(uid);
    } else if (uid) {
      // session is expired or user does not exist. Force the user
      // to sign in.
      Session.clear();
      this.user.clearSignedInAccount();
      this.logViewEvent('signout.forced');
    }
  },
};
