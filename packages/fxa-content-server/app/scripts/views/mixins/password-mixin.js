/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// helper functions for views with passwords. Meant to be mixed into views.

import showPasswordTemplate from 'templates/partial/show-password.mustache';
import AuthErrors from '../../lib/auth-errors';
import KeyCodes from '../../lib/key-codes';
const t = (msg) => msg;

export const PASSWORD_TOGGLE_LABEL = 'label[for^="show-"]';

export default {
  events: {
    'change input[id*="password"]:not([id^="show-"])': 'onPasswordChanged',
    'keyup input[id*="password"]:not([id^="show-"])': 'onPasswordChanged',
    'blur #vpassword': 'hidePasswordHelper',
    'keyup #vpassword': 'onVPasswordChanged',
    'mousedown label[for^="show-"]': 'onShowPasswordMouseDown',
    'mouseup label[for^="show-"]': 'onShowPasswordMouseUp',
    'keydown .input-password-toggle': 'onShowPasswordTV',
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
    const $passwordEl = this.$(passwordEls);
    const $showPasswordLabel = $passwordEl.siblings(PASSWORD_TOGGLE_LABEL);

    if ($passwordEl.val().length === 0) {
      $showPasswordLabel.addClass('hidden');
    } else {
      $showPasswordLabel.removeClass('hidden');
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
      this.togglePasswordVisibility($passwordEl);
    }
  },

  onShowPasswordMouseDown(event) {
    const $buttonEl = this.$(event.target).siblings('.input-password-toggle');
    const $passwordEl = this.getAffectedPasswordInputs($buttonEl);
    this.togglePasswordVisibility($passwordEl);
  },

  onShowPasswordMouseUp(event) {
    // return focus to input
    this.$(event.target)
      .siblings('input[id*="password"]:not([id^="show-"])')
      .focus();
  },

  togglePasswordVisibility($el) {
    if ($el.attr('type') === 'text') {
      this.hidePassword($el);
    } else {
      this.showPassword($el);
    }
  },

  getAffectedPasswordInputs(button) {
    let $passwordEl = this.$(button).siblings(
      '[id*="password"]:not([id^="show-"])'
    );
    if (this.$(button).data('synchronizeShow')) {
      $passwordEl = this.$(
        '[id*="password"]:not([id^="show-"])[data-synchronize-show]'
      );
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
        .attr('autocapitalize', 'none');
    } catch (e) {
      this._logErrorConvertingPasswordType($passwordEl);
    }

    const $showPasswordEl = $passwordEl.siblings('.input-password-toggle');
    $showPasswordEl.attr('checked', true);
    this.$(PASSWORD_TOGGLE_LABEL).attr('title', t('Hide password'));
    this.$(PASSWORD_TOGGLE_LABEL).attr('aria-label', t('Hide password'));
    this.$(PASSWORD_TOGGLE_LABEL).addClass('input-password-toggle-label-hide');
    this.$(PASSWORD_TOGGLE_LABEL).removeClass(
      'input-password-toggle-label-show'
    );

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
    this.$(PASSWORD_TOGGLE_LABEL).attr('title', t('Show password'));
    this.$(PASSWORD_TOGGLE_LABEL).attr('aria-label', t('Show password'));
    this.$(PASSWORD_TOGGLE_LABEL).addClass('input-password-toggle-label-show');
    this.$(PASSWORD_TOGGLE_LABEL).removeClass(
      'input-password-toggle-label-hide'
    );

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
    this.$el
      .find('[id*="password"][type=text]:not([id^="show-"])')
      .each((index, el) => {
        this.hidePassword(el);
      });
    active.focus();
  },

  onPasswordChanged(event) {
    this._updateShowPasswordLabel(event.target);
  },

  onVPasswordChanged(event) {
    if (this.$('#vpassword').val() === this.$('#password').val()) {
      this.hidePasswordHelper();
    } else {
      this.showPasswordHelper();
    }
  },

  showPasswordHelper() {
    if (this.$('#vpassword').is(':focus')) {
      const vPwBalloon = this.$('#vpassword-balloon');

      if (this.$('#password-strength-balloon').hasClass('hidden')) {
        vPwBalloon.removeClass('hidden');
      } else {
        vPwBalloon.addClass('hidden');
      }
    }
  },

  hidePasswordHelper() {
    // Hide all .input-balloon classes
    this.$('.input-balloon').addClass('hidden');
  },
};
