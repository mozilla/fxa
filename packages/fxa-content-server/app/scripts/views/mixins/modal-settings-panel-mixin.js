/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


// This is a mixin used by Modal views that are childViews of Settings
// Non-modal childViews of Settings use settings-panel-mixin instead.

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const BaseView = require('views/base');
  const ModalPanelMixin = require('views/mixins/modal-panel-mixin');
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

    _returnToSettings () {
      this.navigate('settings');
    },

    onModalCancel () {
      // A view could have already navigated. If so, do not
      // attempt to navigate a second time.
      if (! this._hasNavigated) {
        this._returnToSettings();
      }
    },

    displaySuccess (msg) {
      this.parentView.displaySuccess(msg);
    }
  });
  module.exports = Mixin;
});
