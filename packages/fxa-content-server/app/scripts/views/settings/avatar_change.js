/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const AuthErrors = require('lib/auth-errors');
  const AvatarMixin = require('views/mixins/avatar-mixin');
  const Cocktail = require('cocktail');
  const CropperImage = require('models/cropper-image');
  const FormView = require('views/form');
  const ImageLoader = require('lib/image-loader');
  const ModalSettingsPanelMixin = require('views/mixins/modal-settings-panel-mixin');
  const p = require('lib/promise');
  const Template = require('stache!templates/settings/avatar_change');

  const proto = FormView.prototype;
  const View = FormView.extend({
    template: Template,
    className: 'avatar-change',
    viewName: 'settings.avatar.change',

    events: {
      'change #imageLoader': 'fileSet',
      'click #file': 'filePicker',
      'click .remove': 'removeAvatar'
    },

    initialize: function () {
      // override in tests
      this.FileReader = FileReader;
    },

    getAccount: function () {
      if (! this._account) {
        this._account = this.getSignedInAccount();
      }
      return this._account;
    },

    beforeRender: function () {
      if (this.relier.get('setting') === 'avatar') {
        this.relier.unset('setting');
      }
    },

    context: function () {
      var account = this.getSignedInAccount();
      return {
        'hasProfileImage': account.has('profileImageUrl')
      };
    },

    afterVisible () {
      return proto.afterVisible.call(this)
        .then(() => this.displayAccountProfileImage(this.getAccount()));
    },

    afterRender () {
      // Wrapper hides the browser's file picker widget so we can use
      // our own. Set the height/width to 1px by 1px so that Selenium
      // can interact with the element. The element is not visible
      // to the user.
      var wrapper = $('<div/>').css({
        height: 1,
        opacity: 0,
        overflow: 'hidden',
        width: 1
      });
      this.$(':file').wrap(wrapper);
      return proto.afterRender.call(this);
    },

    removeAvatar: function () {
      var self = this;
      var account = self.getAccount();
      return self.deleteDisplayedAccountProfileImage(account)
        .then(function () {
          self.navigate('settings');
        }, function (err) {
          self.displayError(err);
          throw err;
        });
    },

    filePicker: function () {
      this.$('#imageLoader').click();
    },

    fileSet: function (e) {
      var self = this;
      var defer = p.defer();
      var file = e.target.files[0];
      var account = self.getAccount();
      self.logAccountImageChange(account);

      var imgOnError = function (e) {
        var error = e && e.errno ? e : 'UNUSABLE_IMAGE';
        var msg = AuthErrors.toMessage(error);
        self.displayError(msg);
        defer.reject(msg);
      };

      if (file.type.match('image.*')) {
        var reader = new self.FileReader();

        reader.onload = function (event) {
          var src = event.target.result;

          ImageLoader.load(src)
            .then(function (img) {
              var cropImg = new CropperImage({
                height: img.height,
                src: src,
                type: file.type,
                width: img.width
              });
              require(['draggable', 'touch-punch'], function () {
                self.navigate('settings/avatar/crop', {
                  cropImg: cropImg
                });
              });
              defer.resolve();
            })
            .fail(imgOnError);
        };
        reader.readAsDataURL(file);
      } else {
        imgOnError();
      }

      return defer.promise;
    }

  });

  Cocktail.mixin(
    View,
    AvatarMixin,
    ModalSettingsPanelMixin
  );

  module.exports = View;
});
