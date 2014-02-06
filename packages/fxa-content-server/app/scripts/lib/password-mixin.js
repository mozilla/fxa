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

      // focus the element and place the cursor at
      // the end of the element's input
      //
      // for docs on aria-controls, see
      // http://www.w3.org/TR/wai-aria/states_and_properties#aria-controls
      var controlsSelector = '#' + target.attr('aria-controls');

      // place the cursor at the end of the input when the element is focused.
      this.$(controlsSelector).one('focus', function () {
        this.selectionStart = this.selectionEnd = this.value.length;
      });
      this.focus(controlsSelector);
    },

    setPasswordVisibility: function (isVisible) {
      var type = isVisible ? 'text' : 'password';
      this.$('.password').attr('type', type);
    }
  };
});
