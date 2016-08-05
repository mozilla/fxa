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
      'keyup input.password': 'onPasswordKeyUp',
      'mousedown .show-password-label': 'onShowPasswordMouseDown',
      'touchstart .show-password-label': 'onShowPasswordMouseDown'
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

    onShowPasswordMouseDown (event) {
      const $buttonEl = this.$(event.target).siblings('.show-password');
      const $passwordEl = this.getAffectedPasswordInputs($buttonEl);

      this.setPasswordVisibility($passwordEl, true);

      // hide the password field as soon as the user
      // lets up on the mouse or their finger.
      const hideVisiblePasswords = () => {
        $(this.window).off('mouseup', hideVisiblePasswords);
        $(this.window).off('touchend', hideVisiblePasswords);

        this.hideVisiblePasswords();
      };

      $(this.window).one('mouseup', hideVisiblePasswords);
      $(this.window).one('touchend', hideVisiblePasswords);


      if (this.isInExperiment && this.isInExperiment('showPassword')) {
        this.notifier.trigger('showPassword.clicked');
      }
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
          this.focus(which);
        }
      } catch (e) {
        // IE8 blows up when changing the type of the input field. Other
        // browsers might too. Ignore the error.
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
