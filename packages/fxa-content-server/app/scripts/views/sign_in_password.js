/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AccountResetMixin from './mixins/account-reset-mixin';
import { assign } from 'underscore';
import AuthErrors from '../lib/auth-errors';
import CachedCredentialsMixin from './mixins/cached-credentials-mixin';
import Cocktail from 'cocktail';
import FlowEventsMixin from './mixins/flow-events-mixin';
import FormPrefillMixin from './mixins/form-prefill-mixin';
import FormView from './form';
import PasswordMixin from './mixins/password-mixin';
import preventDefaultThen from './decorators/prevent_default_then';
import ServiceMixin from './mixins/service-mixin';
import SignInMixin from './mixins/signin-mixin';
import Template from 'templates/sign_in_password.mustache';
import UserCardMixin from './mixins/user-card-mixin';

const PASSWORD_SELECTOR = 'input[type=password]';

const SignInPasswordView = FormView.extend({
  template: Template,

  events: assign({}, FormView.prototype.events, {
    'click .use-different': preventDefaultThen('useDifferentAccount'),
  }),

  useDifferentAccount() {
    // a user who came from an OAuth relier and was
    // directed directly to /signin will not be able
    // to go back. Send them directly to `/` with the
    // account. The email will be prefilled on that page.
    this.navigate('/', { account: this.getAccount() });
  },

  getAccount() {
    return this.model.get('account');
  },

  beforeRender() {
    if (!this.getAccount()) {
      this.navigate('/');
    }
  },

  setInitialContext(context) {
    const account = this.getAccount();

    context.set({
      email: account.get('email'),
      isPasswordNeeded: this.isPasswordNeededForAccount(account),
    });
  },

  submit() {
    const account = this.getAccount();
    if (this.$(PASSWORD_SELECTOR).length) {
      const password = this.getElementValue(PASSWORD_SELECTOR);
      return this.signIn(account, password).catch(error =>
        this.onSignInError(account, password, error)
      );
    } else {
      return this.useLoggedInAccount(account);
    }
  },

  onSignInError(account, password, err) {
    if (AuthErrors.is(err, 'USER_CANCELED_LOGIN')) {
      this.logViewEvent('canceled');
      // if user canceled login, just stop
      return;
    } else if (AuthErrors.is(err, 'ACCOUNT_RESET')) {
      return this.notifyOfResetAccount(account);
    } else if (AuthErrors.is(err, 'INCORRECT_PASSWORD')) {
      return this.showValidationError(this.$('input[type=password]'), err);
    }

    // re-throw error, it will be handled at a lower level.
    throw err;
  },
});

Cocktail.mixin(
  SignInPasswordView,
  AccountResetMixin,
  CachedCredentialsMixin,
  FlowEventsMixin,
  FormPrefillMixin,
  PasswordMixin,
  ServiceMixin,
  SignInMixin,
  UserCardMixin
);

export default SignInPasswordView;
