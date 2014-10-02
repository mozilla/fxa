/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// helper functions for views with a profile image. Meant to be mixed into views.

'use strict';

define([
  'lib/promise',
  'lib/session'
], function (p, Session) {

  return {
    // Attempt to load a profile image from the profile server and cache it on Session
    _fetchProfileImage: function () {
      var self = this;

      return this.profileClient.getAvatar()
        .then(function (result) {
          if (result.avatar && result.id) {
            Session.set('avatar', result.avatar);
            Session.set('avatarId', result.id);
            return true;
          }
        })
        .then(function (found) {
          if (found) {
            self.logEvent(self.className + '.profile_image_shown');
          }
        }, function (err) {
          self.logEvent(self.className + '.profile_image_not_shown');
          // Failures to load a profile image are not displayed in the ui
          // so log the error here to make sure it's in metrics.
          self.logError(err);
          throw err;
        });
    }
  };
});
