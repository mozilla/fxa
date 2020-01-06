/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This is a mixin used by Modal views that are childViews of Settings
// Non-modal childViews of Settings use settings-panel-mixin instead.

import { assign } from 'underscore';
import preventDefaultThen from '../decorators/prevent_default_then';
import ModalPanelMixin from './modal-panel-mixin';

const Mixin = assign({}, ModalPanelMixin, {
  initialize(options = {}) {
    this.parentView = options.parentView;
    this.on('modal-cancel', () => this.onModalCancel());
  },

  events: {
    'click .cancel': preventDefaultThen('_returnToSettings'),
    'click .modal-panel #back': preventDefaultThen('_returnToAvatarChange'),
  },

  _returnToAvatarChange() {
    this.navigate('settings/avatar/change');
  },

  _returnToClients() {
    this.navigate('settings/clients');
  },

  _returnToTwoFactorAuthentication() {
    this.navigate('settings/two_step_authentication');
  },

  _returnToAccountRecovery(hasRecoveryKey) {
    this.navigate('settings/account_recovery', { hasRecoveryKey });
  },

  _showAccountRecoveryKey() {
    this.navigate('settings/account_recovery/recovery_key', {
      hasRecoveryKey: true,
    });
  },

  _returnToSettings() {
    this.navigate('settings');
  },

  onModalCancel() {
    // modal-cancel is called whenever the modal is closed because the
    // page has navigated, causing two navigate's to occur. If a navigate
    // has already happened, do not try to navigate again when the
    // modal-cancel event occurs.
    if (this.hasNavigated()) {
      return;
    }

    switch (this.currentPage) {
      case 'settings/clients/disconnect':
        this._returnToClients();
        break;
      case 'settings/two_step_authentication/recovery_codes':
        if (this.model.get('previousViewName') === 'sign_in_recovery_code') {
          const account = this.getSignedInAccount();
          return this.invokeBrokerMethod(
            'afterCompleteSignInWithCode',
            account
          );
        }
        this._returnToTwoFactorAuthentication();
        break;
      case 'settings/two_step_authentication/secret':
        this._returnToTwoFactorAuthentication();
        break;
      case 'settings/account_recovery/recovery_key':
        this._returnToAccountRecovery(true);
        break;
      case 'settings/account_recovery/confirm_revoke':
        this._returnToAccountRecovery(false);
        break;
      case 'settings/account_recovery/confirm_password':
        if (this.showRecoveryKeyView) {
          this._showAccountRecoveryKey();
        } else {
          this._returnToAccountRecovery(false);
        }
        break;
      default:
        this._returnToSettings();
    }
  },

  displaySuccess(msg) {
    this.parentView.displaySuccess(msg);
  },
});

export default Mixin;
