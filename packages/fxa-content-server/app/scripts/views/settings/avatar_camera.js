/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var AuthErrors = require('lib/auth-errors');
  var AvatarMixin = require('views/mixins/avatar-mixin');
  var canvasToBlob = require('canvasToBlob'); //eslint-disable-line no-unused-vars
  var Cocktail = require('cocktail');
  var Constants = require('lib/constants');
  var Environment = require('lib/environment');
  var FormView = require('views/form');
  var ModalSettingsPanelMixin = require('views/mixins/modal-settings-panel-mixin');
  var p = require('lib/promise');
  var ProfileImage = require('models/profile-image');
  var ProgressIndicator = require('views/progress_indicator');
  var Template = require('stache!templates/settings/avatar_camera');

  // a blank 1x1 png
  var pngSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQYV2P4DwABAQEAWk1v8QAAAABJRU5ErkJggg==';

  var EXPORT_LENGTH = Constants.PROFILE_IMAGE_EXPORT_SIZE;
  var DISPLAY_LENGTH = Constants.PROFILE_IMAGE_DISPLAY_SIZE;
  var JPEG_QUALITY = Constants.PROFILE_IMAGE_JPEG_QUALITY;
  var MIME_TYPE = Constants.DEFAULT_PROFILE_IMAGE_MIME_TYPE;

  var View = FormView.extend({
    template: Template,
    className: 'avatar-camera',
    viewName: 'settings.avatar.camera',

    context: function () {
      return {
        streaming: this.streaming
      };
    },

    initialize: function (options) {
      var self = this;

      self.exportLength = options.exportLength || EXPORT_LENGTH;
      self.displayLength = options.displayLength || DISPLAY_LENGTH;
      self.streaming = false;


      if (self.broker.isAutomatedBrowser()) {
        var ARTIFICIAL_DELAY = 3000; // 3 seconds
        // mock some things out for automated browser testing
        self.streaming = true;
        self._getMedia = function () {
          self.enableSubmitIfValid();
        };
        self.stream = {
          stop: function () {}
        };

        self.window.setTimeout(_.bind(self.onLoadedMetaData, self), ARTIFICIAL_DELAY);
      }
    },

    _getMedia: function () {
      var self = this;
      var nav = self.window.navigator;

      var getUserMedia = nav.getUserMedia ||
                             nav.webkitGetUserMedia ||
                             nav.mozGetUserMedia ||
                             nav.msGetUserMedia;

      var getMedia = _.bind(getUserMedia, nav);

      getMedia(
        {
          audio: false,
          video: true
        },
        function (stream) {
          self.stream = stream;
          if (nav.mozGetUserMedia) {
            self.video.mozSrcObject = stream;
          } else {
            var vendorURL = self.window.URL || self.window.webkitURL;
            self.video.src = vendorURL.createObjectURL(stream);
          }
          self.video.play();
        },
        function () {
          self._avatarProgressIndicator.done();
          self.displayError(AuthErrors.toError('NO_CAMERA'));
        }
      );
    },

    beforeRender: function () {
      var environment = new Environment(this.window);
      if (! environment.hasGetUserMedia()) {
        // no camera support, send user back to the change avatar page.
        this.navigate('settings/avatar/change', {
          error: AuthErrors.toError('NO_CAMERA')
        });
        return false;
      }
    },

    afterRender: function () {
      this._getMedia();

      this._avatarProgressIndicator = new ProgressIndicator();
      this.wrapper = this.$('#avatar-camera-wrapper');
      this.video = this.$('#video')[0];

      this._avatarProgressIndicator.start(this.$('.progress-container'));

      this.canvas = this.$('#canvas')[0];

      this.video.addEventListener('loadedmetadata', _.bind(this.onLoadedMetaData, this), false);
    },

    onLoadedMetaData: function () {
      if (! this.streaming) {
        var vw = this.video.videoWidth;
        var vh = this.video.videoHeight;

        // Log metrics if these are 0; something with the browser/machine isn't right
        if (vh === 0 || vw === 0) {
          this.logError(AuthErrors.toError('INVALID_CAMERA_DIMENSIONS'));
        }

        if (vh > vw) {
          // The camera is in portrait mode
          this.width = this.displayLength;
          this.height = vh / (vw / this.width);
        } else {
          // The camera is in landscape mode
          this.height = this.displayLength;
          this.width = vw / (vh / this.height);
        }

        var pos = this.centeredPos(this.width, this.height, this.displayLength);
        this.wrapper.css({ marginLeft: pos.left, marginTop: pos.top });
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this._avatarProgressIndicator.done();
        this.$('.progress-container').addClass('hidden');
        this.$('#video').height(this.height).removeClass('hidden');
        this.streaming = true;

        this.enableSubmitIfValid();
      } else {
        this._avatarProgressIndicator.done();
      }
    },

    isValidEnd: function () {
      return this.streaming;
    },

    submit: function () {
      var self = this;
      var account = self.getSignedInAccount();
      self.logAccountImageChange(account);

      return self.takePicture()
        .then(function (data) {
          return account.uploadAvatar(data);
        })
        .then(function (result) {
          self.stream.stop();
          delete self.stream;

          self.updateProfileImage(new ProfileImage(result), account);
          self.navigate('settings');
          return result;
        });
    },

    beforeDestroy: function () {
      if (this.stream) {
        this.stream.stop();
        delete this.stream;
      }
    },

    takePicture: function takepicture() {
      var defer = p.defer();

      var w = this.video.videoWidth;
      var h = this.video.videoHeight;
      var minValue = Math.min(h, w);

      this.canvas.width = this.exportLength;
      this.canvas.height = this.exportLength;

      var pos = this.centeredPos(w, h, minValue);

      var dataSrc = this.video;
      if (this.broker.isAutomatedBrowser()) {
        dataSrc = new Image();
        dataSrc.src = pngSrc;
      }

      this.canvas.getContext('2d').drawImage(
        dataSrc,
        Math.abs(pos.left),
        Math.abs(pos.top),
        minValue,
        minValue,
        0, 0, this.exportLength, this.exportLength
      );

      this.canvas.toBlob(function (data) {
        defer.resolve(data);
      }, MIME_TYPE, JPEG_QUALITY);

      return defer.promise;
    },

    // Calculates the position offset needed to center a rectangular image
    // in a square container
    centeredPos: function (w, h, max) {
      if (w > h) {
        return { left: (max - w) / 2, top: 0 };
      } else {
        return { left: 0, top: (max - h) / 2 };
      }
    }
  });

  Cocktail.mixin(
    View,
    AvatarMixin,
    ModalSettingsPanelMixin
  );

  module.exports = View;
});
