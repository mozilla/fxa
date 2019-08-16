/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This is a mixin used by views that are childViews of Settings
// Modal childViews of Settings use modal-settings-panel-mixin instead.

import $ from 'jquery';
import preventDefaultThen from '../decorators/prevent_default_then';

export default {
  initialize(options) {
    this.parentView = options.parentView;
  },

  events: {
    'click .cancel': preventDefaultThen('_closePanelReturnToSettings'),
    'click .settings-unit-toggle': preventDefaultThen('_triggerPanel'),
  },

  afterRender() {
    // Disable autofocus as specified by the templates because the panels
    // are hidden until opened and focus cannot be set. Instead, set
    // the focus when the panel is opened.
    this.$('[autofocus]')
      .attr('data-autofocus-on-panel-open', true)
      .removeAttr('autofocus');
  },

  _triggerPanel(event) {
    var href = event && $(event.currentTarget).data('href');
    if (href) {
      this.navigate(href);
    }
  },

  openPanel() {
    this.closeAllPanels();

    this.$('.settings-unit').addClass('open');
    this.$el.closest('#fxa-settings-content').addClass('animate-shadow');
    this.focus(this.$('[data-autofocus-on-panel-open]'));
    this.model.set('isPanelOpen', true);
  },

  hidePanel() {
    this._closePanelReturnToSettings();
  },

  isPanelOpen() {
    return this.model.get('isPanelOpen');
  },

  _closePanelReturnToSettings() {
    this.navigate('settings');
    this.clearInput();
    this.closePanel();
  },

  clearInput() {
    const $inputEls = this.$('input');

    $inputEls.each((i, inputEl) => {
      // Called to clear validation tooltips. issues/5680
      $(inputEl).change();
    });

    const formEl = this.$('form')[0];
    if (formEl) {
      formEl.reset();
    }
  },

  closePanel() {
    this.$el.closest('#fxa-settings-content').removeClass('animate-shadow');
    this.$('.settings-unit').removeClass('open');
    this.model.set('isPanelOpen', false);
  },

  closeAllPanels() {
    $('.settings-unit').removeClass('open');
  },

  displaySuccess(msg, options = { closePanel: true }) {
    if (!this.parentView) {
      return;
    }
    this.parentView.displaySuccess(msg);

    if (options.closePanel) {
      this.closePanel();
    }
  },
};
