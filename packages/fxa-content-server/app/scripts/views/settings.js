/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'cocktail',
  'lib/session',
  'views/form',
  'views/base',
  'views/mixins/avatar-mixin',
  'views/mixins/settings-mixin',
  'stache!templates/settings'
],
function (Cocktail, Session, FormView, BaseView, AvatarMixin,
  SettingsMixin, Template) {
  var t = BaseView.t;

  var View = FormView.extend({
    template: Template,
    className: 'settings',

    initialize: function (options) {
      options = options || {};

      this._able = options.able;
    },

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

    beforeRender: function () {
      if (this.relier.get('setting') === 'avatar') {
        this.navigate('/settings/avatar/change');
        return false;
      }
    },

    submit: function () {
      var self = this;
      var sessionToken = self.getSignedInAccount().get('sessionToken');
      return self.fxaClient.signOut(sessionToken)
        .fail(function () {
          // ignore the error.
          // Clear the session, even on failure. Everything is A-OK.
          // See issue #616
        })
        .fin(function () {
          self.user.clearSignedInAccount();
          Session.clear();
          self.navigate('signin', {
            success: t('Signed out successfully')
          });
        });
    },

    _isAvatarLinkVisible: function (email) {
      // For automated testing accounts, emails begin with "avatarAB-" and end with "restmail.net"
      var isTestAccount = /^avatarAB-.+@restmail\.net$/.test(email);

      return isTestAccount || this._able.choose('avatarLinkVisible', { email: email });
    },

    afterVisible: function () {
      var account = this.getSignedInAccount();
      var imageContainerSelector = this._isAvatarLinkVisible(account.get('email')) ?
                                     '.avatar-wrapper a.change-avatar' :
                                     '.avatar-wrapper';

      FormView.prototype.afterVisible.call(this);
      return this.displayAccountProfileImage(account, imageContainerSelector);
    }
  });

  Cocktail.mixin(View, AvatarMixin, SettingsMixin);

  return View;
});
