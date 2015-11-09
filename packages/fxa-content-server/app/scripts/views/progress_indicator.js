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

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var _ = require('underscore');
  var Backbone = require('backbone');
  var TimerMixin = require('views/mixins/timer-mixin');

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
     */
    start: function (progressEl) {
      var self = this;

      self._count++;
      if (self._count > 1) {
        // Already visible or waiting to become visible. Get outta here.
        return;
      }

      // If we are waiting to remove the indicator, clear the timeout.
      if (self._removeIndicatorTimeout) {
        self.clearTimeout(self._removeIndicatorTimeout);
        self._removeIndicatorTimeout = null;

        // Indicator was waiting to be removed, making it already visible. No
        // need to create another.
        return;
      }

      self._showIndicatorTimeout = setTimeout(function () {
        self._showIndicatorTimeout = null;

        self.showIndicator(progressEl);
      }, SHOW_DELAY_MS);
    },

    destroy: function () {
      this.done();

      this.trigger('destroy');

      this.remove();
    },

    /**
     * Mark the end of an action that may have needed a progress indicator.
     *
     * @method done
     */
    done: function () {
      var self = this;

      if (! self._count) {
        // Either already hidden or waiting to be hidden.
        // No need to hide the indicator again.
        return;
      }

      self._count--;

      if (self._count) {
        // More calls to `start` than calls to `done`. Get outta here.
        return;
      }

      // Indicator is waiting to be shown, no need to show it anymore.
      // Remove the timeout and ensure the indictor is nowhere to be found.
      if (self._showIndicatorTimeout) {
        self.clearTimeout(self._showIndicatorTimeout);
        self._showIndicatorTimeout = null;

        // the spinner is not yet displayed, but #stage may not yet
        // be shown either. Ensure #stage is shown.
        self.removeIndicator();
        return;
      }

      self._removeIndicatorTimeout = self.setTimeout(function () {
        self._removeIndicatorTimeout = null;

        self.removeIndicator();
      }, HIDE_DELAY_MS);
    },

    /**
     * Show the progress indicator now
     */
    showIndicator: function (progressEl) {
      progressEl = $(progressEl);
      if (progressEl.length) {
        this._progressEl = progressEl;
        this._progressHTML = progressEl.html();
        progressEl.html(this.$el);
      }
    },

    /**
     * Remove the progress indicator now
     */
    removeIndicator: function (progressEl) {
      progressEl = this._progressEl;
      if (progressEl && progressEl.length) {
        progressEl.html(this._progressHTML);
      }
    },

    /**
     * Is the progress indicator either visible or waiting to become visible?
     */
    isVisible: function () {
      return !! this._count;
    }
  });

  _.extend(View.prototype, TimerMixin);

  module.exports = View;
});

