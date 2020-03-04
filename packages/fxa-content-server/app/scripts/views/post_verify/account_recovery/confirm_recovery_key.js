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
import ServiceMixin from '../..//mixins/service-mixin';
import Template from 'templates/post_verify/account_recovery/confirm_recovery_key.mustache';
import AuthErrors from '../../../lib/auth-errors';
import preventDefaultThen from '../../decorators/prevent_default_then';

const RECOVERY_KEY_INPUT = '#recovery-key';

class ConfirmRecoveryKey extends FormView {
  template = Template;
  viewName = 'confirm-recovery-key';

  events = assign(this.events, {
    'click #back-btn': preventDefaultThen('clickBack'),
  });

  beforeRender() {
    const account = this.getSignedInAccount();
    if (account.isDefault()) {
      return this.replaceCurrentPage('/');
    }

    if (!this.model.get('recoveryKeyId') || !this.model.get('recoveryKey')) {
      return this.navigate('/post_verify/account_recovery/add_recovery_key');
    }
    // An account can only support one recovery key at a time
    return account.checkRecoveryKeyExists().then(status => {
      if (status.exists) {
        return this.navigate(
          '/post_verify/account_recovery/verified_recovery_key'
        );
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
    return Promise.resolve()
      .then(() => {
        const recoveryKeyInput = this.getElementValue(RECOVERY_KEY_INPUT);
        const recoveryKey = this.model.get('recoveryKey');

        if (recoveryKeyInput !== recoveryKey) {
          throw AuthErrors.toError('INVALID_RECOVERY_KEY');
        }

        return account.verifyRecoveryKey(this.model.get('recoveryKeyId'));
      })
      .then(() => {
        this.metrics.logUserPreferences('account-recovery', true);
        this.logFlowEvent('success', this.viewName);
        return this.navigate(
          '/post_verify/account_recovery/verified_recovery_key'
        );
      })
      .catch(err => {
        if (AuthErrors.is(err, 'INVALID_RECOVERY_KEY')) {
          return this.showValidationError(this.$(RECOVERY_KEY_INPUT), err);
        }
        throw err;
      });
  }

  clickBack() {
    return this.navigate('/post_verify/account_recovery/save_recovery_key', {
      recoveryKey: this.model.get('recoveryKey'),
      recoveryKeyId: this.model.get('recoveryKeyId'),
    });
  }
}

Cocktail.mixin(ConfirmRecoveryKey, FlowEventsMixin, ServiceMixin);

export default ConfirmRecoveryKey;
