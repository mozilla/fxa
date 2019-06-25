/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'underscore';
import AuthErrors from '../../lib/auth-errors';
import AvatarMixin from '../mixins/avatar-mixin';
import canvasToBlob from 'canvasToBlob'; //eslint-disable-line no-unused-vars
import Cocktail from 'cocktail';
import Constants from '../../lib/constants';
import DisableFormMixin from '../mixins/disable-form-mixin';
import Duration from 'duration';
import Environment from '../../lib/environment';
import FormView from '../form';
import ModalSettingsPanelMixin from '../mixins/modal-settings-panel-mixin';
import ProfileImage from '../../models/profile-image';
import ProgressIndicator from '../progress_indicator';
import Template from 'templates/settings/avatar_camera.mustache';
import WebRTC from 'webrtc';

// a blank 1x1 png
var pngSrc =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQYV2P4DwABAQEAWk1v8QAAAABJRU5ErkJggg==';

var EXPORT_LENGTH = Constants.PROFILE_IMAGE_EXPORT_SIZE;
var DISPLAY_LENGTH = Constants.PROFILE_IMAGE_DISPLAY_SIZE;
var JPEG_QUALITY = Constants.PROFILE_IMAGE_JPEG_QUALITY;
var MIME_TYPE = Constants.DEFAULT_PROFILE_IMAGE_MIME_TYPE;

const proto = FormView.prototype;
const View = FormView.extend({
  template: Template,
  className: 'avatar-camera',
  viewName: 'settings.avatar.camera',

  setInitialContext(context) {
    context.set({
      streaming: this.streaming,
    });
  },

  initialize(options) {
    this.exportLength = options.exportLength || EXPORT_LENGTH;
    this.displayLength = options.displayLength || DISPLAY_LENGTH;
    this.streaming = false;

    if (this.broker.isAutomatedBrowser()) {
      var ARTIFICIAL_DELAY = new Duration('3s').milliseconds();
      // mock some things out for automated browser testing
      this.streaming = true;
      this.startStream = () => this.enableForm();
      this.stream = {
        stop() {},
      };

      this.window.setTimeout(
        _.bind(this.onLoadedMetaData, this),
        ARTIFICIAL_DELAY
      );
    }
  },

  startStream() {
    var constraints = {
      audio: false,
      video: true,
    };

    // navigator.mediaDevices is polyfilled by WebRTC for older browsers.
    return this.window.navigator.mediaDevices.getUserMedia(constraints).then(
      stream => {
        this.stream = stream;
        WebRTC.attachMediaStream(this.video, stream);
        this.video.play();
      },
      () => {
        this._avatarProgressIndicator.done();
        this.displayError(AuthErrors.toError('NO_CAMERA'));
      }
    );
  },

  stopAndDestroyStream() {
    if (this.stream) {
      var stream = this.stream;
      var previewEl = this.video;

      // The newest spec stops individual tracks, older specs
      // stops streams, and Fx18 is just bonkers.
      if (stream.getTracks) {
        stream.getTracks().forEach(function(track) {
          track.stop();
        });
      } else if (stream.stop) {
        stream.stop();
      } else if (previewEl.pause && 'mozSrcObject' in previewEl) {
        // Fx18 streams do not support stop. Disabling the camera
        // is done via the preview element.
        previewEl.pause();
        previewEl.mozSrcObject = null;
      }

      delete this.stream;
    }
  },

  beforeRender() {
    var environment = new Environment(this.window);
    if (!environment.hasGetUserMedia()) {
      // no camera support, send user back to the change avatar page.
      this.navigate('settings/avatar/change', {
        error: AuthErrors.toError('NO_CAMERA'),
      });
    }
  },

  afterRender() {
    this.startStream();

    this._avatarProgressIndicator = new ProgressIndicator();
    this.wrapper = this.$('#avatar-camera-wrapper');
    this.video = this.$('#video')[0];

    this._avatarProgressIndicator.start(this.$('.progress-container'));

    this.canvas = this.$('#canvas')[0];

    this.video.addEventListener(
      'loadedmetadata',
      _.bind(this.onLoadedMetaData, this),
      false
    );

    return proto.afterRender.call(this);
  },

  onLoadedMetaData() {
    if (!this.streaming) {
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
      this.$('#video')
        .height(this.height)
        .removeClass('hidden');
      this.streaming = true;

      this.enableForm();
    } else {
      this._avatarProgressIndicator.done();
    }
  },

  isValidEnd() {
    return this.streaming;
  },

  submit() {
    let start;
    const account = this.getSignedInAccount();
    this.logAccountImageChange(account);

    return this.takePicture()
      .then(data => {
        start = Date.now();
        return account.uploadAvatar(data);
      })
      .then(result => {
        this.logFlowEvent(`timing.avatar.upload.${Date.now() - start}`);
        this.stopAndDestroyStream();

        this.updateProfileImage(new ProfileImage(result), account);
        this.navigate('settings');
        return result;
      });
  },

  beforeDestroy() {
    this.stopAndDestroyStream();
  },

  takePicture: function takePicture() {
    return new Promise(resolve => {
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

      this.canvas
        .getContext('2d')
        .drawImage(
          dataSrc,
          Math.abs(pos.left),
          Math.abs(pos.top),
          minValue,
          minValue,
          0,
          0,
          this.exportLength,
          this.exportLength
        );

      this.canvas.toBlob(resolve, MIME_TYPE, JPEG_QUALITY);
    });
  },

  // Calculates the position offset needed to center a rectangular image
  // in a square container
  centeredPos(w, h, max) {
    if (w > h) {
      return { left: (max - w) / 2, top: 0 };
    } else {
      return { left: 0, top: (max - h) / 2 };
    }
  },
});

Cocktail.mixin(View, AvatarMixin, DisableFormMixin, ModalSettingsPanelMixin);

export default View;
