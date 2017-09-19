/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * View mixin to handle an in-content back button.
 *
 * Adds `canGoBack` to context.
 *
 * Hooks up click and key handlers on elements w/
 * the selectors `#back` and `.back`.
 *
 * @mixin BackMixin
 */

define(function (require, exports, module) {
  'use strict';

  const { preventDefaultThen } = require('../base');
  const KeyCodes = require('../../lib/key-codes');

  module.exports = {
    initialize (options = {}) {
      this._canGoBack = !! options.canGoBack;
    },

    events: {
      'click #back,.back': preventDefaultThen('back'),
      'keyup #back,.back': 'backOnEnter'
    },

    setInitialContext (context) {
      if (! context.has('canGoBack')) {
        context.set('canGoBack', this.canGoBack());
      }
    },

    /**
     * Go back to the last page.
     *
     * @method back
     * @param {Object} [nextViewData] - data to send to the next(last) view.
     */
    back (nextViewData) {
      if (this.canGoBack()) {
        this._canGoBack = false;
        this.logViewEvent('back');

        this.notifier.trigger('navigate-back', {
          nextViewData
        });
      }
    },

    /**
     * Go back to the last page, if the user pressed the enter key.
     *
     * @method backOnEnter
     * @param {Object} event
     */
    backOnEnter (event) {
      if (event.which === KeyCodes.ENTER) {
        event.preventDefault();

        this.back();
      }
    },

    /**
     * Check if the back button should be shown.
     *
     * @method canGoBack
     * @returns {Boolean}
     */
    canGoBack () {
      return !! this._canGoBack;
    }
  };
});
