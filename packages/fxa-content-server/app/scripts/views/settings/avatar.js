/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/form',
  'stache!templates/settings/avatar',
  'views/mixins/avatar-mixin'
],
function (_, FormView, Template, AvatarMixin) {
  var View = FormView.extend({
    // user must be authenticated to see Settings
    mustAuth: true,

    template: Template,
    className: 'avatar',

    afterVisible: function () {
      return this._displayProfileImage();
    }

  });

  _.extend(View.prototype, AvatarMixin);

  return View;
});
