/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/form',
  'views/base',
  'stache!templates/complete_sign_up',
  'lib/fxa-client',
  'lib/auth-errors',
  'lib/validate'
],
function (_, FormView, BaseView, CompleteSignUpTemplate, FxaClient, AuthErrors, Validate) {
  var CompleteSignUpView = FormView.extend({
    template: CompleteSignUpTemplate,
    className: 'complete_sign_up',

    beforeRender: function () {
      try {
        this.importSearchParam('uid');
        this.importSearchParam('code');
      } catch(e) {
        this.logEvent('complete_sign_up:link_damaged');
        // This is an invalid link. Abort and show an error message
        // before doing any more checks.
        return true;
      }

      if (! this._doesLinkValidate()) {
        // One or more parameters fails validation. Abort and show an
        // error message before doing any more checks.
        this.logEvent('complete_sign_up:link_damaged');
        return true;
      }

      var self = this;
      return this.fxaClient.verifyCode(this.uid, this.code)
          .then(function () {
            self.navigate('signup_complete');
            return false;
          })
          .then(null, function (err) {
            if (AuthErrors.is(err, 'UNKNOWN_ACCOUNT') ||
                AuthErrors.is(err, 'INVALID_VERIFICATION_CODE') ||
                AuthErrors.is(err, 'INVALID_PARAMETER')) {
              // These errors show a link damaged screen
              self._isLinkDamaged = true;
              self.logEvent('complete_sign_up:link_damaged');
            } else {
              // all other errors show the standard error box.
              self._error = self.translateError(err);
            }
            return true;
          });
    },

    _doesLinkValidate: function () {
      return Validate.isUidValid(this.uid) &&
             Validate.isCodeValid(this.code) &&
             ! this._isLinkDamaged;
    },

    context: function () {
      var doesLinkValidate = this._doesLinkValidate();

      return {
        // If the link is invalid, print a special error message.
        isLinkDamaged: ! doesLinkValidate,
        error: this._error
      };
    }
  });

  return CompleteSignUpView;
});
