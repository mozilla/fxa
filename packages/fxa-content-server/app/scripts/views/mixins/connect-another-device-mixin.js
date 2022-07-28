/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Helpers for the "Connect Another Device" screens. Users who
 * are eligible for CAD can go /connect_another_device.
 * This module exposes functions to query whether the user is eligible
 * for CAD, and if so, to navigate to the appropriate screen.
 *
 * Should be called like:
 * if (this.isEligibleForConnectAnotherDevice(account)) {
 *   return this.navigateToConnectAnotherDeviceScreen(account);
 * } else {
 *   return this.navigateToAnotherScreen();
 * }
 */

import ExperimentMixin from './experiment-mixin';
import UserAgentMixin from '../../lib/user-agent-mixin';
import VerificationReasonMixin from './verification-reason-mixin';
import Constants from '../../lib/constants';

export default {
  dependsOn: [ExperimentMixin, UserAgentMixin, VerificationReasonMixin],

  /**
   * Is `account` eligible for connect another device?
   *
   * @param {Object} account - account to check
   * @returns {Boolean}
   */
  isEligibleForConnectAnotherDevice(account) {
    // If a user is already signed in to Sync which is different to the
    // user that just verified, show them the old "Account verified!" screen.
    return !this.user.isAnotherAccountSignedIn(account);
  },

  /**
   * Navigate to the appropriate CAD screen for `account`.
   *
   * @param {Object} account
   * @returns {Promise}
   */
  navigateToConnectAnotherDeviceScreen(account) {
    return Promise.resolve().then(() => {
      // users have to be eligible for CAD to be part of SMS too.
      // Users selected to be part of the SMS experiment who are
      // in the control group will go to the existing CAD screen.
      if (!this.isEligibleForConnectAnotherDevice(account)) {
        // this shouldn't happen IRL.
        throw new Error(
          'chooseConnectAnotherDeviceScreen can only be called if user is eligible to connect another device'
        );
      }

      // If we can pair, just jump straight to this screen. Otherwise
      // fall back to previous generic CAD screen.
      if (this.isEligibleForPairing()) {
        this.navigate('pair', {
          account,
        });
      } else {
        const type = this.model.get('type');
        this.navigate('connect_another_device', {
          account,
          showSuccessMessage: true,
          type,
        });
      }
    });
  },

  /**
   * Checks to see if a user is eligible for the pairing flow.
   *
   * To be eligible, the user must not be in a sign-in or sign-up flow,
   * and have access CAD from the Firefox desktop app toolbar menu or app
   * menu.
   *
   */
  isEligibleForPairing() {
    const context = this.relier.get('context');
    const entrypoint = this.relier.get('entrypoint');

    if (
      this.isDefault() &&
      context === Constants.FX_DESKTOP_V3_CONTEXT &&
      (entrypoint === Constants.FIREFOX_TOOLBAR_ENTRYPOINT ||
        entrypoint === Constants.FIREFOX_MENU_ENTRYPOINT ||
        entrypoint === Constants.FIREFOX_PREFERENCES_ENTRYPOINT)
    ) {
      return true;
    }

    return false;
  },

  /**
   * Replace the current page with the new CAD via QR screen.
   *
   * @param {Object} account
   */
  replaceCurrentPageWithQrCadScreen(account) {
    this.replaceCurrentPage('/post_verify/cad_qr/get_started', {
      account,
    });
  },

  /**
   * Replace the current page with the pairing screen.
   *
   */
  replaceCurrentPageWithPairScreen() {
    this.navigate('/pair', {});
  },
};
