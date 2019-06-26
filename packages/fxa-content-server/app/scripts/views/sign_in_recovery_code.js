/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthErrors from 'lib/auth-errors';
import Cocktail from 'cocktail';
import FormView from './form';
import ServiceMixin from './mixins/service-mixin';
import Template from 'templates/sign_in_recovery_code.mustache';

const CODE_INPUT_SELECTOR = 'input.recovery-code';
const MIN_REPLACE_RECOVERY_CODE = 2;

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

  submit() {
    const account = this.getSignedInAccount();
    const code = this.getElementValue('input.recovery-code').toLowerCase();

    return account
      .consumeRecoveryCode(code)
      .then(result => {
        if (result.remaining < MIN_REPLACE_RECOVERY_CODE) {
          return this.navigate(
            '/settings/two_step_authentication/recovery_codes',
            {
              previousViewName: this.viewName,
            }
          );
        }

        this.logViewEvent('success');
        return this.invokeBrokerMethod('afterCompleteSignInWithCode', account);
      })
      .catch(err => {
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
