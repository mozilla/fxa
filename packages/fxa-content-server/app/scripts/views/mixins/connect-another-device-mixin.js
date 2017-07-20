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
 *
 * This mixin unfortunately requires a bunch of other mixins:
 *  - ExperimentMixin,
 *  - UserAgentMixin,
 *  - VerificationReasonMixin
 */

define((require, exports, module) => {
  'use strict';

  const p = require('lib/promise');
  const ExperimentMixin = require('views/mixins/experiment-mixin');
  const UserAgentMixin = require('lib/user-agent-mixin');
  const VerificationReasonMixin = require('views/mixins/verification-reason-mixin');

  return {
    dependsOn: [
      ExperimentMixin,
      UserAgentMixin,
      VerificationReasonMixin
    ],

    /**
     * Is `account` eligible for connect another device?
     *
     * @param {Object} account - account to check
     * @returns {Boolean}
     */
    isEligibleForConnectAnotherDevice (account) {
      // Only show to users who are signing up, until we have better text for
      // users who are signing in.
      return this.isSignUp() &&
             // If a user is already signed in to Sync which is different to the
             // user that just verified, show them the old "Account verified!" screen.
             ! this.user.isAnotherAccountSignedIn(account);
    },

    /**
     * Navigate to the appropriate CAD screen for `account`.
     *
     * @param {Object} account
     * @returns {Promise}
     */
    navigateToConnectAnotherDeviceScreen (account) {
      // users have to be eligible for CAD to be part of SMS too.
      // Users selected to be part of the SMS experiment who are
      // in the control group will go to the existing CAD screen.
      if (! this.isEligibleForConnectAnotherDevice(account)) {
        // this shouldn't happen IRL.
        return p.reject(new Error('chooseConnectAnotherDeviceScreen can only be called if user is eligible to connect another device'));
      }

      return this._isEligibleForSms(account)
        .then(({ ok, country }) => {
          if (ok) {
            // User is eligible for SMS experiment, now bucket
            // users into treatment and control groups.
            const group = this.getExperimentGroup('sendSms', { account });
            this.createExperiment('sendSms', group);

            if (group === 'treatment') {
              this.navigate('sms', { account, country });
            } else { // there are only two groups, by default, this is the control
              this.navigate('connect_another_device', { account });
            }
          } else {
            this.navigate('connect_another_device', { account });
          }
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
    _isEligibleForSms (account) {
      return p(
        this._areSmsRequirementsMet(account) &&
        this._smsCountry(account)
      )
      .then((country) => {
        return {
          country,
          ok: !! country
        };
      });
    },

    /**
     * Check if the requirements are met to send an SMS.
     *
     * @param {Object} account
     * @returns {Boolean}
     * @private
     */
    _areSmsRequirementsMet (account) {
      return this.isSignUp() &&
        // If already on a mobile device, doesn't make sense to send an SMS.
        ! this.getUserAgent().isAndroid() &&
        ! this.getUserAgent().isIos() &&
        // If a user is already signed in to Sync which is different to the
        // user that just verified, show them the old "Account verified!" screen.
        ! this.user.isAnotherAccountSignedIn(account) &&
        // Does able say we are eligible for the experiment?
        this.isInExperiment('sendSms', { account });
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
    _smsCountry (account) {
      // The auth server can gate whether users can send an SMS based
      // on the user's country and whether the SMS provider account
      // has sufficient funds.
      return account.smsStatus(this.relier.pick('country'))
        .then((resp = {}) => {
          // If the auth-server says the user is good to send an SMS,
          // check with the experiment choices to ensure SMS is enabled for the country
          // returned in the response. The auth-server may report
          // that SMS is enabled for Romania, though it's only enabled
          // for testing and not for the public at large. Experiment choices are used
          // for this because it's the logic most likely to change.

          // If geo-lookup is disabled, no country is returned, assume US
          const country = resp.country || 'US';
          if (resp.ok && this.isInExperiment('sendSmsEnabledForCountry', { country })) {
            return country;
          }
        }, (err) => {
          // Add `.smsStatus` to the context so we can differentiate between errors
          // checking smsStatus from other XHR errors that occur in the consumer modules.
          err.context = `${this.getViewName()}.smsStatus`;
          // Log and throw away errors from smsStatus, it shouldn't
          // prevent verification from completing. Send the user to
          // /connect_another_device instead. See #5109
          this.logError(err);
        });
    }
  };
});
