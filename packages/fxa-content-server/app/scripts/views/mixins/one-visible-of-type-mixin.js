/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A mixin that only allows one of the given type to be visible
 * at a time. Useful for tooltip like views where only
 * one tooltip-like view should be visible at a time. Both normal
 * Tooltip views and the PasswordStrengthBalloon are considered
 * "tooltips" for this purpose, only one of these can be visible
 * at any given moment.
 */

const visibleViews = {};

/**
 * Create the mixin.
 *
 * @export
 * @param {Object} options
 * @param {String} options.hideMethod - name of method to call to hide the view.
 * @param {String} options.showMethod - name of method that indicates the view is being shown,
 *   causes existing views of `viewType` to be hidden.
 * @param {String} options.viewType - Only one view per `viewType` can be visible at a time.
 * @returns {Function}
 */
export default function (options) {
  const { hideMethod, showMethod, viewType } = options;

  return {
    beforeDestroy() {
      // The current view can no longer be active after being destroyed
      const visibleViewEntry = visibleViews[viewType];
      if (visibleViewEntry && visibleViewEntry.view === this) {
        visibleViews[viewType] = null;
        delete visibleViews[viewType];
      }
    },

    [showMethod]() {
      const visibleViewEntry = visibleViews[viewType];
      if (visibleViewEntry && visibleViewEntry.view !== this) {
        visibleViewEntry.view[visibleViewEntry.hideMethod]();
      }

      visibleViews[viewType] = {
        hideMethod,
        view: this,
      };
    },
  };
}
