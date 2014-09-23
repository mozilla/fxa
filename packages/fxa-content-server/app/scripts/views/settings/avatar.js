/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/form',
  'stache!templates/settings/avatar',
  'lib/auth-errors',
  'lib/session'
],
function (_, FormView, Template, AuthErrors, Session) {
  var View = FormView.extend({
    // user must be authenticated to see Settings
    mustAuth: true,

    template: Template,
    className: 'avatar',

    context: function () {
      return {
        avatar: Session.avatar
      };
    },

    beforeRender: function () {
      if (! Session.avatar || !Session.avatarId) {
        return this._fetchProfileImage();
      }
    },

    // When profile images are more widely released (#1582)
    // we would fetch the image right after sign in, or only for
    // specific email domains (#1567).
    _fetchProfileImage: function () {
      var self = this;

      return this.profileClient.getAvatar()
        .then(function (result) {
          if (result.avatar) {
            Session.set('avatar', result.avatar);
            Session.set('avatarId', result.id);
          }
        }, function (err) {
          if (AuthErrors.is(err, 'UNVERIFIED_ACCOUNT')) {
            return self.fxaClient.signUpResend()
              .then(function () {
                self.navigate('confirm');
                return false;
              });
          }

          throw err;
        });
    }

  });

  return View;
});
