/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * This view handles forcing a user to change their password.
 */
import Cocktail from 'cocktail';
import FormView from '../../form';
import FlowEventsMixin from './../../mixins/flow-events-mixin';
import PasswordMixin from '../../mixins/password-mixin';
import PasswordStrengthMixin from '../../mixins/password-strength-mixin';
import ServiceMixin from '../../mixins/service-mixin';
import Template from 'templates/post_verify/password/force_password_change.mustache';
import VerificationReasonMixin from '../../mixins/verification-reason-mixin';
import AuthErrors from '../../../lib/auth-errors';

const OPASSWORD_INPUT_SELECTOR = '#opassword';
const PASSWORD_INPUT_SELECTOR = '#password';
const VPASSWORD_INPUT_SELECTOR = '#vpassword';

class ForcePasswordChange extends FormView {
  template = Template;
  viewName = 'force-password-change';

  _getOldPassword() {
    return this.$(OPASSWORD_INPUT_SELECTOR).val();
  }

  _getPassword() {
    return this.$(PASSWORD_INPUT_SELECTOR).val();
  }

  _getVPassword() {
    return this.$(VPASSWORD_INPUT_SELECTOR).val();
  }

  setInitialContext(context) {
    const account = this.getSignedInAccount();
    const email = account.get('email');
    context.set({
      email,
    });
  }

  getAccount() {
    return this.getSignedInAccount();
  }

  beforeRender() {
    const account = this.getSignedInAccount();

    // If no user is logged in redirect to the login page and set the `redirectTo` property
    // to current url. After a user has logged in, they will be redirected back to this page.
    if (account.isDefault()) {
      this.relier.set('redirectTo', this.window.location.href);
      return this.replaceCurrentPage('/');
    }
  }

  isValidEnd() {
    return this._getPassword() === this._getVPassword();
  }

  showValidationErrorsEnd() {
    if (this._getPassword() !== this._getVPassword()) {
      const err = AuthErrors.toError('PASSWORDS_DO_NOT_MATCH');
      this.showValidationError(this.$(PASSWORD_INPUT_SELECTOR), err, true);
    }
  }

  submit() {
    const account = this.getSignedInAccount();
    const oldPassword = this._getOldPassword();
    const newPassword = this._getPassword();

    return this.user
      .changeAccountPassword(account, oldPassword, newPassword, this.relier)
      .then(() => {
        return this.invokeBrokerMethod('afterCompleteSignInWithCode', account);
      })
      .catch((err) => {
        if (AuthErrors.is(err, 'INCORRECT_PASSWORD')) {
          this.showValidationError(this.$(OPASSWORD_INPUT_SELECTOR), err, true);
        } else {
          this.displayError(err);
        }
      });
  }
}

Cocktail.mixin(
  ForcePasswordChange,
  FlowEventsMixin,
  PasswordMixin,
  PasswordStrengthMixin({
    balloonEl: '.helper-balloon',
    passwordEl: PASSWORD_INPUT_SELECTOR,
  }),
  VerificationReasonMixin,
  ServiceMixin
);

export default ForcePasswordChange;
