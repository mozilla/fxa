/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


// This is a mixin used by Modal views that are childViews of Settings
// Non-modal childViews of Settings use settings-panel-mixin instead.

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const BaseView = require('../base');
  const ModalPanelMixin = require('./modal-panel-mixin');
  const preventDefaultThen = BaseView.preventDefaultThen;

  const Mixin = _.extend({}, ModalPanelMixin, {
    initialize (options = {}) {
      this.parentView = options.parentView;
      this.on('modal-cancel', () => this.onModalCancel());
    },

    events: {
      'click .cancel': preventDefaultThen('_returnToSettings'),
      'click .modal-panel #back': preventDefaultThen('_returnToAvatarChange')
    },

    _returnToAvatarChange () {
      this.navigate('settings/avatar/change');
    },

    _returnToClients () {
      this.navigate('settings/clients');
    },

    _returnToTwoFactorAuthentication () {
      this.navigate('settings/two_step_authentication');
    },

    _returnToSettings () {
      this.navigate('settings');
    },

    onModalCancel () {
      if (this.currentPage === 'settings/clients/disconnect') {
        this._returnToClients();
      } else {
        this._returnToSettings();
      }
    },

    displaySuccess (msg) {
      this.parentView.displaySuccess(msg);
    }
  });
  module.exports = Mixin;
});
