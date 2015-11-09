/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// `onSignUpSuccess` is shared amongst several views. This is the shared source.

define(function (require, exports, module) {
  'use strict';


  module.exports = {
    onSignUpSuccess: function (account) {
      var self = this;
      if (account.get('verified')) {
        // user was pre-verified, notify the broker.
        return self.invokeBrokerMethod('afterSignIn', account)
          .then(function () {
            self.navigate('signup_complete');
          });
      } else {
        self.navigate('confirm', {
          data: {
            account: account
          }
        });
      }
    }
  };
});
