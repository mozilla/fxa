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

import FormView from '../form';
import PasswordStrengthBalloonView from './password_strength_balloon';
const PasswordWithStrengthBalloonView = FormView.extend({
  events: {
    blur: 'focusIfInvalidPassword',
    change: 'updateModelForPassword',
    keyup: 'updateModelForPassword',
  },

  initialize (options = {}) {
    this.passwordHelperBalloon = options.passwordHelperBalloon || new PasswordStrengthBalloonView({
      el: options.balloonEl,
      model: this.model
    });
    this.trackChildView(this.passwordHelperBalloon);
  },

  afterRender () {
    return Promise.resolve().then(() => {
      // If a password is pre-filled, update the model values
      // before rendering so that the tooltip is not displayed if
      // not necessary.
      if (this.$el.val().length) {
        return this.updateModelForPassword();
      }
    }).then(() => {
      // update our own styles whenever the balloon does to avoid any jank.
      this.listenTo(this.passwordHelperBalloon, 'rendered', () => this.updateStyles());

      return this.passwordHelperBalloon.render();
    });
  },

  focusIfInvalidPassword () {
    const { hasEnteredPassword, isValid } = this.model.toJSON();

    if (hasEnteredPassword && ! isValid) {
      // A timeout is needed so that the focus occurs after the cursor is placed
      // into the next element. Without the timeout, the focus occurs and then
      // is immediately taken away.
      this.setTimeout(() => {
        this.$el.focus();
      }, 50);
    }
  },

  updateModelForPassword () {
    this.model.updateForPassword(this.$el.val());
  },

  updateStyles () {
    const { hasEnteredPassword, isValid } = this.model.toJSON();

    if (hasEnteredPassword && ! isValid) {
      this.$el.addClass('invalid');
    } else {
      this.$el.removeClass('invalid');
    }
  },
});


export default PasswordWithStrengthBalloonView;
