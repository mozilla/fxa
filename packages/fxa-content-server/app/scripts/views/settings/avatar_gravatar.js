/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'jquery',
  'underscore',
  'md5',
  'views/form',
  'stache!templates/settings/avatar_gravatar',
  'lib/constants',
  'lib/session',
  'lib/profile',
  'lib/image-loader',
  'views/decorators/progress_indicator'
],
function ($, _, md5, FormView, Template, Constants, Session, Profile, ImageLoader, showProgressIndicator) {

  function t (s) { return s; }

  var EXPORT_LENGTH = Constants.PROFILE_IMAGE_EXPORT_SIZE;
  var DISPLAY_LENGTH = Constants.PROFILE_IMAGE_DISPLAY_SIZE;
  var GRAVATAR_URL = 'https://secure.gravatar.com/avatar/';

  var View = FormView.extend({
    // user must be authenticated to see Settings
    mustAuth: true,

    template: Template,
    className: 'avatar_gravatar',

    initialize: function () {
      this.email = Session.email;
      if (this.email) {
        this.hashedEmail = this._hashEmail(this.email);
      }
    },

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
      this.navigate('settings/avatar', {
        error: t('No Gravatar found')
      });
    },

    gravatarUrl: function () {
      if (this.automatedBrowser) {
        // Don't return a 404 so we can test the success flow
        return GRAVATAR_URL + this.hashedEmail + '?s=' + DISPLAY_LENGTH;
      }
      return GRAVATAR_URL + this.hashedEmail + '?s=' + DISPLAY_LENGTH + '&d=404';
    },

    _hashEmail: function (email) {
      return md5($.trim(email.toLowerCase()));
    },

    submit: function () {
      var self = this;
      var url = this.gravatarUrl();
      // Use the URL for a full size image
      url = url.slice(0, url.indexOf('?')) + '?s=' + EXPORT_LENGTH;

      return this.profileClient.postAvatar(url)
        .then(function (result) {
          self.navigate('settings/avatar', {
            successUnsafe: t('Courtesy of <a href="https://www.gravatar.com">Gravatar</a>')
          });
          return result;
        });
    }
  });

  return View;
});
