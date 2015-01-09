/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'cocktail',
  'lib/session',
  'views/form',
  'views/base',
  'views/mixins/avatar-mixin',
  'views/mixins/settings-mixin',
  'stache!templates/settings'
],
function (_, Cocktail, Session, FormView, BaseView, AvatarMixin, SettingsMixin, Template) {
  var t = BaseView.t;

  var View = FormView.extend({
    template: Template,
    className: 'settings',

    context: function () {
      var account = this.getSignedInAccount();
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
      return self.fxaClient.signOut(self.getSignedInAccount().get('sessionToken'))
              .then(function () {
                // user's session is gone
                self.user.clearSignedInAccount();
                Session.clear();
              }, function () {
                // Clear the session, even on failure. Everything is A-OK.
                // See issue #616
                // - https://github.com/mozilla/fxa-content-server/issues/616
                self.user.clearSignedInAccount();
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
      var account = this.getSignedInAccount();
      var imageContainerSelector = this._isAvatarLinkVisible(account.get('email')) ?
                                     '.avatar-wrapper a.change-avatar' :
                                     '.avatar-wrapper';

      FormView.prototype.afterVisible.call(this);
      return this._displayProfileImage(account, imageContainerSelector);
    }
  });

  Cocktail.mixin(View, AvatarMixin, SettingsMixin);

  return View;
});
