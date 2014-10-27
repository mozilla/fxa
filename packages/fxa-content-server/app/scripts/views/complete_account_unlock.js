/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'views/form',
  'views/base',
  'stache!templates/complete_account_unlock',
  'lib/auth-errors',
  'lib/validate'
],
function (FormView, BaseView, CompleteAccountUnlockTemplate, AuthErrors,
    Validate) {

  function isLinkValid(uid, code) {
    return Validate.isUidValid(uid) && Validate.isCodeValid(code);
  }

  var CompleteAccountUnlockView = FormView.extend({
    template: CompleteAccountUnlockTemplate,
    className: 'complete_account_unlock',

    beforeRender: function () {
      try {
        this.importSearchParam('uid');
        this.importSearchParam('code');
      } catch(e) {
        this._isLinkDamaged = true;
        this.logScreenEvent('link_damaged');
        // This is an invalid link. Abort and show an error message
        // before doing any more checks.
        return true;
      }

      // Remove any spaces that are probably due to a MUA adding
      // line breaks in the middle of the link.
      this.uid = this.uid.replace(/ /g, '');
      this.code = this.code.replace(/ /g, '');

      if (! isLinkValid(this.uid, this.code)) {
        // One or more parameters fails validation. Abort and show an
        // error message before doing any more checks.
        this._isLinkDamaged = true;
        this.logScreenEvent('link_damaged');
        return true;
      }

      var self = this;
      return this.fxaClient.completeAccountUnlock(this.uid, this.code)
        .then(function () {
          self.logScreenEvent('verification.success');
          self.navigate('account_unlock_complete');
          return false;
        })
        .fail(function (err) {
          if (AuthErrors.is(err, 'UNKNOWN_ACCOUNT')) {
            self._isLinkExpired = true;
            self.logScreenEvent('link_expired');
          } else if (AuthErrors.is(err, 'INVALID_VERIFICATION_CODE') ||
              AuthErrors.is(err, 'INVALID_PARAMETER')) {
            // These errors show a link damaged screen
            self._isLinkDamaged = true;
            self.logScreenEvent('link_damaged');
          } else {
            // all other errors show the standard error box.
            self._error = self.translateError(err);
          }
          return true;
        });
    },

    context: function () {
      return {
        isLinkDamaged: this._isLinkDamaged,
        isLinkExpired: this._isLinkExpired,

        error: this._error
      };
    }
  });

  return CompleteAccountUnlockView;
});
