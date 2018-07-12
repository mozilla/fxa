/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthErrors from '../auth-errors';
import BaseExperiment from './base';

/**
 * Track metrics for the password strength experiment.
 */
class PasswordStrengthExperiment extends BaseExperiment {
  notifications = {
    'account.created': 'onAccountCreated',
    'password.error': 'onPasswordError',
  };

  onAccountCreated () {
    this.logEvent('account.created');
  }

  onPasswordError (error) {
    if (AuthErrors.is(error, 'PASSWORD_REQUIRED')) {
      this.logPasswordBlockedError('missing');
    } else if (AuthErrors.is(error, 'PASSWORD_TOO_SHORT')) {
      this.logPasswordBlockedError('too_short');
    } else if (AuthErrors.is(error, 'PASSWORD_SAME_AS_EMAIL')) {
      this.logPasswordBlockedError('email');
    } else if (AuthErrors.is(error, 'PASSWORD_TOO_COMMON')) {
      this.logPasswordBlockedError('common');
    }
  }

  logPasswordBlockedError (state) {
    this.logEvent('blocked');
    this.logEvent(state);
  }
}

export default PasswordStrengthExperiment;
