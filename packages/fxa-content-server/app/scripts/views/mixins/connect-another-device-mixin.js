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
   * Users can access the connect another device (CAD) page through various ways and we
   * conditionally redirect them to the `/pair` page by returning `true` here.
   *
   * Users logging in or registering for a new account will have an action=email param present,
   * and we want to keep these users on the CAD page. We want to redirect logged in users if they
   * get to CAD within FF via:
   *
   * - FF account > connect another device: entrypoint=fxa_discoverability_native
   *   - if not signed in: can't access
   * - about:preferences#sync > connect another device: entrypoint=preferences
   *   - if not signed in, "sign in to sync...": entrypoint=preferences&action=email
   * - menu > email (FF account) > connect another device: entrypoint=fxa_app_menu
   *   - if not signed in, menu > "Sync and save data": entrypoint=fxa_app_menu&action=email
   * - sidebars (toolbar) > synced tabs > connect another device: entrypoint=tabs-sidebar
   *   - if not signed in, "Sign in to sync": entrypoint=tabs-sidebar&action=email
   * - synced tabs (toolbar) > connect another device: entrypoint=synced-tabs
   *   - if not signed in, "sign in to sync...": entrypoint=synced-tabs&action=email
   * - about:firefoxview > Get FF for mobile: goes directly to `/pair?entrypoint=fx-view`¹
   *   - if not signed in, "Continue": entrypoint=firefoxview&action=email
   *
   * ¹At the time of writing we don't have to check for `isNotActionEmail` with entrypoint=fx-view
   * since the logged in state takes them directly to `/pair` but check anyway for consistency.
   *
   * We also want to keep users on CAD if they hit the page directly (no parameters).
   */
  isEligibleForPairing() {
    const context = this.relier.get('context');
    const entrypoint = this.relier.get('entrypoint');
    const isNotActionEmail = this.relier.get('action') !== 'email';
    if (
      this.isDefault() &&
      (context === Constants.FX_DESKTOP_V3_CONTEXT ||
        context === Constants.OAUTH_WEBCHANNEL_CONTEXT) &&
      (entrypoint === Constants.FIREFOX_TOOLBAR_ENTRYPOINT ||
        (isNotActionEmail &&
          [
            Constants.FIREFOX_PREFERENCES_ENTRYPOINT,
            Constants.FIREFOX_SYNCED_TABS_ENTRYPOINT,
            Constants.FIREFOX_TABS_SIDEBAR_ENTRYPOINT,
            Constants.FIREFOX_MENU_ENTRYPOINT,
            Constants.FIREFOX_FX_VIEW_ENTRYPOINT,
          ].includes(entrypoint)))
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
