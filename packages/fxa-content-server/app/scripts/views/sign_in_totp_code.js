/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthErrors from 'lib/auth-errors';
import Cocktail from 'cocktail';
import FormView from './form';
import ServiceMixin from './mixins/service-mixin';
import Template from 'templates/sign_in_totp_code.mustache';
import VerificationReasonMixin from './mixins/verification-reason-mixin';
import FlowEventsMixin from './mixins/flow-events-mixin';

const CODE_INPUT_SELECTOR = 'input.totp-code';

const View = FormView.extend({
  className: 'sign-in-totp-code',
  template: Template,

  getAccount() {
    return this.model.get('account') || this.getSignedInAccount();
  },

  beforeRender() {
    // user cannot confirm if they have not initiated a sign in.
    const account = this.getAccount();
    if (!account || !account.get('sessionToken')) {
      this.navigate(this._getAuthPage());
    }
  },

  submit() {
    const account = this.getAccount();
    const code = this.getElementValue('input.totp-code');
    return account
      .verifyTotpCode(code, this.relier.get('service'))
      .then(result => {
        if (result.success) {
          this.logFlowEvent('success', this.viewName);
          return this.invokeBrokerMethod(
            'afterCompleteSignInWithCode',
            account
          );
        } else {
          throw AuthErrors.toError('INVALID_TOTP_CODE');
        }
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

Cocktail.mixin(View, FlowEventsMixin, ServiceMixin, VerificationReasonMixin);

export default View;
