/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// View mixin the checks whether the uid specified by the relier is
// is cached and valid.

define(function (require, exports, module) {
  'use strict';

  var Session = require('lib/session');

  module.exports = {
    // user must be authenticated and verified to see Settings pages
    mustVerify: true,

    initialize: function () {
      var self = this;
      var uid = self.relier.get('uid');

      // A uid param is set by RPs linking directly to the settings
      // page for a particular account.
      //
      // We set the current account to the one with `uid` if
      // it exists in our list of cached accounts. If the account is
      // not in the list of cached accounts, clear the current account.
      //
      // The `mustVerify` flag will ensure that the account is valid.
      if (! self.user.getAccountByUid(uid).isDefault()) {
        // The account with uid exists; set it to our current account.
        self.user.setSignedInAccountByUid(uid);
      } else if (uid) {
        // session is expired or user does not exist. Force the user
        // to sign in.
        Session.clear();
        self.user.clearSignedInAccount();
      }
    }
  };
});
