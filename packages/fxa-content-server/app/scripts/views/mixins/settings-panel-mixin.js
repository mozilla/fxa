/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This is a mixin used by views that are childViews of Settings
// Modal childViews of Settings use modal-settings-panel-mixin instead.

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const BaseView = require('views/base');

  module.exports = {
    initialize (options) {
      this.parentView = options.parentView;
    },

    events: {
      'click .cancel': BaseView.preventDefaultThen('_closePanelReturnToSettings'),
      'click .settings-unit-toggle': BaseView.preventDefaultThen('_triggerPanel')
    },

    afterRender () {
      // Disable autofocus as specified by the templates because the panels
      // are hidden until opened and focus cannot be set. Instead, set
      // the focus when the panel is opened.
      this.$('[autofocus]')
        .attr('data-autofocus-on-panel-open', true)
        .removeAttr('autofocus');
    },

    _triggerPanel (event) {
      var href = event && $(event.currentTarget).data('href');
      if (href) {
        this.navigate(href);
      }
    },

    openPanel () {
      this.closeAllPanels();

      this.$('.settings-unit').addClass('open');
      this.focus(this.$('[data-autofocus-on-panel-open]'));
    },

    hidePanel () {
      this._closePanelReturnToSettings();
    },

    isPanelOpen () {
      return this.$('.settings-unit').hasClass('open');
    },

    _closePanelReturnToSettings () {
      this.navigate('settings');
      this.clearInput();
      this.closePanel();
    },

    clearInput () {
      const $inputEls = this.$('input');

      $inputEls.each((i, inputEl) => {
        // Make no assumptions that this view has the
        // floating-placeholder-mixin available. Check first.
        if (this.hideFloatingPlaceholder) {
          this.hideFloatingPlaceholder(inputEl);
        }
      });

      const formEl = this.$('form')[0];
      if (formEl) {
        formEl.reset();
      }

      // Make no assumptions this view is actually based on FormView,
      // only enable the form if a form view, and if valid.
      if (this.enableSubmitIfValid) {
        this.enableSubmitIfValid();
      }
    },

    closePanel () {
      this.$('.settings-unit').removeClass('open');
    },

    closeAllPanels () {
      $('.settings-unit').removeClass('open');
    },

    displaySuccess (msg, options = {closePanel: true}) {
      if (! this.parentView) {
        return;
      }
      this.parentView.displaySuccess(msg);

      if (options.closePanel) {
        this.closePanel();
      }
    },
  };
});
