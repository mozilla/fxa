/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A View Mixin to:
 *
 * 1) When external links are clicked, flush metrics
 *  then redirect.
 */

import $ from 'jquery';

export default {
  afterRender() {
    const $externalLinks = this.$('a[href^=http]');

    $externalLinks.each((index, el) => {
      $(el).attr('rel', 'noopener noreferrer');
    });
  },

  events: {
    'click a[href^=http]': '_onExternalLinkClick',
  },

  /**
   * Interceptor function. Flushes metrics before redirecting.
   *
   * @param {Event} event - click event
   */
  _onExternalLinkClick(event) {
    if (this._shouldIgnoreClick(event)) {
      return Promise.resolve();
    }

    event.preventDefault();

    this.navigateAway(event.currentTarget.href);
  },

  /**
   * Should the click be ignored?
   *
   * @param {Event} event
   * @returns {Boolean}
   */
  _shouldIgnoreClick(event) {
    return (
      this._isEventModifiedOrPrevented(event) ||
      this._doesLinkOpenInAnotherTab($(event.currentTarget))
    );
  },

  /**
   * Check if a modifier key is depressed, or if
   * the event's default has already been prevented
   *
   * @param {Event} event
   * @returns {Boolean}
   * @private
   */
  _isEventModifiedOrPrevented(event) {
    return !!(
      event.isDefaultPrevented() ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    );
  },

  /**
   * Check if a link opens in another tab
   *
   * @param {Element} $targetEl
   * @returns {Boolean}
   * @private
   */
  _doesLinkOpenInAnotherTab($targetEl) {
    return !!$targetEl.attr('target');
  },
};
