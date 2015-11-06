/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var AuthErrors = require('lib/auth-errors');
  var CompleteAccountUnlockTemplate = require('stache!templates/complete_account_unlock');
  var FormView = require('views/form');
  var Url = require('lib/url');
  var VerificationInfo = require('models/verification/account-unlock');

  var CompleteAccountUnlockView = FormView.extend({
    template: CompleteAccountUnlockTemplate,
    className: 'complete_account_unlock',

    initialize: function () {
      var searchParams = Url.searchParams(this.window.location.search);
      this._verificationInfo = new VerificationInfo(searchParams);
    },

    beforeRender: function () {
      var self = this;
      var verificationInfo = self._verificationInfo;
      if (! verificationInfo.isValid()) {
        // One or more parameters fails validation. Abort and show an
        // error message before doing any more checks.
        self.logError(AuthErrors.toError('DAMAGED_VERIFICATION_LINK'));
        return true;
      }

      var uid = verificationInfo.get('uid');
      var code = verificationInfo.get('code');

      return this.fxaClient.completeAccountUnlock(uid, code)
        .then(function () {
          self.logViewEvent('verification.success');
          var account = self.user.initAccount({
            code: code,
            uid: uid
          });

          return self.invokeBrokerMethod(
                    'afterCompleteAccountUnlock', account);
        })
        .then(function () {
          self.navigate('account_unlock_complete');
          return false;
        })
        .fail(function (err) {
          if (AuthErrors.is(err, 'UNKNOWN_ACCOUNT')) {
            verificationInfo.markExpired();
            err = AuthErrors.toError('EXPIRED_VERIFICATION_LINK');
          } else if (
              AuthErrors.is(err, 'INVALID_VERIFICATION_CODE') ||
              AuthErrors.is(err, 'INVALID_PARAMETER')) {
            // These server says the verification code or any parameter is
            // invalid. The entire link is damaged.
            verificationInfo.markDamaged();
            err = AuthErrors.toError('DAMAGED_VERIFICATION_LINK');
          } else {
            // all other errors show the standard error box.
            self._error = self.translateError(err);
          }

          self.logError(err);
          return true;
        });
    },

    context: function () {
      var verificationInfo = this._verificationInfo;
      return {
        error: this._error,
        isLinkDamaged: ! verificationInfo.isValid(),
        isLinkExpired: verificationInfo.isExpired()
      };
    }
  });

  module.exports = CompleteAccountUnlockView;
});
