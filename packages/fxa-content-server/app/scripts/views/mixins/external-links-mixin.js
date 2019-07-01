/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A View Mixin to:
 *
 * 1) convert external links to visible text for
 *  environments that cannot open external links.
 * 2) When external links are clicked, flush metrics
 *  then redirect.
 */

import $ from 'jquery';

function shouldConvertExternalLinksToText(broker) {
  // not all views have a broker, e.g., the CoppaAgeInput
  // has no need for a broker.
  return broker && broker.hasCapability('convertExternalLinksToText');
}

function convertToVisibleLink(el) {
  const $el = $(el);
  const href = $el.attr('href');
  const text = $el.text();

  if (href && href !== text) {
    $el.addClass('visible-url').attr('data-visible-url', $el.attr('href'));
  }
}

export default {
  afterRender() {
    const $externalLinks = this.$('a[href^=http]');
    const isAboutAccounts =
      this.broker &&
      this.broker.environment &&
      this.broker.environment.isAboutAccounts();

    $externalLinks.each((index, el) => {
      $(el).attr('rel', 'noopener noreferrer');
      if (isAboutAccounts) {
        // if env is aboutAccounts then we need to open links in new tabs
        // otherwise we get a "No Connection" window. Issue #4448.
        $(el).attr('target', '_blank');
      }
    });

    if (shouldConvertExternalLinksToText(this.broker)) {
      $externalLinks.each((index, el) => convertToVisibleLink(el));
    }
  },

  events: {
    'click a[href^=http]': '_onExternalLinkClick',
  },

  /**
   * Interceptor function. Flushes metrics before redirecting.
   *
   * @param {Event} event - click event
   * @returns {Promise}
   */
  _onExternalLinkClick(event) {
    if (this._shouldIgnoreClick(event)) {
      return Promise.resolve();
    }

    event.preventDefault();

    return this._flushMetricsThenRedirect(event.currentTarget.href);
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

  /**
   * Flush metrics, then redirect to `url`.
   *
   * @param {String} url
   * @returns {Promise}
   * @private
   */
  _flushMetricsThenRedirect(url) {
    // Safari for iOS will not flush the metrics in an `unload`
    // handler, so do it manually before redirecting.
    return this.metrics.flush().then(() => {
      this.window.location = url;
    });
  },
};
