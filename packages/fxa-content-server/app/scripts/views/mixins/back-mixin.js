/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * View mixin to handle an in-content back button.
 *
 * @class BackMixin
 */

'use strict';

define([
], function () {

  var ENTER_BUTTON_CODE = 13;

  var BackMixin = {
    events: {
      'click #back': 'back',
      'keyup #back': 'backOnEnter'
    },

    back: function (event) {
      if (event) {
        event.preventDefault();
      }

      this.window.history.back();
    },

    backOnEnter: function (event) {
      if (event.which === ENTER_BUTTON_CODE) {
        this.back();
      }
    }
  };

  return BackMixin;
});

