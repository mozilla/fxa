/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Shared implementation of `onSignInSuccess` view method

define(function (require, exports, module) {
  'use strict';

  module.exports = function (brokerMethod, navigateData) {
    brokerMethod = brokerMethod || 'afterSignIn';
    return {
      onSignInSuccess: function (account) {
        this.logViewEvent('success');
        if (this._formPrefill) {
          this._formPrefill.clear();
        }
        return this.invokeBrokerMethod(brokerMethod, account)
          .then(this.navigate.bind(this, this.model.get('redirectTo') || 'settings', {}, navigateData));
      }
    };
  };
});
