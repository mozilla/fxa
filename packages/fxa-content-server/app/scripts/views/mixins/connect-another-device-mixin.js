/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Helpers for the "Connect Another Device" screens. Users who
 * are eligible for CAD can go to either /sms or /connect_another_device.
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

const REASON_ANDROID = 'sms.ineligible.android';
const REASON_CONTROL_GROUP = 'sms.ineligible.control_group';
const REASON_IOS = 'sms.ineligible.ios';
const REASON_NOT_IN_EXPERIMENT = 'sms.ineligible.not_in_experiment';
const REASON_NO_SESSION = 'sms.ineligible.no_session';
const REASON_OTHER_USER_SIGNED_IN = 'sms.ineligible.other_user_signed_in';
const REASON_UNSUPPORTED_COUNTRY = 'sms.ineligible.unsupported_country';
const REASON_XHR_ERROR = 'sms.ineligible.xhr_error';

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

      const type = this.model.get('type');
      this.navigate('connect_another_device', {
        account,
        showSuccessMessage: true,
        type,
      });
    });
  },

  /**
   * Replace the current page with the send SMS screen.
   *
   * @param {Object} account
   * @param {String} country
   * @param {Boolean} showSuccessMessage
   */
  replaceCurrentPageWithSmsScreen(account, country, showSuccessMessage) {
    const type = this.model.get('type');
    this.replaceCurrentPage('sms', {
      account,
      country,
      showSuccessMessage,
      type,
    });
  },

  /**
   * Replace the current page with the new CAD via QR screen.
   *
   * @param {Object} account
   * @param {String} country
   */
  replaceCurrentPageWithQrCadScreen(account, country) {
    const type = this.model.get('type');
    this.replaceCurrentPage('/post_verify/cad_qr/get_started', {
      account,
      country,
      type,
    });
  },

  /**
   * Get the country to send an sms to if `account` is eligible for SMS?
   *
   * @param {Object} account
   * @returns {Promise} resolves with a country if the user is eligible.
   */
  getEligibleSmsCountry(account) {
    // Initialize the flow metrics so any flow events are logged.
    // The flow-events-mixin, even if it were mixed in, does this in
    // `afterRender` whereas this method can be called in `beforeRender`
    this.notifier.trigger('flow.initialize');

    return this._isEligibleForSms(account).then(({ country }) => {
      if (!country) {
        // If no country is returned, the reason is already logged.
        return;
      }

      const group = this.getAndReportExperimentGroup('sendSms', {
        account,
        country,
      });

      if (!group) {
        // Auth server said "OK" but user was not selected
        // for the experiment, this mode is not logged in
        // `_areSmsRequirementsMet`
        this.logFlowEvent(REASON_NOT_IN_EXPERIMENT);
      } else if (group === true) {
        return country;
      } else {
        // User is eligible and a member of the experiment.
        if (group === 'control') {
          this.logFlowEvent(REASON_CONTROL_GROUP);
        } else {
          return country;
        }
      }
    });
  },

  getEligibleQrCodeCadGroup(account) {
    // Initialize the flow metrics so any flow events are logged.
    // The flow-events-mixin, even if it were mixed in, does this in
    // `afterRender` whereas this method can be called in `beforeRender`
    this.notifier.trigger('flow.initialize');

    return this._isEligibleForSms(account).then(({ country }) => {
      if (!country) {
        // If no country is returned, the reason is already logged.
        return;
      }
      return {
        group: this.getAndReportExperimentGroup('qrCodeCad', {
          account,
          country,
        }),
        country,
      };
    });
  },

  /**
   * Is `account` eligible for SMS?
   *
   * @param {Object} account
   * @returns {Promise} resolves to an object with two fields:
   *   @returns {String} country - country user is in, only valid if user is eligible for SMS
   *   @returns {Boolean} ok - whether the user is eligible for SMS.
   * @private
   */
  _isEligibleForSms(account) {
    return Promise.resolve(
      this._areSmsRequirementsMet(account) && this._smsCountry(account)
    ).then((country) => {
      return {
        country,
        ok: !!country,
      };
    });
  },

  /**
   * Check if the requirements are met to send an SMS, if not, log why.
   *
   * @param {Object} account
   * @returns {Boolean}
   * @private
   */
  _areSmsRequirementsMet(account) {
    let reason;

    if (this.getUserAgent().isAndroid()) {
      // If already on a mobile device, doesn't make sense to send an SMS.
      reason = REASON_ANDROID;
    } else if (this.getUserAgent().isIos()) {
      reason = REASON_IOS;
    } else if (!(account && account.get('sessionToken'))) {
      reason = REASON_NO_SESSION;
    } else if (this.user.isAnotherAccountSignedIn(account)) {
      // If a user is already signed in to Sync which is different to the
      // user that just verified, show them the old "Account verified!" screen.
      reason = REASON_OTHER_USER_SIGNED_IN;
    }

    if (reason) {
      this.logFlowEvent(reason);
    }

    return !reason;
  },

  /**
   * Check if `account` to send an SMS, and if so, which
   * country the SMS should be sent to.
   *
   * @param {Object} account - account to check
   * @returns {Promise} If user can send an SMS, resolves to
   *   the country to send the SMS to.
   * @private
   */
  _smsCountry(account) {
    // The auth server can gate whether users can send an SMS based
    // on the user's country and whether the SMS provider account
    // has sufficient funds.
    return account.smsStatus(this.relier.pick('country')).then(
      (resp = {}) => {
        if (resp.country) {
          this.logFlowEvent(`sms.status.country.${resp.country}`);
        }

        if (resp.ok) {
          // If geo-lookup is disabled, no country is returned, assume US
          return resp.country || 'US';
        } else {
          // It's a big assumption, but assume ok: false means an unsupported country.
          this.logFlowEvent(REASON_UNSUPPORTED_COUNTRY);
        }
      },
      (err) => {
        // Add `.smsStatus` to the context so we can differentiate between errors
        // checking smsStatus from other XHR errors that occur in the consumer modules.
        err.context = `${this.getViewName()}.smsStatus`;
        // Log and throw away errors from smsStatus, it shouldn't
        // prevent verification from completing. Send the user to
        // /connect_another_device instead. See #5109
        this.logError(err);
        this.logFlowEvent(REASON_XHR_ERROR);
      }
    );
  },
};
