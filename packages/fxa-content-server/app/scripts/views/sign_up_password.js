/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assign } from 'underscore';
import AuthErrors from '../lib/auth-errors';
import Cocktail from 'cocktail';
import CoppaMixin from './mixins/coppa-mixin';
import EmailOptInMixin from './mixins/email-opt-in-mixin';
import FirefoxFamilyServicesTemplate from '../templates/partial/firefox-family-services.mustache';
import FlowEventsMixin from './mixins/flow-events-mixin';
import FormPrefillMixin from './mixins/form-prefill-mixin';
import FormView from './form';
import PasswordMixin from './mixins/password-mixin';
import PasswordStrengthMixin from './mixins/password-strength-mixin';
import preventDefaultThen from './decorators/prevent_default_then';
import ServiceMixin from './mixins/service-mixin';
import SignedInNotificationMixin from './mixins/signed-in-notification-mixin';
import SignUpMixin from './mixins/signup-mixin';
import Template from 'templates/sign_up_password.mustache';

const t = msg => msg;

const proto = FormView.prototype;
const SignUpPasswordView = FormView.extend({
  template: Template,
  partialTemplates: {
    unsafeFirefoxFamilyHTML: FirefoxFamilyServicesTemplate,
  },
  className: 'sign-up',

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
    const error = this.model.get('error');
    if (error && AuthErrors.is(error, 'DELETED_ACCOUNT')) {
      error.forceMessage = t('Account no longer exists. Recreate it?');
    }
    return proto.beforeRender.call(this);
  },

  setInitialContext(context) {
    context.set({
      canChangeAccount: !this.model.get('forceEmail'),
      email: this.getAccount().get('email'),
    });
  },

  isValidEnd() {
    if (!this._doPasswordsMatch()) {
      return false;
    }

    return proto.isValidEnd.call(this);
  },

  showValidationErrorsEnd() {
    if (!this._doPasswordsMatch()) {
      this.displayError(AuthErrors.toError('PASSWORDS_DO_NOT_MATCH'));
    }
  },

  submit() {
    return Promise.resolve().then(() => {
      if (!this.isUserOldEnough()) {
        return this.tooYoung();
      }

      const account = this.getAccount();
      if (this.isAnyNewsletterVisible()) {
        account.set({
          newsletters: this.getOptedIntoNewsletters(),
        });
      }

      return this.signUp(account, this._getPassword());
    });
  },

  _getPassword() {
    return this.getElementValue('#password');
  },

  _getVPassword() {
    return this.getElementValue('#vpassword');
  },

  _doPasswordsMatch() {
    return this._getPassword() === this._getVPassword();
  },
});

Cocktail.mixin(
  SignUpPasswordView,
  CoppaMixin({
    required: true,
  }),
  EmailOptInMixin,
  FlowEventsMixin,
  FormPrefillMixin,
  PasswordMixin,
  PasswordStrengthMixin({
    balloonEl: '.helper-balloon',
    passwordEl: '#password',
  }),
  ServiceMixin,
  SignedInNotificationMixin,
  SignUpMixin
);

export default SignUpPasswordView;
