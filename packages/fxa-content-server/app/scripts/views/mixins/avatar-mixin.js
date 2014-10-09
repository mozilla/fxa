/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// helper functions for views with a profile image. Meant to be mixed into views.

'use strict';

define([
], function () {

  return {
    // Attempt to load a profile image from the profile server
    _fetchProfileImage: function () {
      var self = this;

      return this.profileClient.getAvatar()
        .then(function (result) {
          if (result.avatar && result.id) {
            self.logEvent(self.className + '.profile_image_shown');
          } else {
            self.logEvent(self.className + '.profile_image_not_shown');
          }

          return result;
        }, function (err) {
          self.logEvent(self.className + '.profile_image_not_shown');
          // Failures to load a profile image are not displayed in the ui
          // so log the error here to make sure it's in metrics.
          self.logError(err);
          throw err;
        });
    },

    _displayProfileImage: function () {
      var self = this;

      return this._fetchProfileImage()
        .then(function (result) {
          if (result.avatar) {
            self.$('.avatar-wrapper').append(new Image());
            self.$('.avatar-wrapper img').attr('src', result.avatar);
          }
          return result;
        }, function () {
          // Ignore errors; the default image will be shown.
        });
    }
  };
});
