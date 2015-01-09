/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// helper functions for views with a profile image. Meant to be mixed into views.

'use strict';

define([
  'lib/session'
], function (Session) {

  return {
    // user must be authenticated and verified to see Settings pages
    mustVerify: true,

    initialize: function () {
      var self = this;
      var uid = self.relier.get('uid');

      // A uid param is set by RPs linking directly to the settings
      // page for a particular account.
      // We set the current account to the one with `uid` if
      // it exists in our list of cached accounts. If it doesn't,
      // clear the current account.
      // The `mustVerify` flag will ensure that the account is valid.
      if (! self.user.getAccountByUid(uid).isEmpty()) {
        // The account with uid exists; set it to our current account.
        self.user.setSignedInAccountByUid(uid);
      } else if (uid) {
        Session.clear();
        self.user.clearSignedInAccount();
      }
    }

  };
});
