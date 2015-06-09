/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// helper functions for views with a profile image. Meant to be mixed into views.

'use strict';

define([
  'models/profile-image'
], function (ProfileImage) {

  return {
    initialize: function (options) {
      this.notifications = options.notifications;
    },

    displayAccountProfileImage: function (account, wrapperClass) {
      var self = this;
      if (! wrapperClass) {
        wrapperClass = '.avatar-wrapper';
      }

      // We'll optimize the UI for the case that the account
      // doesn't have a profile image if it's not cached
      if (self._shouldShowDefaultProfileImage(account)) {
        self.$(wrapperClass).addClass('with-default');
      }

      return account.fetchCurrentProfileImage()
        .then(function (profileImage) {
          // Cache the result to make sure we don't flash the default
          // image while fetching the latest profile image
          self._updateCachedProfileImage(account.get('uid'), profileImage);
          return profileImage;
        }, function (err) {
          self.logError(err);
          // Ignore errors; the image will be rendered as a
          // default image if displayed
          return new ProfileImage();
        })
        .then(function (profileImage) {
          self._displayedProfileImage = profileImage;

          if (profileImage.isDefault()) {
            self.$(wrapperClass).addClass('with-default');
            self.$(wrapperClass).append('<span></span>');
            self.logScreenEvent('profile_image_not_shown');
          } else {
            self.$(wrapperClass).removeClass('with-default');
            self.$(wrapperClass).append(profileImage.get('img'));
            self.logScreenEvent('profile_image_shown');
          }
        });
    },

    hasDisplayedAccountProfileImage: function () {
      return this._displayedProfileImage && ! this._displayedProfileImage.isDefault();
    },

    // Makes sure the account with uid has an uptodate image cache.
    // This should be called after fetching the current profile image.
    _updateCachedProfileImage: function (uid, profileImage) {
      var cachedAccount = this.user.getAccountByUid(uid);
      if (! cachedAccount.isDefault()) {
        cachedAccount.setProfileImage(profileImage);
        this.user.setAccount(cachedAccount);
      }
    },

    _shouldShowDefaultProfileImage: function (account) {
      return ! account.has('profileImageUrl');
    },

    logAccountImageChange: function (account) {
      // if the user already has an image set, then report a change event
      if (account.get('hadProfileImageSetBefore')) {
        this.logScreenEvent('submit.change');
      } else {
        this.logScreenEvent('submit.new');
      }
    },

    updateProfileImage: function (profileImage) {
      var account = this.getSignedInAccount();
      account.setProfileImage(profileImage);
      this.user.setAccount(account);

      this.notifications.profileChanged({
        uid: account.get('uid')
      });
    },

    deleteDisplayedAccountProfileImage: function (account) {
      var self = this;
      return account.deleteAvatar(self._displayedProfileImage.get('id'))
        .then(function () {
          // A blank image will clear the cache
          self.updateProfileImage(new ProfileImage());
        });
    }
  };
});
