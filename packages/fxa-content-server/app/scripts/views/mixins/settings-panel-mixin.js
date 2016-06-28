/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This is a mixin used by views that are childViews of Settings
// Modal childViews of Settings use modal-settings-panel-mixin instead.

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var BaseView = require('views/base');

  module.exports = {
    initialize: function (options) {
      this.parentView = options.parentView;
    },
    events: {
      'click .cancel': BaseView.preventDefaultThen('_closePanelReturnToSettings'),
      'click .settings-unit-toggle': BaseView.preventDefaultThen('_triggerPanel')
    },

    _triggerPanel: function (event) {
      var href = event && $(event.currentTarget).data('href');
      if (href) {
        this.navigate(href);
      }
    },

    openPanel: function () {
      this.$('.settings-unit').addClass('open');
    },

    isPanelOpen: function () {
      return this.$('.settings-unit').hasClass('open');
    },

    _closePanelReturnToSettings: function (event) {
      this.navigate('settings');
      this.clearInput(event.currentTarget);
      this.closePanel();
    },

    clearInput: function (el) {
      // need siblings here, not prev(), there might be 2 password rows
      var inputFields = this.$(el).parent().siblings('.input-row').find('input');
      $(inputFields).each(function (i, anInputField) {
        // if we have a .label-helper, make that a placeholder
        // cannot search only inside the .input-row, `input`s
        // can be from different `.input-row`s
        var labelHelper = $(anInputField).prev('.label-helper');
        if (labelHelper.length > 0) {
          var placeholderText = labelHelper.text();
          if (placeholderText.length > 0) {
            $(anInputField).attr('placeholder', placeholderText);
            // hide the .label-helper again
            $(labelHelper).text('').css({'top': '0px'});
          }
        }
        // if the input field is text or password, reset it
        if (anInputField.type === 'text' || anInputField.type === 'password') {
          // only reset if the field has a value
          if (anInputField.value.length > 0) {
            anInputField.value = '';
          }
        }
      });
    },

    closePanel: function () {
      this.$('.settings-unit').removeClass('open');
    },

    displaySuccess: function (msg) {
      var self = this;
      if (! self.parentView) {
        return;
      }
      self.parentView.displaySuccess(msg);
      self.closePanel();
    }
  };
});
