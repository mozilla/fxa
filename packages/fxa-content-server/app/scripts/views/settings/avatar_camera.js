/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* exceptsPaths: canvasToBlob */
define([
  'underscore',
  'cocktail',
  'canvasToBlob',
  'views/form',
  'views/progress_indicator',
  'views/mixins/avatar-mixin',
  'views/mixins/modal-settings-panel-mixin',
  'views/mixins/settings-mixin',
  'stache!templates/settings/avatar_camera',
  'lib/constants',
  'lib/promise',
  'lib/auth-errors',
  'lib/environment',
  'models/profile-image'
],
function (_, Cocktail, canvasToBlob, FormView, ProgressIndicator,
    AvatarMixin, ModalSettingsPanelMixin, SettingsMixin, Template, Constants, p,
    AuthErrors, Environment, ProfileImage) {
  'use strict';

  // a blank 1x1 png
  var pngSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQYV2P4DwABAQEAWk1v8QAAAABJRU5ErkJggg==';

  var EXPORT_LENGTH = Constants.PROFILE_IMAGE_EXPORT_SIZE;
  var DISPLAY_LENGTH = Constants.PROFILE_IMAGE_DISPLAY_SIZE;
  var JPEG_QUALITY = Constants.PROFILE_IMAGE_JPEG_QUALITY;
  var MIME_TYPE = Constants.DEFAULT_PROFILE_IMAGE_MIME_TYPE;

  var View = FormView.extend({
    template: Template,
    className: 'avatar-camera',

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

        self.window.setTimeout(_.bind(self.canPlay, self), ARTIFICIAL_DELAY);
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
          video: true,
          audio: false
        },
        function (stream) {
          self.stream = stream;
          if (nav.mozGetUserMedia) {
            self.video[0].mozSrcObject = stream;
          } else {
            var vendorURL = self.window.URL || self.window.webkitURL;
            self.video[0].src = vendorURL.createObjectURL(stream);
          }
          self.video[0].play();
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
      this.video = this.$('#video');

      this._avatarProgressIndicator.start(this.$('.progress-container'));

      this.canvas = this.$('#canvas')[0];
      this.width = 320;
      this.height = 0;

      this.video[0].addEventListener('canplay', _.bind(this.canPlay, this), false);
    },

    canPlay: function () {
      if (! this.streaming) {
        var pos = this.centeredPos(this.width, this.height, this.displayLength);
        this.height = this.video[0].videoHeight / (this.video[0].videoWidth / this.width);
        this.video.width(this.width);
        this.video.height(this.height);
        this.wrapper.css(pos);
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this._avatarProgressIndicator.done();
        this.$('.progress-container').addClass('hidden');
        this.video.removeClass('hidden');
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

      var w = this.video[0].videoWidth;
      var h = this.video[0].videoHeight;
      var minValue = Math.min(h, w);

      this.canvas.width = this.exportLength;
      this.canvas.height = this.exportLength;

      var pos = this.centeredPos(w, h, minValue);

      var dataSrc = this.video[0];
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
        return { top: 0, left: (max - w) / 2 };
      } else {
        return { top: (max - h) / 2, left: 0 };
      }
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
