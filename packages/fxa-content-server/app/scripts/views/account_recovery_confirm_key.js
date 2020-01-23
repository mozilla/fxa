/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'underscore';
import AuthErrors from '../lib/auth-errors';
import Cocktail from 'cocktail';
import FormView from './form';
import FlowEventsMixin from './mixins/flow-events-mixin';
import preventDefaultThen from './decorators/prevent_default_then';
import PasswordResetMixin from './mixins/password-reset-mixin';
import ServiceMixin from './mixins/service-mixin';
import ResendMixin from './mixins/resend-mixin';
import Template from 'templates/account_recovery_confirm_key.mustache';
import Url from '../lib/url';
import VerificationInfo from '../models/verification/reset-password';

const RECOVERY_KEY_SELECTOR = '.recovery-key';

const View = FormView.extend({
  className: 'recovery-key-confirm',
  template: Template,
  viewName: 'account-recovery-confirm-key',

  events: _.extend({}, FormView.prototype.events, {
    'click .lost-recovery-key': preventDefaultThen('_lostRecoveryKey'),
  }),

  _lostRecoveryKey() {
    this.logFlowEvent('lost-recovery-key', this.viewName);
    this.navigate('/complete_reset_password', {
      lostRecoveryKey: true,
    });
  },

  initialize() {
    this._searchParams = Url.searchParams(this.window.location.search);
    this._verificationInfo = new VerificationInfo(this._searchParams);
  },

  setInitialContext(context) {
    const isLinkExpired = this._verificationInfo.isExpired();
    context.set({
      isLinkExpired,
    });
  },

  submit() {
    const account = this.getSignedInAccount();
    const verificationInfo = this._verificationInfo;
    const email = verificationInfo.get('email');
    const token = verificationInfo.get('token');
    const code = verificationInfo.get('code');
    const uid = verificationInfo.get('uid');
    const recoveryKey = this.$('#recovery-key').val();

    return Promise.resolve()
      .then(() => {
        const accountResetToken = account.get('accountResetToken');
        if (!accountResetToken) {
          return account
            .passwordForgotVerifyCode(code, token, {
              accountResetWithRecoveryKey: true,
            })
            .then(result => {
              // The password forgot code can only be used once to retrieve
              // `accountResetToken`, therefore we store it in the model so
              // that it can be reused on subsequent requests.
              account.set('accountResetToken', result.accountResetToken);
              return result.accountResetToken;
            });
        }
        return accountResetToken;
      })
      .then(accountResetToken => {
        return account.getRecoveryBundle(uid, recoveryKey).then(data => {
          this.logFlowEvent('success', this.viewName);
          this.navigate('/account_recovery_reset_password', {
            accountResetToken,
            email,
            kB: data.keys.kB,
            recoveryKeyId: data.recoveryKeyId,
          });
        });
      })
      .catch(err => {
        if (AuthErrors.is(err, 'INVALID_TOKEN')) {
          this._verificationInfo.markExpired();
          // The token has expired since the first check, re-render to
          // show a view that allows the user to receive a new link.
          return this.render();
        }

        if (AuthErrors.is(err, 'INVALID_RECOVERY_KEY')) {
          this.logFlowEvent('invalidRecoveryKey', this.viewName);
          return this.showValidationError(this.$(RECOVERY_KEY_SELECTOR), err);
        }

        // all other errors are unexpected, bail.
        throw err;
      });
  },

  resend() {
    return this.resetPassword(this._verificationInfo.get('email'));
  },
});

Cocktail.mixin(
  View,
  FlowEventsMixin,
  PasswordResetMixin,
  ResendMixin,
  ServiceMixin
);

export default View;
