/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'jquery',
  'underscore',
  'views/form',
  'views/mixins/avatar-mixin',
  'stache!templates/settings/avatar_change',
  'lib/session',
  'lib/auth-errors',
  'lib/image-loader'
],
function ($, _, FormView, AvatarMixin, Template, Session, AuthErrors, ImageLoader) {

  // a blank 1x1 png
  var pngSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQYV2P4DwABAQEAWk1v8QAAAABJRU5ErkJggg==';

  var View = FormView.extend({
    // user must be authenticated to see Settings
    mustVerify: true,

    template: Template,
    className: 'avatar_change',

    events: {
      'click #file': 'filePicker',
      'click .remove': 'remove',
      'change #imageLoader': 'fileSet'
    },

    initialize: function () {
      Session.clear('cropImgWidth');
      Session.clear('cropImgHeight');
      // override in tests
      this.FileReader = FileReader;
    },

    context: function () {
      return {
        avatar: this.avatar
      };
    },

    beforeRender: function () {
      var self = this;

      return self._fetchProfileImage(self.currentAccount())
        .then(function (result) {
          self.avatarId = result.id;
          self.avatar = result.avatar;
        }, function () {
          // ignore errors
        });
    },

    afterRender: function () {
      // Wrapper hides the browser's file picker widget so we can use
      // our own
      var wrapper = $('<div/>').css({ height: 0, width: 0, 'overflow': 'hidden' });
      this.$(':file').wrap(wrapper);
    },

    remove: function () {
      var self = this;
      return self.currentAccount().deleteAvatar(self.avatarId)
        .then(function () {
          self.navigate('settings/avatar');
        });
    },

    filePicker: function () {
      var self = this;
      // skip the file picker if this is an automater browser
      if (self.automatedBrowser) {
        require(['draggable', 'touch-punch'], function () {
          Session.set('cropImgSrc', pngSrc);
          Session.set('cropImgWidth', 1);
          Session.set('cropImgHeight', 1);

          self.navigate('settings/avatar/crop');
        });
        return;
      }
      self.$('#imageLoader').click();
    },

    fileSet: function (e) {
      var self = this;
      var file = e.target.files[0];

      var imgOnload = function (img) {
        // Store the width and height for the cropper view
        Session.set('cropImgWidth', img.width);
        Session.set('cropImgHeight', img.height);
        require(['draggable', 'touch-punch'], function () {
          self.navigate('settings/avatar/crop');
        });
      };

      var imgOnerrer = function () {
        self.navigate('settings/avatar', {
          error: AuthErrors.toMessage('UNUSABLE_IMAGE')
        });
      };

      if (file.type.match('image.*')) {
        var reader = new self.FileReader();

        reader.onload = function (event) {
          var src = event.target.result;

          Session.set('cropImgSrc', src);
          Session.set('cropImgType', file.type);

          ImageLoader.load(src)
            .then(imgOnload)
            .then(null, imgOnerrer);
        };
        reader.readAsDataURL(file);
      } else {
        self.navigate('settings/avatar', {
          error: AuthErrors.toMessage('UNUSABLE_IMAGE')
        });
      }
    }
  });

  _.extend(View.prototype, AvatarMixin);

  return View;
});
