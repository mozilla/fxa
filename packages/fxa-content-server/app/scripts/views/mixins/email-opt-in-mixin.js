/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Mixin that provides email opt-in functionality.
 *
 * Sets `isEmailOptInEnabled` in the context.
 */

export const MARKETING_EMAIL_CHECKBOX_SELECTOR = '.marketing-email-optin';

export default {
  initialize (options = {}) {
    this._experimentGroupingRules = options.experimentGroupingRules;
    this._marketingEmailEnabled = options.marketingEmailEnabled !== false;
  },

  setInitialContext (context) {
    context.set({
      isAnyNewsletterEnabled: this.isEmailOptInEnabled() || this.isBetaNewsletterEnabled() || this.isOnlineSafetyNewsletterEnabled(),
      isBetaNewsletterEnabled: this.isBetaNewsletterEnabled(),
      isEmailOptInEnabled: this.isEmailOptInEnabled(),
      isOnlineSafetyNewsletterEnabled: this.isOnlineSafetyNewsletterEnabled(),
    });
  },

  afterRender () {
    this.logViewEvent(`email-optin.visible.${String(this.isEmailOptInVisible())}`);
  },

  isEmailOptInEnabled () {
    if (! this._marketingEmailEnabled) {
      return false;
    }

    return !! this._experimentGroupingRules.choose('communicationPrefsVisible', {
      lang: this.navigator.language
    });
  },

  /**
   * Query whether email-opt-in is visible. It's possible for email-opt-in to
   * be enabled, but not visible, e.g., email opt in is enabled globally
   * for english, but is only visible on the CWTS screen when style=trailhead.
   *
   * @returns {Boolean}
   */
  isEmailOptInVisible () {
    return !! this.$(MARKETING_EMAIL_CHECKBOX_SELECTOR).length;
  },

  /**
   * Query whether user has opted-in to marketing email.
   *
   * @returns {Boolean}
   */
  hasOptedInToMarketingEmail () {
    return !! this.$(MARKETING_EMAIL_CHECKBOX_SELECTOR).is(':checked');
  },

  /**
   * Query whether the beta newsletter is enabled.
   *
   * @returns {Boolean}
   */
  isBetaNewsletterEnabled () {
    // disabled until https://github.com/mozilla/fxa/issues/1102
    return false;
  },

  /**
   * Query whether the online safety newsletter is enabled.
   *
   * @returns {Boolean}
   */
  isOnlineSafetyNewsletterEnabled () {
    // disabled until https://github.com/mozilla/fxa/issues/1102
    return false;
  }
};
