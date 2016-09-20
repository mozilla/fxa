/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Plugin to display hints for passwords,
 * hints change as the user types
 */

define(function (require, exports, module) {
  'use strict';

  const Strings = require('lib/strings');
  const t = require('views/base').t;
  const Tooltip = require('views/tooltip');

  // this link is not suitable for L10N and should be available in only `en` locales.
  const MORE_INFO_LINK = '<a href="/support/create_secure_password">Need inspiration?</a>';
  const CHECK_PASSWORD_FIELD_SELECTOR = '.check-password';
  const INPUT_HELP_FOCUSED = '.input-help-focused';
  const TOOLTIP_MESSAGES = {
    FOCUS_PROMPT_MESSAGE: t('8 characters minimum, but longer if you plan to sync passwords.'),
    INITIAL_PROMPT_MESSAGE: t('A strong, unique password will keep your Firefox data safe from intruders.'),
    WARNING_PROMPT_MESSAGE: t('This is a common password; please consider another one.'),
    WARNING_PROMPT_MESSAGE_WITH_LINK: Strings.interpolate(
      t('This is a common password; please consider another one. %(moreInfoLink)s'), { moreInfoLink: MORE_INFO_LINK })
  };

  const PasswordPromptMixin = {
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
      this.$(inputEl).siblings(INPUT_HELP_FOCUSED).html(this.translate(TOOLTIP_MESSAGES.INITIAL_PROMPT_MESSAGE));
      this._logPromptExperimentEvent('INITIAL_PROMPT_MESSAGE');
    },

    displayPasswordFocusPrompt: function (inputEl) {
      this.$(inputEl).siblings(INPUT_HELP_FOCUSED).html(this.translate(TOOLTIP_MESSAGES.FOCUS_PROMPT_MESSAGE));
      this._logPromptExperimentEvent('FOCUS_PROMPT_MESSAGE');
    },

    displayPasswordWarningPrompt: function () {
      let promptContent = TOOLTIP_MESSAGES.WARNING_PROMPT_MESSAGE;
      if (this._isEnglishLocale()) {
        promptContent = TOOLTIP_MESSAGES.WARNING_PROMPT_MESSAGE_WITH_LINK;
      }

      promptContent = this.translate(promptContent);

      const tooltip = new Tooltip({
        dismissible: false,
        extraClassNames: 'tooltip-suggest tooltip-warning',
        invalidEl: this.$(CHECK_PASSWORD_FIELD_SELECTOR),
        message: promptContent
      });
      tooltip.render();
      this._logPromptExperimentEvent('WARNING_PROMPT_MESSAGE');
    },

    showPasswordPrompt: function (inputEl) {
      const length = this.$(inputEl).val().length;
      if (length === 0) {
        this.displayPasswordInitialPrompt(inputEl);
      } else {
        this.displayPasswordFocusPrompt(inputEl);
      }
    },

    onInputFocus: function (event) {
      this.showPasswordPrompt(event.currentTarget);
    },

    onInputKeyUp: function (event) {
      this.showPasswordPrompt(event.currentTarget);
    },

    onPasswordBlur: function () {
      const password = this.getElementValue(CHECK_PASSWORD_FIELD_SELECTOR);
      this.checkPasswordStrength(password);
    },

    _logPromptExperimentEvent: function (eventNameSuffix) {
      const eventName = 'experiment.pw_prompt.' + eventNameSuffix.toLowerCase();
      this.logEventOnce(eventName);
    },

    /**
     * Determines if user is using an English locale.
     * @returns {Boolean}
     * @private
     */
    _isEnglishLocale: function () {
      return !! (this.language && this.language.indexOf('en') === 0);
    },

    // Constants, exposed for testing
    CHECK_PASSWORD_FIELD_SELECTOR: CHECK_PASSWORD_FIELD_SELECTOR,
    INPUT_HELP_FOCUSED: INPUT_HELP_FOCUSED,
    TOOLTIP_MESSAGES: TOOLTIP_MESSAGES
  };
  module.exports = PasswordPromptMixin;
});
