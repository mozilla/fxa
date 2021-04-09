/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'underscore';
import AuthErrors from 'lib/auth-errors';
import Cocktail from 'cocktail';
import FormView from './form';
import ServiceMixin from './mixins/service-mixin';
import Template from 'templates/sign_in_recovery_code.mustache';

const CODE_INPUT_SELECTOR = 'input.recovery-code';
const LOCKED_OUT_SUPPORT_URL =
  'https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication';

const View = FormView.extend({
  className: 'sign-in-recovery-code',
  template: Template,
  viewName: 'sign_in_recovery_code',

  beforeRender() {
    const account = this.getSignedInAccount();
    if (!account || !account.get('sessionToken')) {
      this.navigate(this._getAuthPage());
    }
  },

  setInitialContext(context) {
    context.set({
      escapedLockedOutSupportLink: _.escape(LOCKED_OUT_SUPPORT_URL),
    });
  },

  submit() {
    const account = this.getSignedInAccount();
    const code = this.getElementValue('input.recovery-code').toLowerCase();

    return account
      .consumeRecoveryCode(code)
      .then(() => {
        this.logViewEvent('success');
        return this.invokeBrokerMethod('afterCompleteSignInWithCode', account);
      })
      .catch((err) => {
        if (AuthErrors.is(err, 'INVALID_PARAMETER')) {
          err = AuthErrors.toError('INVALID_RECOVERY_CODE');
        }
        this.showValidationError(this.$(CODE_INPUT_SELECTOR), err);
      });
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

Cocktail.mixin(View, ServiceMixin);

export default View;
