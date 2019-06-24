/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Poll for signup/signin confirmation for `account`.
 *
 * Triggers a `confirmed` message whenever the user has
 * confirmed the session.
 *
 * Triggers an `error` message if there was an error.
 */

import AuthErrors from '../../lib/auth-errors';
import Backbone from 'backbone';
import { VERIFICATION_POLL_IN_MS } from '../../lib/constants';

export default class SessionVerificationPoll extends Backbone.Model {
  constructor(data, options = {}) {
    super(options, data);

    if (!options.account) {
      throw new Error('options.account required');
    }

    this._account = options.account;
    this._pollIntervalInMS =
      options.pollIntervalInMS || VERIFICATION_POLL_IN_MS;
    this._window = options.window;
  }

  destroy() {
    this.stop();

    super.destroy();
  }

  /**
   * Start waiting for a signup confirmation
   */
  start() {
    if (!this._isWaiting) {
      this._isWaiting = true;
      this._poll();
    }
  }

  /**
   * Stop waiting for a signup confirmation
   */
  stop() {
    if (this._pollTimeout) {
      this._window.clearTimeout(this._pollTimeout);
      this._pollTimeout = null;
    }
    this._isWaiting = false;
  }

  _poll() {
    if (!this._isWaiting) {
      return;
    }

    this._account
      .sessionStatus()
      .then(
        result => this._onStatusComplete(result),
        err => this._onStatusError(err)
      );
  }

  _onStatusComplete(result) {
    if (!this._isWaiting) {
      // no longer care about the result, abort.
      return;
    }

    if (result.verified) {
      this.trigger('verified');
      this._pollTimeout = null;
      this.stop();
    } else {
      this._pollTimeout = this._window.setTimeout(
        () => this._poll(),
        this._pollIntervalInMS
      );
    }
  }

  _onStatusError(err) {
    // The user's email may have bounced because it's invalid. Check
    // if the account still exists, if it doesn't, it means the email
    // bounced. Show a message allowing the user to sign up again.
    //
    // This makes the huge assumption that a confirmation email
    // was sent.
    if (AuthErrors.is(err, 'INVALID_TOKEN') && this._account.has('uid')) {
      this._account.checkUidExists().then(accountExists => {
        if (!accountExists) {
          err = AuthErrors.toError('SIGNUP_EMAIL_BOUNCE');
        }

        // account exists, but sessionToken has been invalidated.
        this.trigger('error', err);
        this.stop();
      });
    } else {
      this.trigger('error', err);
      this.stop();
    }
  }
}
