/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'canvasToBlob',
  'views/form',
  'views/progress_indicator',
  'stache!templates/settings/avatar_camera',
  'lib/constants',
  'lib/promise',
  'lib/session',
  'lib/auth-errors',
  'lib/url'
],
function (_, canvasToBlob, FormView, ProgressIndicator, Template, Constants, p, Session, AuthErrors, Url) {
  // a blank 1x1 png
  var pngSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQYV2P4DwABAQEAWk1v8QAAAABJRU5ErkJggg==';

  var EXPORT_LENGTH = Constants.PROFILE_IMAGE_EXPORT_SIZE;
  var DISPLAY_LENGTH = Constants.PROFILE_IMAGE_DISPLAY_SIZE;
  var JPEG_QUALITY = Constants.PROFILE_IMAGE_JPEG_QUALITY;
  var MIME_TYPE = Constants.DEFAULT_PROFILE_IMAGE_MIME_TYPE;

  var View = FormView.extend({
    // user must be authenticated to see Settings
    mustAuth: true,

    template: Template,
    className: 'avatar_camera',

    context: function () {
      return {
        avatar: Session.avatar,
        streaming: this.streaming
      };
    },

    initialize: function (options) {
      this.exportLength = options.exportLength || EXPORT_LENGTH;
      this.displayLength = options.displayLength || DISPLAY_LENGTH;
      this.streaming = false;

      var self = this;
      if (this.automatedBrowser) {
        // mock some things out for automated browser testing
        this.streaming = true;
        this._getMedia = function () {
          self.enableSubmitIfValid();
        };
        this.stream = {
          stop: function () {}
        };
      }
    },

    _getMedia: function () {
      var self = this;
      var nav = this.navigator;

      var getUserMedia = nav.getUserMedia ||
                             nav.webkitGetUserMedia ||
                             nav.mozGetUserMedia ||
                             nav.msGetUserMedia;

      if (! getUserMedia) {
        this.displayError(AuthErrors.toCode('NO_CAMERA'));
        return false;
      }

      var getMedia = _.bind(getUserMedia, nav);

      getMedia(
        {
          video: true,
          audio: false
        },
        function(stream) {
          self.stream = stream;
          if (nav.mozGetUserMedia) {
            self.video[0].mozSrcObject = stream;
          } else {
            var vendorURL = self.window.URL || self.window.webkitURL;
            self.video[0].src = vendorURL.createObjectURL(stream);
          }
          self.video[0].play();
        },
        function(err) {
          self._avatarProgressIndicator.done();
          self.displayError(AuthErrors.toCode('NO_CAMERA'));
        }
      );

      return true;
    },

    afterRender: function () {
      var self = this;

      if (! this._getMedia()) {
        return;
      }

      this._avatarProgressIndicator = new ProgressIndicator();
      this.video = this.$('#video');

      self._avatarProgressIndicator.start(self.$('.progress-container'));

      this.canvas = this.$('#canvas')[0];
      this.width = 320;
      this.height = 0;

      self.video[0].addEventListener('canplay', function(ev){
        if (! self.streaming) {
          var pos = self.centeredPos(self.width, self.height, self.displayLength);
          self.height = self.video[0].videoHeight / (self.video[0].videoWidth / self.width);
          self.video.width(self.width);
          self.video.height(self.height);
          self.video.css(pos);
          self.canvas.width = self.width;
          self.canvas.height = self.height;
          self._avatarProgressIndicator.done();
          self.$('.progress-container').addClass('hidden');
          self.video.removeClass('hidden');
          self.streaming = true;

          self.enableSubmitIfValid();
        } else {
          self._avatarProgressIndicator.done();
        }
      }, false);

    },

    isValidEnd: function () {
      return this.streaming;
    },

    submit: function () {
      var self = this;

      return this.takePicture()
        .then(function (data) {
          return self.profileClient.uploadAvatar(data);
        })
        .then(function (result) {
          Session.set('avatar', result.url);
          Session.set('avatarId', result.id);

          self.stream.stop();
          delete self.stream;

          self.navigate('settings/avatar');
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
      if (this.automatedBrowser) {
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

  return View;
});
