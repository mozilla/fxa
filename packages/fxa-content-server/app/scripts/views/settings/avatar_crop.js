/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'p-promise',
  'underscore',
  'views/form',
  'stache!templates/settings/avatar_crop',
  'lib/constants',
  'lib/session',
  'lib/cropper',
  'lib/auth-errors'
],
function (p, _, FormView, Template, Constants, Session, Cropper, AuthErrors) {
  var HORIZONTAL_GUTTER = 90;
  var VERTICAL_GUTTER = 0;

  var View = FormView.extend({
    // user must be authenticated to see Settings
    mustAuth: true,

    template: Template,
    className: 'avatar-crop',

    initialize: function (options) {
      options = options || {};

      this.imgSrc = Session.cropImgSrc;
      this.imgType = Session.cropImgType;
    },

    beforeRender: function () {
      if (! this.imgSrc) {
        this.navigate('settings/avatar/change', {
          error: AuthErrors.toMessage('UNUSABLE_IMAGE')
        });
        return false;
      }
    },

    afterRender: function () {
      this.canvas = this.$('canvas')[0];
    },

    afterVisible: function () {
      // Use pre-set dimensions if available
      var width = Session.cropImgWidth;
      var height = Session.cropImgHeight;

      try {
        this.cropper = new Cropper({
          container: this.$('.cropper'),
          src: this.imgSrc,
          width: width,
          height: height,
          displayLength: Constants.PROFILE_IMAGE_DISPLAY_SIZE,
          exportLength: Constants.PROFILE_IMAGE_EXPORT_SIZE,
          verticalGutter: VERTICAL_GUTTER,
          horizontalGutter: HORIZONTAL_GUTTER
        });
      } catch (e) {
        this.navigate('settings/avatar/change', {
          error: AuthErrors.toMessage('UNUSABLE_IMAGE')
        });
      }
    },

    toBlob: function () {
      var defer = p.defer();

      this.cropper.toBlob(function (data) {
        defer.resolve(data);
      }, this.imgType || Constants.DEFAULT_PROFILE_IMAGE_MIME_TYPE,
      Constants.PROFILE_IMAGE_JPEG_QUALITY);

      return defer.promise;
    },

    submit: function () {
      var self = this;

      return self.toBlob()
        .then(function (data) {
          return self.currentAccount().uploadAvatar(data);
        })
        .then(function (result) {
          self.navigate('settings/avatar');
          return result;
        });
    }

  });

  return View;
});
