/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// helper functions for views with passwords. Meant to be mixed into views.

define(function (require, exports, module) {
  'use strict';


  module.exports = {
    events: {
      'change .show-password': 'onPasswordVisibilityChange'
    },

    onPasswordVisibilityChange: function (event) {
      var target = this.$(event.target);
      this.setPasswordVisibilityFromButton(target);

      // for docs on aria-controls, see
      // http://www.w3.org/TR/wai-aria/states_and_properties#aria-controls
      var controlsSelector = '#' + target.attr('aria-controls');
      this.focus(controlsSelector);
    },

    isPasswordAutoCompleteDisabled: function () {
      // Sync users should never be allowed to save their password. If they
      // were, it would end in this weird situation where sync users ask to
      // save their sync password to sync before sync is setup.
      return this.relier.isSync();
    },

    setPasswordVisibilityFromButton: function (button) {
      var isVisible = this.$(button).is(':checked');
      this.setPasswordVisibility(isVisible);
    },

    setPasswordVisibility: function (isVisible) {
      try {
        var passwordField = this.$('.password');
        if (isVisible) {
          passwordField.attr('type', 'text').attr('autocomplete', 'off')
            .attr('autocorrect', 'off').attr('autocapitalize', 'off');
          this.logViewEvent('password.visible');
        } else {
          passwordField.attr('type', 'password');
          if (this.isPasswordAutoCompleteDisabled()) {
            passwordField.attr('autocomplete', 'off');
          } else {
            passwordField.removeAttr('autocomplete')
              .removeAttr('autocorrect').removeAttr('autocapitalize');
          }
          this.logViewEvent('password.hidden');
        }
      } catch(e) {
        // IE8 blows up when changing the type of the input field. Other
        // browsers might too. Ignore the error.
      }
    }
  };
});
