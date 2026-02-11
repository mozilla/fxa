/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthErrors from '../../../lib/auth-errors';
import Cocktail from '../../../lib/cocktail';
import Template from '../../../templates/post_verify/third_party_auth/set_password.mustache';
import FormView from '../../form';
import FlowEventsMixin from '../../mixins/flow-events-mixin';
import PasswordMixin from '../../mixins/password-mixin';
import PasswordStrengthMixin from '../../mixins/password-strength-mixin';
import CWTSOnSignupPasswordMixin from '../../mixins/cwts-on-signup-password';
import ServiceMixin from '../../mixins/service-mixin';
import AccountSuggestionMixin from '../../mixins/account-suggestion-mixin';
import SigninMixin from '../../mixins/signin-mixin';
import BrandMessagingMixin from '../../mixins/brand-messaging-mixin';
import GleanMetrics from '../../../lib/glean';

const PASSWORD_INPUT_SELECTOR = '#password';
const VPASSWORD_INPUT_SELECTOR = '#vpassword';

class SetPassword extends FormView {
  template = Template;

  _getPassword() {
    return this.$(PASSWORD_INPUT_SELECTOR).val();
  }

  _getVPassword() {
    return this.$(VPASSWORD_INPUT_SELECTOR).val();
  }

  isValidEnd() {
    GleanMetrics.setPasswordThirdPartyAuth.engage();
    return this._getPassword() === this._getVPassword();
  }

  showValidationErrorsEnd() {
    if (this._getPassword() !== this._getVPassword()) {
      const err = AuthErrors.toError('PASSWORDS_DO_NOT_MATCH');
      this.showValidationError(this.$(PASSWORD_INPUT_SELECTOR), err, true);
    }
  }

  getAccount() {
    return this.getSignedInAccount();
  }

  beforeRender() {
    const account = this.getSignedInAccount();
    if (account.isDefault()) {
      return this.replaceCurrentPage('/');
    }
  }

  afterRender() {
    GleanMetrics.setPasswordThirdPartyAuth.view();
  }

  setInitialContext(context) {
    const email = this.getAccount().get('email');
    context.set({
      email,
    });
  }

  submit() {
    const account = this.getAccount();
    const password = this._getPassword();

    GleanMetrics.setPasswordThirdPartyAuth.submit();

    return account.createPassword(account.get('email'), password).then(() => {
      // After the user has set a password, initiated the standard Sync
      // login flow with the password they set.
      GleanMetrics.setPasswordThirdPartyAuth.success();
      this.logFlowEventOnce('success', this.viewName);

      return this.signIn(account, password);
    });
  }
}

Cocktail.mixin(
  SetPassword,
  FlowEventsMixin,
  PasswordMixin,
  CWTSOnSignupPasswordMixin,
  PasswordStrengthMixin({
    balloonEl: '#password-strength-balloon-container',
    passwordEl: PASSWORD_INPUT_SELECTOR,
  }),
  ServiceMixin,
  AccountSuggestionMixin,
  SigninMixin,
  BrandMessagingMixin
);

export default SetPassword;
