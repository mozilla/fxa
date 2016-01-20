/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// `onSignUpSuccess` is shared amongst several views. This is the shared source.

define(function (require, exports, module) {
  'use strict';

  module.exports = {
    onSignUpSuccess: function (account) {
      this.logViewEvent('success');
      if (this._formPrefill) {
        this._formPrefill.clear();
      }
      var self = this;
      if (account.get('verified')) {
        return self.invokeBrokerMethod('afterSignIn', account)
          .then(function () {
            if (self.relier.has('preVerifyToken')) {
              // User was pre-verified.
              self.logViewEvent('preverified.success');
              return self.navigate('signup_complete');
            }

            // Account already existed. There was no need to create it,
            // so we just signed the user in instead.
            // https://github.com/mozilla/fxa-content-server/issues/2778
            return self.navigate('settings');
          });
      } else {
        self.navigate('confirm', {
          account: account
        });
      }
    }
  };
});
