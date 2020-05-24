/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Use to listen for signup/signin verification.
 *
 * Call `waitForSessionVerification` with a callback that is invoked
 * when the session becomes verified.
 *
 * Polling is automatically terminated when view is destroyed.
 */

import AuthErrors from '../../lib/auth-errors';
import SessionVerificationPoll from '../../models/polls/session-verification';
import { VERIFICATION_POLL_IN_MS } from '../../lib/constants';
import VerificationReasonMixin from './verification-reason-mixin';

export default {
  dependsOn: [VerificationReasonMixin],

  // used by unit tests
  VERIFICATION_POLL_IN_MS,

  initialize(options = {}) {
    this._sessionVerificationPoll = options.sessionVerificationPoll;
  },

  beforeDestroy() {
    if (this._sessionVerificationPoll) {
      this._sessionVerificationPoll.destroy();
      this._sessionVerificationPoll = null;
    }
  },

  /**
   * Call `onVerified` when `account`s session becomes verified.
   *
   * @param {Object} account to wait to become verified
   * @param {Function} onVerified called when `account` becomes verified
   */
  waitForSessionVerification(account, onVerified) {
    const sessionVerificationPoll = this.getSessionVerificationPoll(account);

    this.listenTo(sessionVerificationPoll, 'verified', onVerified);
    this.listenTo(sessionVerificationPoll, 'error', (err) =>
      this._handleSessionVerificationPollErrors(account, err)
    );

    sessionVerificationPoll.start();
  },

  /**
   * Get a session verification poll for `account`
   *
   * @param {Object} account
   * @returns {Object} SessionVerificationPoll
   */
  getSessionVerificationPoll(account) {
    if (!this._sessionVerificationPoll) {
      this._sessionVerificationPoll = new SessionVerificationPoll(
        {},
        {
          account,
          pollIntervalInMS: this.VERIFICATION_POLL_IN_MS,
          window: this.window,
        }
      );
    }
    return this._sessionVerificationPoll;
  },

  /**
   * Handle SessionVerificationPoll errors
   *
   * @param {Object} account
   * @param {Error} err
   * @private
   */
  _handleSessionVerificationPollErrors(account, err) {
    // The user's email may have bounced because it was invalid.
    // Redirect them to the sign up page with an error notice.
    if (
      AuthErrors.is(err, 'SIGNUP_EMAIL_BOUNCE') ||
      AuthErrors.is(err, 'INVALID_TOKEN')
    ) {
      account.set('hasBounced', true);
      if (this.isSignUp()) {
        this.replaceCurrentPage('/', {
          account,
        });
      } else {
        this.replaceCurrentPage('signin_bounced', account.pick('email'));
      }
    } else if (
      AuthErrors.is(err, 'UNEXPECTED_ERROR') ||
      AuthErrors.is(err, 'BACKEND_SERVICE_FAILURE')
    ) {
      // Hide the error from the user if it is an unexpected error.
      // an error may happen here if the status api is overloaded or
      // if the user is switching networks.
      // Report a known error to Sentry, but not the user.
      // Details: github.com/mozilla/fxa-content-server/issues/2638.
      this.logError(AuthErrors.toError('POLLING_FAILED'));

      this.setTimeout(
        () => this.getSessionVerificationPoll(account).start(),
        this.VERIFICATION_POLL_IN_MS
      );
    } else {
      this.displayError(err);
    }
  },
};
