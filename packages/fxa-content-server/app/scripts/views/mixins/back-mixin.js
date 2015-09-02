/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * View mixin to handle an in-content back button.
 *
 * @class BackMixin
 */

define([
  'views/base'
], function (BaseView) {
  'use strict';

  var ENTER_BUTTON_CODE = 13;

  var BackMixin = {
    _canGoBack: false,
    initialize: function (options) {
      options = options || {};

      this._canGoBack = options.canGoBack;
    },

    events: {
      'click #back': 'back',
      'keyup #back': 'backOnEnter'
    },

    /**
     * Monkey patch BaseView.prototype.getContext to return a
     * context with the `canGoBack` field. Note, this unfortunately
     * means the mixed-in class cannot override `canGoBack`.
     *
     * @method getContext
     * @returns {Object}
     */
    getContext: function () {
      var context = BaseView.prototype.getContext.call(this);

      if (! ('canGoBack' in context)) {
        context.canGoBack = this.canGoBack();
      }

      return context;
    },

    /**
     * Go back to the last page.
     *
     * @method back
     */
    back: BaseView.preventDefaultThen(function () {
      this.window.history.back();
    }),

    /**
     * Go back to the last page, if the user pressed the enter key.
     *
     * @method backOnEnter
     * @param {Object} event
     */
    backOnEnter: function (event) {
      if (event.which === ENTER_BUTTON_CODE) {
        this.back();
      }
    },

    /**
     * Check if the back button should be shown.
     *
     * @method canGoBack
     * @returns {Boolean}
     */
    canGoBack: function () {
      return !! this._canGoBack;
    }
  };

  return BackMixin;
});

