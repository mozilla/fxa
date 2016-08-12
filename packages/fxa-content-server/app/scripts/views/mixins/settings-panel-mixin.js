/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This is a mixin used by views that are childViews of Settings
// Modal childViews of Settings use modal-settings-panel-mixin instead.

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var BaseView = require('views/base');
  var KeyCodes = require('lib/key-codes');

  module.exports = {
    initialize: function (options) {
      this.parentView = options.parentView;
    },

    events: {
      'click .cancel': BaseView.preventDefaultThen('_closePanelReturnToSettings'),
      'click .settings-unit-toggle': BaseView.preventDefaultThen('_triggerPanel'),
      'keyup .settings-unit': 'onKeyUp'
    },

    afterRender () {
      // Disable autofocus as specified by the templates because the panels
      // are hidden until opened and focus cannot be set. Instead, set
      // the focus when the panel is opened.
      this.$('[autofocus]')
        .attr('data-autofocus-on-panel-open', true)
        .removeAttr('autofocus');
    },

    onKeyUp: function (event) {
      this._hidePanelOnEscape(event);
    },

    _hidePanelOnEscape: function (event) {
      if (event.which === KeyCodes.ESCAPE) {
        this.hidePanel(event.currentTarget);
      }
    },

    hidePanel: function (el) {
      // escape key has same behavior as cancel button
      // so find the cancel button inside the open panel
      // and simulate a click on that
      var cancelButton = this.$(el).find('.cancel');

      // synthesize a new event
      var $event = $.Event('click');
      $event.currentTarget = $(cancelButton);

      this._closePanelReturnToSettings($event);
    },

    _triggerPanel: function (event) {
      var href = event && $(event.currentTarget).data('href');
      if (href) {
        this.navigate(href);
      }
    },

    openPanel: function () {
      this.$('.settings-unit').addClass('open');
      this.focus(this.$('[data-autofocus-on-panel-open]'));
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
      var form = this.$(el).closest('form');
      var shouldDisableSubmitButtons = false;
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
          // reset the form, do not clear the inputs
          form[0].reset();
          // also for input fields that are text or password,
          // disable the submit buttons if user pressed cancel/esc
          shouldDisableSubmitButtons = true;
        }
      });
      if (shouldDisableSubmitButtons) {
        this.disableButtons(el);
      }
    },

    disableButtons: function (el) {
      var submitButton = this.$(el).closest('form').find('[type=submit]');
      submitButton.addClass('disabled');
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
