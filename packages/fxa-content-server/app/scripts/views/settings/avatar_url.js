/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/form',
  'stache!templates/settings/avatar_url',
  'lib/session',
  'lib/auth-errors'
],
function (_, FormView, Template, Session, AuthErrors) {

  var View = FormView.extend({
    // user must be authenticated to see Settings
    mustAuth: true,

    template: Template,
    className: 'avatar_url',

    context: function () {
      return {
        avatar: Session.avatar
      };
    },

    // Load the remote image into a canvas and prepare it for cropping
    submit: function () {
      var self = this;
      var src = this.$('.url').val();
      var img = new Image();
      img.src = src;
      img.onload = function () {
        Session.set('cropImgWidth', img.width);
        Session.set('cropImgHeight', img.height);
        self.navigate('settings/avatar/crop');
      };
      img.onerror = function () {
        self.navigate('settings/avatar', {
          error: AuthErrors.toMessage('UNUSABLE_IMAGE')
        });
      };
      Session.set('cropImgSrc', src);
    }
  });

  return View;
});
