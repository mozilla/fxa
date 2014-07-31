/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'jquery',
  'underscore',
  'views/form',
  'stache!templates/settings/avatar_change',
  'lib/session',
  'lib/auth-errors'
],
function ($, _, FormView, Template, Session, AuthErrors) {

  var View = FormView.extend({
    // user must be authenticated to see Settings
    mustAuth: true,

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

    afterRender: function () {
      var wrapper = $('<div/>').css({ height: 0, width: 0, 'overflow': 'hidden' });
      this.$(':file').wrap(wrapper);
    },

    context: function () {
      return {
        avatar: Session.avatar
      };
    },

    remove: function () {
      Session.clear('avatar');
      this.navigate('settings/avatar');
    },

    filePicker: function () {
      this.$('#imageLoader').click();
    },

    fileSet: function (e) {
      var self = this;
      var file = e.target.files[0];

      // Define our callbacks here to avoid a circular DOM reference
      var imgOnload = function () {
        // Store the width and height for the cropper view
        Session.set('cropImgWidth', this.width);
        Session.set('cropImgHeight', this.height);
        require(['../bower_components/jquery-ui/ui/draggable'], function () {
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

          var img = new Image();
          img.src = src;
          img.onload = imgOnload;
          img.onerror = imgOnerrer;
        };
        reader.readAsDataURL(file);
      } else {
        self.navigate('settings/avatar', {
          error: AuthErrors.toMessage('UNUSABLE_IMAGE')
        });
      }
    }
  });

  return View;
});
