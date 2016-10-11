/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


// This is a mixin used by Modal views that are childViews of Settings
// Non-modal childViews of Settings use settings-panel-mixin instead.

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const BaseView = require('views/base');
  var preventDefaultThen = BaseView.preventDefaultThen;

  module.exports = {
    isModal: true,

    initialize (options) {
      this.parentView = options.parentView;
    },

    events: {
      'click .cancel': preventDefaultThen('_closePanelReturnToSettings'),
      'click .modal-panel #back': preventDefaultThen('_returnToAvatarChange')
    },

    openPanel (event) {
      $(this.el).modal({
        opacity: 0.75,
        showClose: false,
        zIndex: 999
      });
      $(this.el).on($.modal.CLOSE, () => {
        this._closePanelReturnToSettings();
      });
    },

    _returnToAvatarChange () {
      this.navigate('settings/avatar/change');
    },

    _closePanelReturnToSettings () {
      this.navigate('settings');
      this.closePanel();
    },

    closePanel () {
      this.destroy(true);
    },

    closeModalPanel () {
      this.closePanel();
      $.modal.close();
    },

    displaySuccess (msg) {
      this.parentView.displaySuccess(msg);
    }
  };
});
