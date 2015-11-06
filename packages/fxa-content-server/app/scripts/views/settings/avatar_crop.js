/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var AuthErrors = require('lib/auth-errors');
  var AvatarMixin = require('views/mixins/avatar-mixin');
  var Cocktail = require('cocktail');
  var Constants = require('lib/constants');
  var Cropper = require('lib/cropper');
  var CropperImage = require('models/cropper-image');
  var FormView = require('views/form');
  var ModalSettingsPanelMixin = require('views/mixins/modal-settings-panel-mixin');
  var p = require('p-promise');
  var ProfileImage = require('models/profile-image');
  var Template = require('stache!templates/settings/avatar_crop');

  var HORIZONTAL_GUTTER = 90;
  var VERTICAL_GUTTER = 0;

  var View = FormView.extend({
    template: Template,
    className: 'avatar-crop',
    viewName: 'settings.avatar.crop',

    initialize: function (options) {
      options = options || {};

      var data = this.ephemeralData() || {};
      this._cropImg = data.cropImg;

      if (! this._cropImg && this.broker.isAutomatedBrowser()) {
        this._cropImg = new CropperImage();
      }
    },

    beforeRender: function () {
      if (! this._cropImg) {
        this.navigate('settings/avatar/change', {
          error: AuthErrors.toMessage('UNUSABLE_IMAGE')
        });
        return false;
      }
    },

    afterRender: function () {
      FormView.prototype.afterRender.call(this);
      this.canvas = this.$('canvas')[0];
    },

    afterVisible: function () {
      // Use pre-set dimensions if available
      var width = this._cropImg.get('width');
      var height = this._cropImg.get('height');
      var src = this._cropImg.get('src');

      try {
        this.cropper = new Cropper({
          container: this.$('.cropper'),
          displayLength: Constants.PROFILE_IMAGE_DISPLAY_SIZE,
          exportLength: Constants.PROFILE_IMAGE_EXPORT_SIZE,
          height: height,
          horizontalGutter: HORIZONTAL_GUTTER,
          onRotate: this._onRotate.bind(this),
          onTranslate: this._onTranslate.bind(this),
          onZoomIn: this._onZoomIn.bind(this),
          onZoomOut: this._onZoomOut.bind(this),
          onZoomRangeChange: this._onZoomRangeChange.bind(this),
          src: src,
          verticalGutter: VERTICAL_GUTTER,
          width: width
        });
      } catch (e) {
        // settings_common functional tests visit this page directly so draggable
        // won't be preloaded. Ignore errors about that– they don't matter.
        if (this.broker.isAutomatedBrowser() && e.message.indexOf('draggable') !== -1) {
          return;
        }

        this.navigate('settings/avatar/change', {
          error: AuthErrors.toMessage('UNUSABLE_IMAGE')
        });
      }
    },

    toBlob: function () {
      var defer = p.defer();

      this.cropper.toBlob(function (data) {
        defer.resolve(data);
      }, this._cropImg.get('type'),
      Constants.PROFILE_IMAGE_JPEG_QUALITY);

      return defer.promise;
    },

    submit: function () {
      var self = this;
      var account = self.getSignedInAccount();

      self.logAccountImageChange(account);

      return self.toBlob()
        .then(function (data) {
          return account.uploadAvatar(data);
        })
        .then(function (result) {
          self.updateProfileImage(new ProfileImage(result), account);
          self.navigate('settings');
          return result;
        });
    },

    _onRotate: function () {
      this.logViewEvent('rotate.cw');
    },

    _onTranslate: function () {
      this.logViewEvent('translate');
    },

    _onZoomIn: function () {
      this.logViewEvent('zoom.in');
    },

    _onZoomOut: function () {
      this.logViewEvent('zoom.out');
    },

    _onZoomRangeChange: function () {
      this.logViewEvent('zoom.range');
    }

  });

  Cocktail.mixin(
    View,
    AvatarMixin,
    ModalSettingsPanelMixin
  );

  module.exports = View;
});
