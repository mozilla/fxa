/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const AvatarMixin = require('../mixins/avatar-mixin');
const Cocktail = require('cocktail');
const FormView = require('../form');
const SettingsPanelMixin = require('../mixins/settings-panel-mixin');
const Template = require('templates/settings/avatar.mustache');

const View = FormView.extend({
  template: Template,
  className: 'avatar',
  viewName: 'settings.avatar',

  beforeRender () {
    if (! this.supportsAvatarUpload()) {
      this.remove();
    }
  },

  onProfileUpdate () {
    this.render();
  },

  setInitialContext (context) {
    const account = this.getSignedInAccount();
    context.set('avatarDefault', account.get('profileImageUrlDefault'));
  }

});

Cocktail.mixin(View, AvatarMixin, SettingsPanelMixin);

module.exports = View;
