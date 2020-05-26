/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * View logic for the account recovery confirm password screen.
 * The recovery key generated requires the password as an
 * encryption key.
 */
import _, { assign } from 'underscore';
import Cocktail from 'cocktail';
import FlowEventsMixin from './../../mixins/flow-events-mixin';
import FormView from '../../form';
import PasswordMixin from '../..//mixins/password-mixin';
import ServiceMixin from '../..//mixins/service-mixin';
import Template from 'templates/post_verify/account_recovery/confirm_password.mustache';
import AuthErrors from '../../../lib/auth-errors';
import preventDefaultThen from '../../decorators/prevent_default_then';

const PASSWORD_SELECTOR = '#password';

class ConfirmPassword extends FormView {
  template = Template;
  viewName = 'confirm-password';

  events = assign(this.events, {
    'click #maybe-later-btn': preventDefaultThen('clickMaybeLater'),
  });

  beforeRender() {
    const account = this.getSignedInAccount();
    if (account.isDefault()) {
      return this.replaceCurrentPage('/');
    }

    // An account can only support one recovery key at a time
    return account.checkRecoveryKeyExists().then((status) => {
      if (status.exists) {
        this.navigate('/post_verify/account_recovery/verified_recovery_key');
      }
    });
  }

  setInitialContext(context) {
    const account = this.getSignedInAccount();
    const email = account.get('email');
    context.set({
      email,
      escapedEmail: `<span class="email">${_.escape(email)}</span>`,
    });
  }

  submit() {
    const account = this.getSignedInAccount();
    const password = this.getElementValue(PASSWORD_SELECTOR);

    return account
      .createRecoveryBundle(password, false)
      .then((recoveryKey) => {
        this.model.set('recoveryKey', recoveryKey);
        this.model.set('recoveryKeyId', recoveryKey.recoveryKeyId);
        this.logFlowEvent('success', this.viewName);
        this.navigate(
          '/post_verify/account_recovery/save_recovery_key',
          recoveryKey
        );
      })
      .catch((err) => {
        if (AuthErrors.is(err, 'INCORRECT_PASSWORD')) {
          return this.showValidationError(this.$(PASSWORD_SELECTOR), err);
        }
        throw err;
      });
  }

  clickMaybeLater() {
    const account = this.getSignedInAccount();
    this.invokeBrokerMethod('afterAbortAddPostVerifyRecovery', account);
  }
}

Cocktail.mixin(ConfirmPassword, FlowEventsMixin, PasswordMixin, ServiceMixin);

export default ConfirmPassword;
