/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Mixin that provides email opt-in functionality.
 *
 * Sets `isEmailOptInVisible` in the context.
 * Provides `hasOptedInToEmail` to query whether the user has
 *   opted-in.
 */
define(function (require, exports, module) {
  'use strict';

  module.exports = {
    initialize (options = {}) {
      this._experimentGroupingRules = options.experimentGroupingRules;
      this._marketingEmailEnabled = options.marketingEmailEnabled !== false;
    },

    setInitialContext (context) {
      context.set('isEmailOptInVisible', this._isEmailOptInEnabled());
    },

    afterRender () {
      this.logViewEvent(`email-optin.visible.${String(this._isEmailOptInEnabled())}`);
    },

    _isEmailOptInEnabled () {
      if (! this._marketingEmailEnabled) {
        return false;
      }

      return !! this._experimentGroupingRules.choose('communicationPrefsVisible', {
        lang: this.navigator.language
      });
    },

    /**
     * Query whether user has opted-in to marketing email.
     *
     * @returns {Boolean}
     */
    hasOptedInToMarketingEmail () {
      return !! this.$('.marketing-email-optin').is(':checked');
    }
  };
});
