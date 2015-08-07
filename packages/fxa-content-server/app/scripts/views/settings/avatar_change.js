/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'jquery',
  'cocktail',
  'views/form',
  'views/mixins/avatar-mixin',
  'views/mixins/settings-mixin',
  'views/mixins/modal-settings-panel-mixin',
  'stache!templates/settings/avatar_change',
  'lib/auth-errors',
  'lib/image-loader',
  'lib/promise',
  'models/cropper-image'
],
function ($, Cocktail, FormView, AvatarMixin, SettingsMixin, ModalSettingsPanelMixin,
  Template, AuthErrors, ImageLoader, p, CropperImage) {
  'use strict';

  var View = FormView.extend({
    template: Template,
    className: 'avatar-change',

    events: {
      'click #file': 'filePicker',
      'click .remove': 'removeAvatar',
      'change #imageLoader': 'fileSet'
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

    afterVisible: function () {
      var self = this;
      FormView.prototype.afterVisible.call(self);
      return self.displayAccountProfileImage(self.getAccount())
        .then(function () {
          if (self.getAccount().has('profileImageUrl')) {
            self.$('.remove').removeClass('hidden');
          }
        });
    },

    afterRender: function () {
      // Wrapper hides the browser's file picker widget so we can use
      // our own
      var wrapper = $('<div/>').css({ height: 0, width: 0, 'overflow': 'hidden' });
      this.$(':file').wrap(wrapper);
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
      var self = this;
      // skip the file picker if this is an automater browser
      if (self.broker.isAutomatedBrowser()) {
        setTimeout(function () {
          require(['draggable', 'touch-punch'], function () {
            var cropImg = new CropperImage();
            self.navigate('settings/avatar/crop', {
              data: {
                cropImg: cropImg
              }
            });
          });
        }, 1000);
        return;
      }
      self.$('#imageLoader').click();
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
                src: src,
                type: file.type,
                width: img.width,
                height: img.height
              });
              require(['draggable', 'touch-punch'], function () {
                self.navigate('settings/avatar/crop', {
                  data: {
                    cropImg: cropImg
                  }
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
    ModalSettingsPanelMixin,
    SettingsMixin
  );

  return View;
});
