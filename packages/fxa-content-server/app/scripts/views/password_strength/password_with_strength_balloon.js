/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Creates and manages a PasswordStrengthBalloon.
 * Updates to the bound password element cause updates to the model
 * which are propagated out to the PasswordStrengthBalloon to
 * update the UI.
 *
 * @export
 * @class PasswordWithStrengthBalloonView
 * @extends {FormView}
 */

import AuthErrors from '../../lib/auth-errors';
import { debounce } from 'underscore';
import FormView from '../form';
import PasswordStrengthBalloonView from './password_strength_balloon';

const DELAY_BEFORE_UPDATE_MODEL_MS = 1000;

const PasswordWithStrengthBalloonView = FormView.extend({
  events: {
    change: 'updateModelAfterDelay',
    focus: 'createBalloonIfNeeded',
    keypress: 'updateModelAfterDelay',
  },

  initialize(options = {}) {
    this.passwordHelperBalloon = options.passwordHelperBalloon;
    this.balloonEl = options.balloonEl;

    // setting the validator causes the jquery-plugin to delegate
    // validation to this.validate() rather than the standard
    // validation logic.
    this.$el.data('validate', () => this.validate());

    this.listenTo(this.model, 'invalid', () => this.createBalloonIfNeeded());

    // Controlling UI updates is easier by debouncing on input than trying
    // to introduce a delay after the model has been updated.
    const delayBeforeUpdateModelMS =
      options.delayBeforeUpdateModelMS || DELAY_BEFORE_UPDATE_MODEL_MS;
    this.updateModelAfterDelay = debounce(
      () => this.updateModel(),
      delayBeforeUpdateModelMS
    );
  },

  createBalloonIfNeeded() {
    // The balloon is created as soon as the user focuses the input element
    // and the password is missing or invalid, or as soon as the model
    // becomes invalid.
    if (this.shouldCreateBalloon()) {
      this.createBalloon();
    }
  },

  shouldCreateBalloon() {
    if (this.passwordHelperBalloon) {
      return false;
    }

    // If a password was pre-filled into the input element, only
    // show the balloon if the password is invalid.
    const password = this.$el.val();
    if (password) {
      // use validate directly to avoid triggering an `invalid` event,
      // which causes the check to occur a 2nd time.
      return !!this.model.validate({ password });
    }
    // when css `respond-to('balloonSmall') wait until the password
    // isn't blank to show in order to allow the user to see
    // the form unobstructed
    return window.matchMedia('(min-width: 960px)').matches;
  },

  createBalloon() {
    const passwordHelperBalloon = (this.passwordHelperBalloon = new PasswordStrengthBalloonView(
      {
        el: this.balloonEl,
        lang: this.lang,
        model: this.model,
        translator: this.translator,
      }
    ));

    this.trackChildView(passwordHelperBalloon);
    // update our own styles whenever the balloon does to avoid any jank.
    this.listenTo(passwordHelperBalloon, 'rendered', () => this.updateStyles());

    return passwordHelperBalloon.render().then(() => {
      // update our own styles whenever the balloon does to avoid any jank. This only
      // updates after the first render
      this.$el.attr('aria-described-by', 'password-strength-balloon');

      // The password field was pre-filled, update
      // the model with it.
      if (this.$el.val()) {
        this.updateModel();
      }
    });
  },

  /**
   * Updates the model after some sort of user action.
   */
  updateModel() {
    this.model.set('password', this.$el.val());
  },

  updateStyles() {
    // The input element should only be marked invalid if the user has
    // taken some sort of action.
    const validationError = this.model.validationError;
    if (validationError) {
      const describedById = this._getDescribedById(validationError);
      this.markElementInvalid(this.$el, describedById);
    } else {
      this.markElementValid(this.$el);
    }
  },

  _getDescribedById(validationError) {
    if (AuthErrors.is(validationError, 'PASSWORD_REQUIRED')) {
      return 'password-too-short';
    } else if (AuthErrors.is(validationError, 'PASSWORD_TOO_SHORT')) {
      return 'password-too-short';
    } else if (AuthErrors.is(validationError, 'PASSWORD_SAME_AS_EMAIL')) {
      return 'password-same-as-email';
    } else if (AuthErrors.is(validationError, 'PASSWORD_TOO_COMMON')) {
      return 'password-too-common';
    }
  },

  validate() {
    // validate is called by jquery-plugin to validate the password element.
    // Since this is part of normal validation, update the model immediately
    // then check for validity.
    this.updateModel();
    const validationError = this.model.validationError;
    if (validationError) {
      validationError.describedById = this._getDescribedById(validationError);
      throw validationError;
    }
  },
});

export default PasswordWithStrengthBalloonView;
