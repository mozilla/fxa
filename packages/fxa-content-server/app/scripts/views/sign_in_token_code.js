/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Allow the user to unblock their signin by entering
 * in a verification code that is sent in an email.
 */
import Cocktail from 'cocktail';
import Constants from '../lib/constants';
import FormView from './form';
import Template from 'templates/sign_in_token_code.mustache';
import ResendMixin from './mixins/resend-mixin';
import VerificationReasonMixin from './mixins/verification-reason-mixin';
import SessionVerificationPollMixin from './mixins/session-verification-poll-mixin';

const CODE_INPUT_SELECTOR = 'input.otp-code';

const View = FormView.extend({
  className: 'sign-in-token-code',
  template: Template,

  getAccount() {
    return this.getSignedInAccount();
  },

  beforeRender() {
    // user cannot confirm if they have not initiated a sign in.
    if (!this.getAccount()) {
      this.navigate(this._getAuthPage());
    }
  },

  afterVisible() {
    // waitForSessionVerification handles bounced emails and will redirect
    // the user to the appropriate screen depending on whether the account
    // is deleted. If the account no longer exists, redirects the user to
    // sign up, if the account exists, then notifies them their account
    // has been blocked.
    this.waitForSessionVerification(this.getAccount(), () => {
      // don't do anything on verification, that's taken care of in the submit handler.
    });
  },

  setInitialContext(context) {
    const email = this.getAccount().get('email');

    // This needs to point to correct support link
    const supportLink = Constants.BLOCKED_SIGNIN_SUPPORT_URL;

    context.set({
      email,
      escapedSupportLink: encodeURI(supportLink),
      hasSupportLink: !!supportLink,
    });
  },

  submit() {
    const account = this.getAccount();
    const code = this.getElementValue(CODE_INPUT_SELECTOR);
    return this.user
      .verifyAccountSessionCode(account, code)
      .then(() => {
        this.logViewEvent('success');

        const redirectTo = this.model.get('redirectTo');
        if (redirectTo) {
          return (this.window.location.href = redirectTo);
        }

        if (this.isForcePasswordChange(account)) {
          return this.invokeBrokerMethod('beforeForcePasswordChange', account);
        }

        return this.invokeBrokerMethod('afterCompleteSignInWithCode', account);
      })
      .catch((err) =>
        this.showValidationError(this.$(CODE_INPUT_SELECTOR), err)
      );
  },

  resend() {
    const account = this.getAccount();
    return account.verifySessionResendCode();
  },

  /**
   * Get the URL of the page for users that
   * must enter their password.
   *
   * @returns {String}
   */
  _getAuthPage() {
    return this.model.get('lastPage') === 'force_auth'
      ? 'force_auth'
      : 'signin';
  },
});

Cocktail.mixin(
  View,
  ResendMixin(),
  SessionVerificationPollMixin,
  VerificationReasonMixin
);

export default View;
