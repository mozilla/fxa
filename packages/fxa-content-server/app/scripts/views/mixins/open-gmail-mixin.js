/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


/**
 * A view mixin that helps confirm* views show the "Open Gmail" button
 * directly from FxA.
 */
define(function (require, exports, module) {
  'use strict';

  return {
    events: {
      'click #open-gmail': '_gmailTabOpened'
    },

    /**
     * Check if the `Open Gmail` button should be visible
     *
     * @param {string} email
     * @returns {boolean}
     */
    isOpenGmailButtonVisible: function (email) {
      // The "Open Gmail" is only visible in certain contexts
      // we do not show it in mobile contexts because it performs worse on mobile
      return this.broker.hasCapability('openGmailButtonVisible') &&
             /@gmail\.com$/.test(email);
    },

    /**
     * Get the GMail URL for the given email
     *
     * @param {string} email
     * @returns {string}
     */
    getGmailUrl: function (email) {
      return 'https://mail.google.com/mail/u/?authuser=' + encodeURIComponent(email);
    },

    _gmailTabOpened: function () {
      this.logViewEvent('openGmail.clicked');
    }
  };

});
