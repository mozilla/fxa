/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'cocktail',
  'views/base',
  'views/form',
  'stache!templates/delete_account',
  'lib/session',
  'lib/auth-errors',
  'views/mixins/password-mixin',
  'views/mixins/service-mixin',
  'views/mixins/back-mixin',
  'views/mixins/account-locked-mixin'
],
function (Cocktail, BaseView, FormView, Template, Session, AuthErrors,
      PasswordMixin, ServiceMixin, BackMixin, AccountLockedMixin) {
  var t = BaseView.t;

  var View = FormView.extend({
    // user must be authenticated to delete their account
    mustAuth: true,

    template: Template,
    className: 'delete-account',

    context: function () {
      return {
        email: this.getSignedInAccount().get('email')
      };
    },

    submit: function () {
      var self = this;
      var account = self.getSignedInAccount();
      var email = account.get('email');
      var password = self.getElementValue('.password');
      return self.fxaClient.deleteAccount(email, password)
        .then(function () {
          Session.clear();
          self.user.removeAccount(account);

          self.navigate('signup', {
            success: t('Account deleted successfully')
          });
        }, function (err) {
          if (AuthErrors.is(err, 'ACCOUNT_LOCKED')) {
            // the password is needed to poll whether the account has
            // been unlocked.
            account.set('password', password);
            return self.notifyOfLockedAccount(account);
          }

          // re-throw error, it will be handled at a lower level.
          throw err;
        });
    }
  });

  Cocktail.mixin(
    View,
    PasswordMixin,
    ServiceMixin,
    BackMixin,
    AccountLockedMixin
  );

  return View;
});

