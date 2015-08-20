/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'jquery',
  'underscore',
  'md5',
  'cocktail',
  'views/form',
  'views/mixins/avatar-mixin',
  'views/mixins/modal-settings-panel-mixin',
  'views/mixins/settings-mixin',
  'stache!templates/settings/avatar_gravatar',
  'lib/auth-errors',
  'lib/constants',
  'lib/image-loader',
  'views/decorators/progress_indicator',
  'models/profile-image'
],
function ($, _, md5, Cocktail, FormView, AvatarMixin, ModalSettingsPanelMixin, SettingsMixin,
    Template, AuthErrors, Constants, ImageLoader, showProgressIndicator, ProfileImage) {
  'use strict';

  function t (s) { return s; }

  var EXPORT_LENGTH = Constants.PROFILE_IMAGE_EXPORT_SIZE;
  var DISPLAY_LENGTH = Constants.PROFILE_IMAGE_DISPLAY_SIZE;
  var GRAVATAR_URL = 'https://secure.gravatar.com/avatar/';

  var View = FormView.extend({
    template: Template,
    className: 'avatar-gravatar',

    context: function () {
      return {
        gravatar: this.gravatar
      };
    },

    afterRender: function () {
      if (! this.gravatar) {
        this._showGravatar();
      }
    },

    _showGravatar: showProgressIndicator(function () {
      return ImageLoader.load(this.gravatarUrl())
        .then(_.bind(this._found, this), _.bind(this._notFound, this));
    }, '.avatar-wrapper', '_gravatarProgressIndicator'),

    _found: function () {
      this.gravatar = this.gravatarUrl();
      this.render();
    },

    _notFound: function () {
      this.navigate('settings/avatar/change', {
        error: AuthErrors.toError('NO_GRAVATAR_FOUND')
      });
    },

    gravatarUrl: function () {
      var hashedEmail = this.hashedEmail();
      if (this.broker.isAutomatedBrowser()) {
        // Don't return a 404 so we can test the success flow
        return GRAVATAR_URL + hashedEmail + '?s=' + DISPLAY_LENGTH;
      }
      return GRAVATAR_URL + hashedEmail + '?s=' + DISPLAY_LENGTH + '&d=404';
    },

    hashedEmail: function () {
      var email = this.getSignedInAccount().get('email');
      return email ? md5($.trim(email.toLowerCase())) : '';
    },

    submit: function () {
      var self = this;
      var url = self.gravatarUrl();
      var account = self.getSignedInAccount();

      // Use the URL for a full size image
      url = url.slice(0, url.indexOf('?')) + '?s=' + EXPORT_LENGTH;
      self.logAccountImageChange(account);

      return account.postAvatar(url, true)
        .then(function (result) {
          self.updateProfileImage(new ProfileImage({ url: url, id: result.id }), account);

          self.navigate('settings', {
            successUnsafe: t('Courtesy of <a href="https://www.gravatar.com">Gravatar</a>')
          });
          return result;
        });
    }
  });

  Cocktail.mixin(
    View,
    AvatarMixin,
    ModalSettingsPanelMixin,
    SettingsMixin
  );

  return View;
});
