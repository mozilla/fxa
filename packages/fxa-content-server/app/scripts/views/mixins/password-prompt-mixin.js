/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Plugin to display hints for passwords,
 * hints change as the user types
 */

define(function (require, exports, module) {
  'use strict';

  var BaseView = require('views/base');
  var t = BaseView.t;

  var Tooltip = require('views/tooltip');

  var CHECK_PASSWORD_FIELD_SELECTOR = '.check-password';
  var INPUT_HELP_FOCUSED = '.input-help-focused';
  var TOOLTIP_MESSAGES = {
    FOCUS_PROMPT_MESSAGE: t('8 characters minimum, but longer if you plan to sync passwords.'),
    INITIAL_PROMPT_MESSAGE: t('A strong, unique password will keep your Firefox data safe from intruders.'),
    WARNING_PROMPT_MESSAGE: t('This is a common password; please consider another one.')
  };

  var PasswordPromptMixin = {
    // only the .check-password fields will be checked
    events: {
      'blur .check-password': 'onPasswordBlur',
      'focus .check-password': 'onInputFocus',
      'keyup .check-password': 'onInputKeyUp'
    },

    afterRender: function () {
      this.updateFormValueChanges();
    },

    displayPasswordInitialPrompt: function (inputEl) {
      this.$el.find(inputEl).siblings(INPUT_HELP_FOCUSED).html(TOOLTIP_MESSAGES.INITIAL_PROMPT_MESSAGE);
      this._logPromptExperimentEvent('INITIAL_PROMPT_MESSAGE');
    },

    displayPasswordFocusPrompt: function (inputEl) {
      this.$el.find(inputEl).siblings(INPUT_HELP_FOCUSED).html(TOOLTIP_MESSAGES.FOCUS_PROMPT_MESSAGE);
      this._logPromptExperimentEvent('FOCUS_PROMPT_MESSAGE');
    },

    displayPasswordWarningPrompt: function () {
      var tooltip = new Tooltip({
        dismissible: false,
        extraClassNames: 'tooltip-suggest tooltip-warning',
        invalidEl: this.$el.find(CHECK_PASSWORD_FIELD_SELECTOR),
        message: TOOLTIP_MESSAGES.WARNING_PROMPT_MESSAGE
      });
      tooltip.render();
      this._logPromptExperimentEvent('WARNING_PROMPT_MESSAGE');
    },

    showPasswordPrompt: function (inputEl) {
      var length = this.$el.find(inputEl).val().length;
      if (length === 0) {
        this.displayPasswordInitialPrompt(inputEl);
      } else {
        this.displayPasswordFocusPrompt(inputEl);
      }
    },

    onInputFocus: function (event) {
      this.showPasswordPrompt(this.$el.find(event.currentTarget));
    },

    onInputKeyUp: function (event) {
      this.showPasswordPrompt(this.$el.find(event.currentTarget));
    },

    onPasswordBlur: function () {
      var password = this.getElementValue(CHECK_PASSWORD_FIELD_SELECTOR);
      this.checkPasswordStrength(password);
    },

    _logPromptExperimentEvent: function (eventNameSuffix) {
      var eventName = 'experiment.pw_prompt.' + eventNameSuffix.toLowerCase();
      this.logViewEvent(eventName);
    },

    // Constants, exposed for testing
    CHECK_PASSWORD_FIELD_SELECTOR: CHECK_PASSWORD_FIELD_SELECTOR,
    INPUT_HELP_FOCUSED: INPUT_HELP_FOCUSED,
    TOOLTIP_MESSAGES: TOOLTIP_MESSAGES
  };
  module.exports = PasswordPromptMixin;
});
