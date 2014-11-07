/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'lib/session',
  'views/form',
  'views/base',
  'views/mixins/avatar-mixin',
  'stache!templates/settings'
],
function (_, Session, FormView, BaseView, AvatarMixin, Template) {
  var t = BaseView.t;

  var View = FormView.extend({
    // user must be authenticated and verified to see Settings
    mustVerify: true,

    template: Template,
    className: 'settings',

    initialize: function () {
      var self = this;
      var uid = self.searchParam('uid');

      // We set the current account to the one with `uid` if
      // it exists in our list of cached accounts. If it doesn't,
      // clear the current account.
      // The `mustVerify` flag will ensure that the account is valid.
      if (self.user.getAccountByUid(uid).get('uid')) {
        self.user.setCurrentAccountByUid(uid);
      } else if (uid) {
        Session.clear();
        self.user.clearCurrentAccount();
      }
    },

    context: function () {
      return {
        email: this.currentAccount().get('email'),
        showSignOut: !this.currentAccount().isFromSync()
      };
    },

    events: {
      // validateAndSubmit is used to prevent multiple concurrent submissions.
      'click #signout': BaseView.preventDefaultThen('validateAndSubmit')
    },

    submit: function () {
      var self = this;
      return self.fxaClient.signOut(self.currentAccount().get('sessionToken'))
              .then(function () {
                // user's session is gone
                self.user.clearCurrentAccount();
                Session.clear();
              }, function () {
                // Clear the session, even on failure. Everything is A-OK.
                // See issue #616
                // - https://github.com/mozilla/fxa-content-server/issues/616
                self.user.clearCurrentAccount();
                Session.clear();
              })
              .then(function () {
                self.navigate('signin', {
                  success: t('Signed out')
                });
              });
    },

    afterVisible: function () {
      FormView.prototype.afterVisible.call(this);
      return this._displayProfileImage(this.currentAccount());
    }
  });

  _.extend(View.prototype, AvatarMixin);

  return View;
});
