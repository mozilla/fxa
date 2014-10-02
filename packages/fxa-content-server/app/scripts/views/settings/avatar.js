/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/form',
  'stache!templates/settings/avatar',
  'views/mixins/avatar-mixin',
  'lib/auth-errors',
  'lib/session'
],
function (_, FormView, Template, AvatarMixin, AuthErrors, Session) {
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
      return this.loadProfileImage();
    },

    loadProfileImage: function () {
      var self = this;

      return this._fetchProfileImage()
        .fail(function (err) {
          if (AuthErrors.is(err, 'UNVERIFIED_ACCOUNT')) {
            return self.fxaClient.signUpResend(self.relier)
              .then(function () {
                self.navigate('confirm');
                return false;
              });
          }

          throw err;
        });
    }
  });

  _.extend(View.prototype, AvatarMixin);

  return View;
});
