/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// helper functions for views with passwords. Meant to be mixed into views.

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const Constants = require('lib/constants');

  module.exports = {
    events: {
      'change .show-password': 'onPasswordVisibilityChange',
      'keyup input.password': 'onPasswordKeyUp'
    },

    initialize () {
      // An internal submitStart event is listened for instead of
      // the `submit` DOM event because form.js already binds a submit
      // event. Because of the way Cocktail wraps colliding functions,
      // the form is always submit if a second event handler is added.
      this.on('submitStart', () => this.hideVisiblePasswords());
    },

    afterVisible () {
      if (this.isInExperiment && this.isInExperiment('showPassword')) {
        this.notifier.trigger('showPassword.triggered');

        if (this.isInExperimentGroup('showPassword', 'treatment')) {
          this.$el.find('.show-password-label').hide();
        }
      }
    },

    onPasswordVisibilityChange (event) {
      var target = this.$(event.target);
      this.setPasswordVisibilityFromButton(target);

      if (this.isInExperiment && this.isInExperiment('showPassword')) {
        this.notifier.trigger('showPassword.clicked');
      }

      // for docs on aria-controls, see
      // http://www.w3.org/TR/wai-aria/states_and_properties#aria-controls
      var controlsSelector = '#' + target.attr('aria-controls');
      this.focus(controlsSelector);
    },

    setPasswordVisibilityFromButton (button) {
      var isVisible = this.$(button).is(':checked');
      var targets = this.getAffectedPasswordInputs(button);
      this.setPasswordVisibility(targets, isVisible);
    },

    getAffectedPasswordInputs (button) {
      var $passwordEl = this.$(button).siblings('.password');
      if (this.$(button).data('synchronizeShow')) {
        $passwordEl = this.$('.password');
      }
      return $passwordEl;
    },

    /**
     * Set the password visibility for an element. Ensure the "show" button's
     * state is synchronized.
     *
     * @param {selector | element} which
     * @param {boolean} isVisible
     */
    setPasswordVisibility (which, isVisible) {
      const $passwordEl = $(which);
      const $showPasswordEl = $passwordEl.siblings('.show-password');

      // Store the cursor position before updating the element type
      // or else the cursor is set to before the first character.

      // `which` can match more than one element. If this is the case
      // find the element that is focused.
      let $focusedEl = $passwordEl.filter(':focus');
      let selectionStart;
      let selectionEnd;

      if ($focusedEl.length) {
        const focusedEl = $focusedEl.get(0);
        selectionStart = focusedEl.selectionStart;
        selectionEnd = focusedEl.selectionEnd;
      }

      try {
        if (isVisible) {
          $passwordEl.attr('type', 'text').attr('autocomplete', 'off')
            .attr('autocorrect', 'off').attr('autocapitalize', 'off');
          $showPasswordEl.attr('checked', true);
          this.logViewEvent('password.visible');
        } else {
          $passwordEl.attr('type', 'password').removeAttr('autocomplete')
            .removeAttr('autocorrect').removeAttr('autocapitalize');
          $showPasswordEl.removeAttr('checked');
          this.logViewEvent('password.hidden');
        }
      } catch (e) {
        // IE8 blows up when changing the type of the input field. Other
        // browsers might too. Ignore the error.
      }

      // Restore the cursor position if the element is in focus.
      if ($focusedEl.length) {
        this.placeCursorAt($focusedEl, selectionStart, selectionEnd);
      }
    },

    /**
     * Hide all visible passwords to prevent passwords from being saved
     * by the browser as text form data.
     */
    hideVisiblePasswords () {
      this.$el.find('.password[type=text]').each((index, el) => {
        this.setPasswordVisibility(el, false);
      });
    },

    onPasswordKeyUp () {
      var values = [];

      // Values contains all password classes length
      this.$('.password').each(function (index, el) {
        values.push($(el).val().length);
      });

      var val = Math.min.apply(Math, values);

      if (val < Constants.PASSWORD_MIN_LENGTH) {
        this.showPasswordHelper();
      } else {
        this.hidePasswordHelper();
      }
    },

    showPasswordHelper () {
      this.$('.input-help').css('opacity', '1');
    },

    hidePasswordHelper () {
      // Hide all input-help classes except input-help-forgot-pw
      this.$('.input-help:not(.input-help-forgot-pw)').css('opacity', '0');
    }
  };
});
