/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Allow the user to unblock their signin by entering
 * in a verification code that is sent in an email.
 */
import Constants from '../lib/constants';
import FormView from './form';
import Template from 'templates/sign_in_token_code.mustache';

const CODE_INPUT_SELECTOR = 'input.token-code';

const View = FormView.extend({
  className: 'sign-in-token-code',
  template: Template,

  getAccount() {
    return this.model.get('account');
  },

  beforeRender() {
    // user cannot confirm if they have not initiated a sign in.
    if (!this.model.get('account')) {
      this.navigate(this._getAuthPage());
    }
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
    return account
      .verifyTokenCode(code)
      .then(() => {
        this.logViewEvent('success');
        return this.invokeBrokerMethod('afterCompleteSignInWithCode', account);
      })
      .catch(err => this.showValidationError(this.$(CODE_INPUT_SELECTOR), err));
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

export default View;
