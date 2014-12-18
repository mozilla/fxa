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

      // A uid param is set by RPs linking directly to the settings
      // page for a particular account.
      // We set the current account to the one with `uid` if
      // it exists in our list of cached accounts. If it doesn't,
      // clear the current account.
      // The `mustVerify` flag will ensure that the account is valid.
      if (! self.user.getAccountByUid(uid).isEmpty()) {
        // The account with uid exists; set it to our current account.
        self.user.setCurrentAccountByUid(uid);
      } else if (uid) {
        Session.clear();
        self.user.clearCurrentAccount();
      }
    },

    context: function () {
      var account = this.signedInAccount();
      return {
        email: account.get('email'),
        showSignOut: !account.isFromSync(),
        avatarLinkVisible: this._isAvatarLinkVisible(account.get('email'))
      };
    },

    events: {
      // validateAndSubmit is used to prevent multiple concurrent submissions.
      'click #signout': BaseView.preventDefaultThen('validateAndSubmit')
    },

    submit: function () {
      var self = this;
      return self.fxaClient.signOut(self.signedInAccount().get('sessionToken'))
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

    _isAvatarLinkVisible: function (email) {
      // For automated testing accounts, emails begin with "avatarAB-" and end with "restmail.net"
      var isTestAccount = /^avatarAB-.+@restmail\.net$/.test(email);
      var isMozillaAccount = /@mozilla\.(?:com|org)$/.test(email);

      return isTestAccount || isMozillaAccount;
    },

    afterVisible: function () {
      var account = this.signedInAccount();
      var imageContainerSelector = this._isAvatarLinkVisible(account.get('email')) ?
                                     '.avatar-wrapper a.change-avatar' :
                                     '.avatar-wrapper';

      FormView.prototype.afterVisible.call(this);
      return this._displayProfileImage(account, imageContainerSelector);
    }
  });

  _.extend(View.prototype, AvatarMixin);

  return View;
});
