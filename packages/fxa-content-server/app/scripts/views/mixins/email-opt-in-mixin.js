/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Mixin that provides email opt-in functionality.
 */

import Newsletters from '../../lib/newsletters';

const MARKETING_EMAIL_CHECKBOX_SELECTOR = 'input.marketing-email-optin';

/**
 * Newsletters to their slugs
 */

const TRAILHEAD_NEWSLETTERS = [
  Newsletters.ONLINE_SAFETY,
  Newsletters.CONSUMER_BETA,
  Newsletters.HEALTHY_INTERNET,
];

const NON_TRAILHEAD_NEWSLETTERS = [Newsletters.FIREFOX_ACCOUNTS_JOURNEY];

export default {
  initialize(options = {}) {
    this._experimentGroupingRules = options.experimentGroupingRules;
    this._marketingEmailEnabled = options.marketingEmailEnabled !== false;
  },

  setInitialContext(context) {
    const isEmailOptInEnabled = this.isEmailOptInEnabled();
    if (!isEmailOptInEnabled) {
      context.set({
        isAnyNewsletterEnabled: false,
        newsletters: [],
      });
      return;
    }

    const newsletters = this._getNewsletters().map(newsletter => {
      // labels are untranslated, make sure to translate them
      // before rendering.
      return {
        label: this.translate(newsletter.label),
        slug: newsletter.slug,
      };
    });

    context.set({
      isAnyNewsletterEnabled: !!newsletters.length,
      newsletters,
    });
  },

  /**
   * Query whether email-opt-in is enabled globally. Does not say
   * whether an individual newsletter is enabled, use `isNewsletterEnabled`
   * instead.
   *
   * @returns {Boolean}
   */
  isEmailOptInEnabled() {
    if (!this._marketingEmailEnabled) {
      return false;
    }

    return !!this._experimentGroupingRules.choose('communicationPrefsVisible', {
      lang: this.navigator.language,
    });
  },

  /**
   * Query whether any newsletter is visible in this view.
   *
   * @param {Newsletter} newsletter
   * @returns {Boolean}
   */
  isAnyNewsletterVisible() {
    return !!this.$(MARKETING_EMAIL_CHECKBOX_SELECTOR).length;
  },

  /**
   * Get a list of newsletters the user has opted in to.
   *
   * @param {Newsletter} newsletter
   * @returns {Boolean}
   */
  getOptedIntoNewsletters() {
    return this._getNewsletters()
      .filter(newsletter => this._hasOptedIntoNewsletter(newsletter))
      .map(newsletter => newsletter.slug);
  },

  /**
   * Query whether the user has opted in to `newsletter`.
   *
   * @param {Newsletter} newsletter
   * @returns {Boolean}
   */
  _hasOptedIntoNewsletter(newsletter) {
    return !!this.$(this._newsletterTypeToSelector(newsletter)).is(':checked');
  },

  /**
   * Get the selector for `newsletter`.
   *
   * @param {Newsletter} newsletter
   * @returns {String}
   */
  _newsletterTypeToSelector(newsletter) {
    return `input[value="${newsletter.slug}"]`;
  },

  /**
   * Get a list of newsletters for the current view
   *
   * @returns {String[]}
   */
  _getNewsletters() {
    return this.isTrailhead()
      ? TRAILHEAD_NEWSLETTERS
      : NON_TRAILHEAD_NEWSLETTERS;
  },
};
