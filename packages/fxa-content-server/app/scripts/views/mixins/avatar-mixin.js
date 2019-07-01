/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// helper functions for views with a profile image. Meant to be mixed into views.

import _ from 'underscore';
import $ from 'jquery';
import AuthErrors from '../../lib/auth-errors';
import Notifier from '../../lib/channels/notifier';
import ProfileErrors from '../../lib/profile-errors';
import ProfileImage from '../../models/profile-image';
import UserAgentMixin from '../../lib/user-agent-mixin';

var MAX_SPINNER_COMPLETE_TIME = 400; // ms

var Mixin = {
  dependsOn: [UserAgentMixin],

  notifications: {
    // populated below using event name aliases
  },

  onProfileUpdate(/* data */) {
    // implement in view
  },

  /**
   * Adds a profile image for the account to the view, or a default image
   * if none is available.
   *
   * @param {Object} account - The account whose profile image will be shown.
   * @param {Object} [options]
   *   @param {String} [options.wrapperClass] - The class for the element into
   *                 which the profile image will be inserted.
   *   @param {Boolean} [options.spinner] - When true, show a spinner while
   *                    the profile image is loading.
   * @returns {Promise}
   */
  displayAccountProfileImage(account, options) {
    $('#image-holder').css('display', 'none');
    options = options || {};

    var avatarWrapperEl = this.$(options.wrapperClass || '.avatar-wrapper');
    var spinnerEl;

    // We'll optimize the UI for the case that the account
    // doesn't have a profile image if it's not cached
    if (this._shouldShowDefaultProfileImage(account)) {
      this.setDefaultPlaceholderAvatar(avatarWrapperEl);
    } else if (options.spinner) {
      spinnerEl = this._addLoadingSpinner(avatarWrapperEl);
    }

    return account
      .fetchCurrentProfileImage()
      .then(
        profileImage => {
          // Cache the result to make sure we don't flash the default
          // image while fetching the latest profile image
          this._updateCachedProfileImage(profileImage, account);
          return profileImage;
        },
        err => {
          if (
            !ProfileErrors.is(err, 'UNAUTHORIZED') &&
            !AuthErrors.is(err, 'UNVERIFIED_ACCOUNT')
          ) {
            this.logError(err);
          }
          // Ignore errors; the image will be rendered as a
          // default image if displayed
          return new ProfileImage();
        }
      )
      .then(profileImage => {
        return this._completeLoadingSpinner(spinnerEl).then(() => profileImage);
      })
      .then(profileImage => {
        avatarWrapperEl.find(':not(.avatar-spinner)').remove();

        if (profileImage.isDefault()) {
          avatarWrapperEl.addClass('with-default').append('<span></span>');
          this.logViewEvent('profile_image_not_shown');
          $('#image-holder').css('display', 'inline-block');
          $('#loading-avatar-spinner').css('display', 'none');
        } else {
          avatarWrapperEl
            .removeClass('with-default')
            .append($(profileImage.get('img')).addClass('profile-image'));
          $('#image-holder').css('display', 'inline-block');
          $('#loading-avatar-spinner').css('display', 'none');
          this.logViewEvent('profile_image_shown');
        }
      });
  },

  setDefaultPlaceholderAvatar(avatarWrapperEl) {
    avatarWrapperEl = avatarWrapperEl || $('.avatar-wrapper');
    avatarWrapperEl.addClass('with-default');
  },

  // Makes sure the account has an up-to-date image cache.
  // This should be called after fetching the current profile image.
  _updateCachedProfileImage(profileImage, account) {
    if (!account.isDefault()) {
      account.setProfileImage(profileImage);
      this.user.setAccount(account);
    }
  },

  _shouldShowDefaultProfileImage(account) {
    return !account.has('profileImageUrl');
  },

  _addLoadingSpinner(spinnerWrapperEl) {
    if (spinnerWrapperEl) {
      return $('<span class="avatar-spinner"></span>').appendTo(
        spinnerWrapperEl.addClass('with-spinner')
      );
    }
  },

  // "Completes" the spinner, transitioning the semi-circle to a circle, and
  // then removes the spinner element.
  _completeLoadingSpinner(spinnerEl) {
    if (_.isUndefined(spinnerEl)) {
      return Promise.resolve();
    }

    return new Promise(resolve => {
      spinnerEl.addClass('completed').on('transitionend', function(event) {
        // The first transitionend event will resolve the promise, but the spinner will have
        // subsequent transitions, so we'll also hook on the transitionend event of the
        // ::after pseudoelement, which "expands" to hide the spinner.
        resolve();

        if (
          event.originalEvent &&
          event.originalEvent.pseudoElement === '::after'
        ) {
          spinnerEl.remove();
        }
      });

      // Always resolve and remove the spinner after MAX_SPINNER_COMPLETE_TIME,
      // in case we don't receive the expected transitionend events, such as in
      // the case of IE.
      this.setTimeout(function transitionMaxTime() {
        resolve();
        spinnerEl.remove();
      }, MAX_SPINNER_COMPLETE_TIME);
    });
  },

  logAccountImageChange(account) {
    // if the user already has an image set, then report a change event
    if (account.get('hadProfileImageSetBefore')) {
      this.logViewEvent('submit.change');
    } else {
      this.logViewEvent('submit.new');
    }
  },

  updateProfileImage(profileImage, account) {
    account.setProfileImage(profileImage);
    return this.user
      .setAccount(account)
      .then(_.bind(this._notifyProfileUpdate, this, account.get('uid')));
  },

  deleteDisplayedAccountProfileImage(account) {
    return (
      Promise.resolve()
        .then(() => {
          if (!account.get('profileImageId')) {
            return account.fetchCurrentProfileImage().then(profileImage => {
              // Cache the result to make sure we don't flash the default
              // image while fetching the latest profile image
              this._updateCachedProfileImage(profileImage, account);
              return profileImage;
            });
          }
          // if we reach here, the account has a profile image ID already.
        })
        // if we reach here, the account will have an avatar and a profileImageId
        .then(profileImage =>
          account.deleteAvatar(account.get('profileImageId'))
        )
        .then(() => {
          // A blank image will clear the cache
          this.updateProfileImage(new ProfileImage({ default: true }), account);
        })
    );
  },

  updateDisplayName(displayName) {
    var account = this.getSignedInAccount();
    account.set('displayName', displayName);
    return this.user
      .setAccount(account)
      .then(() => this._notifyProfileUpdate(account.get('uid')));
  },

  updateDisplayEmail(email) {
    var account = this.getSignedInAccount();
    account.set('email', email);
    return this.user
      .setAccount(account)
      .then(() => this._notifyProfileUpdate(account.get('uid')));
  },

  _notifyProfileUpdate(uid) {
    this.notifier.triggerAll(Notifier.PROFILE_CHANGE, {
      uid: uid,
    });
  },

  /**
   * Checks to see if the current browser supports uploading avatar
   * photos.
   *
   * @returns {Boolean}
   */
  supportsAvatarUpload() {
    // There is a bug in iOS <= 10 where avatar upload fails when
    // accessing from FxiOS settings webview.
    // Ref: https://bugzilla.mozilla.org/show_bug.cgi?id=1334459
    const userAgent = this.getUserAgent();
    if (userAgent.isFirefoxIos()) {
      const version = userAgent.parseOsVersion();
      return version.major > 10;
    } else {
      return true;
    }
  },
};

Mixin.notifications[Notifier.PROFILE_CHANGE] = 'onProfileUpdate';

export default Mixin;
