/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// helper functions for views with passwords. Meant to be mixed into views.

import $ from 'jquery';
import KeyCodes from '../../lib/key-codes';
import AuthErrors from '../../lib/auth-errors';
import showPasswordTemplate from 'templates/partial/show-password.mustache';

const SELECTOR_SIGNUP_PASSWORD_HELPER = '.input-help-signup';
const SELECTOR_PASSWORD_HELPER_BALLOON = '.input-help-balloon.follow-focus';

export default {
  events: {
    'blur input.password': 'unhighlightSignupPasswordHelper',
    'change input.password': 'onPasswordChanged',
    'focus input.password': 'highlightSignupPasswordHelper',
    'keyup input.password': 'onPasswordChanged',
    'mousedown .show-password-label': 'onShowPasswordMouseDown',
    'touchstart .show-password-label': 'onShowPasswordMouseDown',
    'keydown input.show-password': 'onShowPasswordTV',
  },

  initialize() {
    // An internal submitStart event is listened for instead of
    // the `submit` DOM event because form.js already binds a submit
    // event. Because of the way Cocktail wraps colliding functions,
    // the form is always submit if a second event handler is added.
    this.on('submitStart', () => this.hideVisiblePasswords());
  },

  afterRender() {
    this._addShowPasswordLabel(this.$('input[type=password]'));
  },

  /**
   * Add and show the "show password" label field if needed, hide it
   * if not needed.
   *
   * @param {String|Element} passwordEls
   */
  _updateShowPasswordLabel(passwordEls) {
    const $targetEl = this.$(passwordEls);

    if ($targetEl.val().length === 0) {
      $targetEl.addClass('empty');
    } else {
      $targetEl.removeClass('empty');
    }
  },

  /**
   * Add a `show password` label to each of the passed in
   * elements.
   *
   * @param {String|Element} passwordEls
   */
  _addShowPasswordLabel(passwordEls) {
    this.$(passwordEls).each((index, target) => {
      this._createShowPasswordLabelLabel(this.$(target));
    });
  },

  /**
   * Create and add the `show password` label for the given password element
   *
   * @param {Element} $passwordEl
   */
  _createShowPasswordLabelLabel($passwordEl) {
    // only add the label if one has not already been added.
    if (this.$(`#show-${$passwordEl.attr('id')}`).length) {
      return;
    }

    const targetId = $passwordEl.attr('id');

    const context = {
      id: `show-${targetId}`,
      synchronizeShow: !!$passwordEl.data('synchronize-show'),
      targetId: targetId,
    };

    const showPasswordLabelEl = this.renderTemplate(
      showPasswordTemplate,
      context
    );

    $passwordEl.after(showPasswordLabelEl);
    this._updateShowPasswordLabel($passwordEl);
  },

  onShowPasswordTV(event) {
    if (event.which === KeyCodes.ENTER) {
      const $passwordEl = this.getAffectedPasswordInputs(this.$(event.target));
      this.showPassword($passwordEl);
      const hideVisiblePasswords = () => {
        $(this.window).off('keyup', hideVisiblePasswords);
        this.hideVisiblePasswords();
      };
      $(this.window).one('keyup', hideVisiblePasswords);
    }
  },

  onShowPasswordMouseDown(event) {
    const $buttonEl = this.$(event.target).siblings('.show-password');
    const $passwordEl = this.getAffectedPasswordInputs($buttonEl);

    this.showPassword($passwordEl);

    // hide the password field as soon as the user
    // lets up on the mouse or their finger.
    const hideVisiblePasswords = () => {
      $(this.window).off('mouseup', hideVisiblePasswords);
      $(this.window).off('touchend', hideVisiblePasswords);

      this.hideVisiblePasswords();
    };

    $(this.window).one('mouseup', hideVisiblePasswords);
    $(this.window).one('touchend', hideVisiblePasswords);
  },

  getAffectedPasswordInputs(button) {
    var $passwordEl = this.$(button).siblings('.password');
    if (this.$(button).data('synchronizeShow')) {
      $passwordEl = this.$('.password[data-synchronize-show]');
    }
    return $passwordEl;
  },

  /**
   * Make a password field's contents visible.
   *
   * @param {String|Element} passwordEl
   */
  showPassword(passwordEl) {
    const $passwordEl = this.$(passwordEl);
    try {
      $passwordEl
        .attr('type', 'text')
        .attr('autocomplete', 'off')
        .attr('autocorrect', 'off')
        .attr('autocapitalize', 'off');
    } catch (e) {
      this._logErrorConvertingPasswordType($passwordEl);
    }

    const $showPasswordEl = $passwordEl.siblings('.show-password');
    $showPasswordEl.attr('checked', true);

    this.logViewEvent('password.visible');
  },

  /**
   * Hide a password field's contents.
   *
   * @param {String|Element} passwordEl
   */
  hidePassword(passwordEl) {
    const $passwordEl = this.$(passwordEl);
    try {
      $passwordEl
        .attr('type', 'password')
        .removeAttr('autocomplete')
        .removeAttr('autocorrect')
        .removeAttr('autocapitalize');
    } catch (e) {
      this._logErrorConvertingPasswordType($passwordEl);
    }

    const $showPasswordEl = $passwordEl.siblings('.show-password');
    $showPasswordEl.removeAttr('checked');

    this.logViewEvent('password.hidden');
    this.focus($passwordEl);
  },

  /**
   * Log an error converting the password input type
   *
   * @param {Element} $passwordEl
   * @private
   */
  _logErrorConvertingPasswordType($passwordEl) {
    // IE8 blows up when changing the type of the input field. Other
    // browsers might too. Ignore the error.
    const err = AuthErrors.toError('CANNOT_CHANGE_INPUT_TYPE');
    err.type = $passwordEl.attr('type');

    this.logError(err);
  },

  /**
   * Hide all visible passwords to prevent passwords from being saved
   * by the browser as text form data.
   *
   * @private
   */
  hideVisiblePasswords() {
    const active = document.activeElement;
    this.$el.find('.password[type=text]').each((index, el) => {
      this.hidePassword(el);
    });
    active.focus();
  },

  onPasswordChanged(event) {
    this._updateShowPasswordLabel(event.target);
  },

  showPasswordHelper() {
    this.$('.input-help:not(.password-strength-balloon)').css('opacity', '1');
  },

  hidePasswordHelper() {
    // Hide all input-help classes except input-help-forgot-pw
    this.$(
      '.input-help:not(.input-help-forgot-pw,.password-strength-balloon)'
    ).css('opacity', '0');
  },

  /**
   * Add the `highlight` class to the signup password helper. This is
   * used to make the "Tips: Keep your password safe..." text blue if either
   * password field is focused.
   *
   * This also positions the password helper balloon on the correct password field.
   * @param {Object} event Focus event
   */
  highlightSignupPasswordHelper(event) {
    this.$(SELECTOR_SIGNUP_PASSWORD_HELPER).addClass('highlight');
    // the code below moves the signup password helper between the two password fields
    if (event && this.$(event.target).is('#password')) {
      this.$(SELECTOR_PASSWORD_HELPER_BALLOON).css('top', '-78px');
    } else {
      this.$(SELECTOR_PASSWORD_HELPER_BALLOON).css('top', '-10px');
    }
    this.showPasswordHelper();
  },

  /**
   * Remove the `highlight` class from the signup password helper
   */
  unhighlightSignupPasswordHelper() {
    this.hidePasswordHelper();
    this.$(SELECTOR_SIGNUP_PASSWORD_HELPER).removeClass('highlight');
  },
};
