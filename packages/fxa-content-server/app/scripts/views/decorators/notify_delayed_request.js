/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Function decorator to show a notice when requests take
 * longer than expected
 */

import AuthErrors from '../../lib/auth-errors';

function notifyDelayedRequest(handler) {
  return function() {
    var args = arguments;
    var workingText;

    this.clearTimeout(this._workingTimeout);

    this._workingTimeout = this.setTimeout(() => {
      var err = AuthErrors.toError('WORKING');
      workingText = this.displayError(err);
    }, this.LONGER_THAN_EXPECTED);

    return Promise.resolve()
      .then(() => this.invokeHandler(handler, args))
      .then(
        value => {
          this.clearTimeout(this._workingTimeout);
          if (workingText === this.$('.error').text()) {
            this.hideError();
          }
          return value;
        },
        err => {
          this.clearTimeout(this._workingTimeout);
          throw err;
        }
      );
  };
}

export default notifyDelayedRequest;
