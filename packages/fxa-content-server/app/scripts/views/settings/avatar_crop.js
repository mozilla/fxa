/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'p-promise',
  'underscore',
  'views/form',
  'stache!templates/settings/avatar_crop',
  'lib/session',
  'lib/cropper',
  'lib/auth-errors'
],
function (p, _, FormView, Template, Session, Cropper, AuthErrors) {

  var View = FormView.extend({
    // user must be authenticated to see Settings
    mustAuth: true,

    template: Template,
    className: 'avatar_crop',

    initialize: function (options) {
      options = options || {};

      this.cropImgSrc = Session.cropImgSrc;
    },

    context: function () {
      return {
        avatar: Session.avatar
      };
    },

    beforeRender: function () {
      if (!this.cropImgSrc) {
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
          src: this.cropImgSrc,
          width: width,
          height: height,
          displayLength: 240,
          exportLength: 600,
          verticalGutter: 0,
          horizontalGutter: 90
        });
      } catch (e) {
        this.navigate('settings/avatar/change', {
          error: AuthErrors.toMessage('UNUSABLE_IMAGE')
        });
      }
    },

    submit: function () {
      var self = this;
      return p().then(function () {
        var data = self.cropper.toDataURL();
        // TODO upload to the server
        Session.set('avatar', data);
        self.navigate('settings/avatar');
      });
    }

  });

  return View;
});
