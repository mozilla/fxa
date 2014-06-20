/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// helper functions for views with passwords. Meant to be mixed into views.

'use strict';

define([
], function () {
  return {
    onPasswordVisibilityChange: function (event) {
      var target = this.$(event.target);
      var isVisible = target.is(':checked');
      this.setPasswordVisibility(isVisible);

      // for docs on aria-controls, see
      // http://www.w3.org/TR/wai-aria/states_and_properties#aria-controls
      var controlsSelector = '#' + target.attr('aria-controls');
      this.focus(controlsSelector);
    },

    setPasswordVisibility: function (isVisible) {
      var type = isVisible ? 'text' : 'password';
      this.$('.password').attr('type', type);
    }
  };
});
