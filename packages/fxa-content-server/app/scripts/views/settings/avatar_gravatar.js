/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const _ = require('underscore');
  const AuthErrors = require('lib/auth-errors');
  const AvatarMixin = require('views/mixins/avatar-mixin');
  const Cocktail = require('cocktail');
  const Constants = require('lib/constants');
  const FormView = require('views/form');
  const ImageLoader = require('lib/image-loader');
  const md5 = require('md5');
  const ModalSettingsPanelMixin = require('views/mixins/modal-settings-panel-mixin');
  const ProfileImage = require('models/profile-image');
  const showProgressIndicator = require('views/decorators/progress_indicator');
  const Template = require('stache!templates/settings/avatar_gravatar');

  function t (s) {
    return s;
  }

  var EXPORT_LENGTH = Constants.PROFILE_IMAGE_EXPORT_SIZE;
  var DISPLAY_LENGTH = Constants.PROFILE_IMAGE_DISPLAY_SIZE;
  var GRAVATAR_URL = 'https://secure.gravatar.com/avatar/';

  const proto = FormView.prototype;
  const View = FormView.extend({
    template: Template,
    className: 'avatar-gravatar',
    viewName: 'settings.avatar.gravatar',

    context () {
      return {
        gravatar: this.gravatar
      };
    },

    afterRender () {
      if (! this.gravatar) {
        this._showGravatar();
      }

      return proto.afterRender.call(this);
    },

    _showGravatar: showProgressIndicator(function () {
      return ImageLoader.load(this.gravatarUrl())
        .then(_.bind(this._found, this), _.bind(this._notFound, this));
    }, '.avatar-wrapper', '_gravatarProgressIndicator'),

    _found () {
      this.gravatar = this.gravatarUrl();
      this.render();
    },

    _notFound () {
      this.navigate('settings/avatar/change', {
        error: AuthErrors.toError('NO_GRAVATAR_FOUND')
      });
    },

    gravatarUrl () {
      var hashedEmail = this.hashedEmail();
      if (this.broker.isAutomatedBrowser()) {
        // Don't return a 404 so we can test the success flow
        return GRAVATAR_URL + hashedEmail + '?s=' + DISPLAY_LENGTH;
      }
      return GRAVATAR_URL + hashedEmail + '?s=' + DISPLAY_LENGTH + '&d=404';
    },

    hashedEmail () {
      var email = this.getSignedInAccount().get('email');
      return email ? md5($.trim(email.toLowerCase())) : '';
    },

    submit () {
      var url = this.gravatarUrl();
      var account = this.getSignedInAccount();

      // Use the URL for a full size image
      url = url.slice(0, url.indexOf('?')) + '?s=' + EXPORT_LENGTH;
      this.logAccountImageChange(account);

      return account.postAvatar(url, true)
        .then((result) => {
          this.updateProfileImage(new ProfileImage({ id: result.id, url: url }), account);

          this.navigate('settings', {
            unsafeSuccess: t('Courtesy of <a href="https://www.gravatar.com">Gravatar</a>')
          });
          return result;
        });
    }
  });

  Cocktail.mixin(
    View,
    AvatarMixin,
    ModalSettingsPanelMixin
  );

  module.exports = View;
});
