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
      var email = account.get('email');

      return {
        email: email,
        showSignOut: !account.isFromSync(),
        communicationPrefsVisible: this._areCommunicationPrefsVisible()
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

    afterRender: function () {
      this.logScreenEvent('communication-prefs-link.visible.' +
          String(this._areCommunicationPrefsVisible()));
    },

    submit: function () {
      var self = this;
      var sessionToken = self.getSignedInAccount().get('sessionToken');

      self.logScreenEvent('signout.submit');
      return self.fxaClient.signOut(sessionToken)
        .fail(function () {
          // ignore the error.
          // Clear the session, even on failure. Everything is A-OK.
          // See issue #616
          self.logScreenEvent('signout.error');
        })
        .fin(function () {
          self.logScreenEvent('signout.success');
          self.user.clearSignedInAccount();
          Session.clear();
          self.navigate('signin', {
            success: t('Signed out successfully')
          });
        });
    },

    _isAvatarLinkVisible: function (account) {
      var email = account.get('email');
      // For automated testing accounts, emails begin with "avatarAB-" and end with "restmail.net"
      var isTestAccount = /^avatarAB-.+@restmail\.net$/.test(email);

      return isTestAccount ||
             this.hasDisplayedAccountProfileImage() ||
             account.get('hadProfileImageSetBefore') ||
             this._able.choose('avatarLinkVisible', { email: email });
    },

    _areCommunicationPrefsVisible: function () {
      return this._able.choose('communicationPrefsVisible', {
        lang: this.navigator.language
      });
    },

    _setupAvatarChangeLinks: function (show) {
      if (show) {
        this.$('.change-avatar-text').css('visibility', 'visible');
        this.$('.avatar-wrapper > *').wrap('<a href="/settings/avatar/change" class="change-avatar"></a>');
      }
    },

    afterVisible: function () {
      var self = this;
      var account = self.getSignedInAccount();

      FormView.prototype.afterVisible.call(self);
      return self.displayAccountProfileImage(account)
        .then(function () {
          self._setupAvatarChangeLinks(self._isAvatarLinkVisible(account));
        });
    }
  });

  Cocktail.mixin(View, AvatarMixin, SettingsMixin);

  return View;
});
