/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Handles view updates to indicate progress.
//
// Show the progress indicator by calling `start`. Hide the progress indicator
// by calling `done`.
//
// Multiple calls to `start` can be made. The progress indicator is
// only hidden after an equal number of calls to `done` are made.
//
// Two delays are used to reduce the amount of flicker in case an asynchronous
// call returns quickly, or one completes and another starts soon after. If
// `start` and `done` are called within SHOW_DELAY_MS, the progress indicator
// is never shown. If `done` then `start` are called within HIDE_DELAY_MS, then
// the progress indicator is not hidden.

import $ from 'jquery';
import Backbone from 'backbone';
import Cocktail from 'cocktail';
import TimerMixin from './mixins/timer-mixin';

// The show and hide delays are to minimize flash.
var SHOW_DELAY_MS = 100;
var HIDE_DELAY_MS = 100;

var View = Backbone.View.extend({
  tagName: 'div',
  className: 'spinner',

  // `_count` ensures the progress indicator is only hidden if all calls
  // to `start` have a matching call to `done`.
  _count: 0,

  /**
   * Mark the start of an action that may need a progress indicator.
   *
   * @method start
   * @param {String} progressEl
   */
  start(progressEl) {
    this._count++;
    if (this._count > 1) {
      // Already visible or waiting to become visible. Get outta here.
      return;
    }

    // If we are waiting to remove the indicator, clear the timeout.
    if (this._removeIndicatorTimeout) {
      this.clearTimeout(this._removeIndicatorTimeout);
      this._removeIndicatorTimeout = null;

      // Indicator was waiting to be removed, making it already visible. No
      // need to create another.
      return;
    }

    this._showIndicatorTimeout = setTimeout(() => {
      this._showIndicatorTimeout = null;

      this.showIndicator(progressEl);
    }, SHOW_DELAY_MS);
  },

  destroy() {
    this.done();

    this.trigger('destroy');

    this.remove();
  },

  /**
   * Mark the end of an action that may have needed a progress indicator.
   *
   * @method done
   */
  done() {
    if (! this._count) {
      // Either already hidden or waiting to be hidden.
      // No need to hide the indicator again.
      return;
    }

    this._count--;

    if (this._count) {
      // More calls to `start` than calls to `done`. Get outta here.
      return;
    }

    // Indicator is waiting to be shown, no need to show it anymore.
    // Remove the timeout and ensure the indicator is nowhere to be found.
    if (this._showIndicatorTimeout) {
      this.clearTimeout(this._showIndicatorTimeout);
      this._showIndicatorTimeout = null;

      // the spinner is not yet displayed, but #stage may not yet
      // be shown either. Ensure #stage is shown.
      this.removeIndicator();
      return;
    }

    this._removeIndicatorTimeout = this.setTimeout(() => {
      this._removeIndicatorTimeout = null;

      this.removeIndicator();
    }, HIDE_DELAY_MS);
  },

  /**
   * Show the progress indicator now
   *
   * @param {String} progressEl
   */
  showIndicator(progressEl) {
    progressEl = $(progressEl);
    if (progressEl.length) {
      this._progressEl = progressEl;
      this._progressHTML = progressEl.html();
      // progress indicator should disable the element and show the indicator
      progressEl.prop('disabled', true).html(this.$el);
    }
  },

  /**
   * Remove the progress indicator now
   *
   * @param {String} progressEl
   * @returns {undefined}
   */
  removeIndicator(progressEl) {
    progressEl = this._progressEl;
    if (progressEl && progressEl.length) {
      progressEl.prop('disabled', false).html(this._progressHTML);
    }
  },

  /**
   * Is the progress indicator either visible or waiting to become visible?
   *
   * @returns {Boolean}
   */
  isVisible() {
    return !! this._count;
  },
});

Cocktail.mixin(View, TimerMixin);

export default View;
