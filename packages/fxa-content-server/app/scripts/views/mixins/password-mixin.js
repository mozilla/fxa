/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// helper functions for views with passwords. Meant to be mixed into views.

define(function (require, exports, module) {
  'use strict';

  var Constants = require('lib/constants');

  module.exports = {
    events: {
      'change .show-password': 'onPasswordVisibilityChange',
      'keyup input.password': 'onPasswordKeyUp'
    },

    onPasswordVisibilityChange: function (event) {
      var target = this.$(event.target);
      this.setPasswordVisibilityFromButton(target);

      // for docs on aria-controls, see
      // http://www.w3.org/TR/wai-aria/states_and_properties#aria-controls
      var controlsSelector = '#' + target.attr('aria-controls');
      this.focus(controlsSelector);
    },

    setPasswordVisibilityFromButton: function (button) {
      var isVisible = this.$(button).is(':checked');
      var targets = this.getAffectedPasswordInputs(button);
      this.setPasswordVisibility(isVisible, targets);
    },

    getAffectedPasswordInputs: function (button) {
      var passwordField = this.$(button).siblings('.password');
      if (this.$(button).data('synchronizeShow')) {
        passwordField = this.$('.password');
      }
      return passwordField;
    },

    setPasswordVisibility: function (isVisible, passwordField) {
      try {
        if (isVisible) {
          passwordField.attr('type', 'text').attr('autocomplete', 'off')
            .attr('autocorrect', 'off').attr('autocapitalize', 'off');
          this.logViewEvent('password.visible');
        } else {
          passwordField.attr('type', 'password');
          passwordField.removeAttr('autocomplete')
              .removeAttr('autocorrect').removeAttr('autocapitalize');
          this.logViewEvent('password.hidden');
        }
      } catch(e) {
        // IE8 blows up when changing the type of the input field. Other
        // browsers might too. Ignore the error.
      }
    },

    onPasswordKeyUp: function (event) {
      var values = [];
      values.push(this.getElementValue('.password').length);

      // Check to see if change password fields are visible.
      // If any field does not have 8 chars, display warning.
      if (this.getElementValue('#new_password') || this.getElementValue('#new_password') === '') {
        values.push(this.getElementValue('#new_password').length);
      }

      if (this.getElementValue('#old_password') || this.getElementValue('#old_password') === '') {
        values.push(this.getElementValue('#old_password').length);
      }

      var val = Math.min.apply(Math, values);

      if (val < Constants.PASSWORD_MIN_LENGTH) {
        this.showPasswordHelper();
      } else {
        this.hidePasswordHelper();
      }
    },

    showPasswordHelper: function () {
      this.$('.input-help').css('opacity', '1');
    },

    hidePasswordHelper: function () {
      // Hide all input-help classes except input-help-forgot-pw
      this.$('.input-help:not(.input-help-forgot-pw)').css('opacity', '0');
    }
  };
});
