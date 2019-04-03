/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Convert a view into a modal panel. A `modal-cancel` event
 * will be triggered if the user clicks on the background area.
 *
 * Any navigation will cause the panel to close.
 */

'use strict';

import $ from 'jquery';
import Environment from '../../lib/environment';

module.exports = {
  isModal: true,

  notifications: {
    'navigate': 'closePanel',
    'navigate-back': 'closePanel'
  },

  /**
   * Open the panel.
   */
  openPanel () {
    this.$el.modal({
      clickClose: false, // we take care of closing on the background ourselves.
      escapeClose: false, // we take care of closing on the escape key ourselves.
      opacity: 0.75,
      showClose: false,
      zIndex: 999
    });

    this.$el.on($.modal.AFTER_CLOSE, () => this.onAfterClose());

    if (this._needsToSetBodyMinHeight()) {
      // ensure the body is at least as tall as the modal. This is used
      // when inside the firstrun iframe and the "why connect another device"
      // content is larger than the body on the /connect_another_device page.
      this._setBodyMinHeight();
    }

    this._boundBlockerClick = this.onBlockerClick.bind(this);
    $('.blocker').on('click', this._boundBlockerClick);
  },

  /**
   * Close the panel.
   */
  closePanel () {
    if ($.modal.isActive()) {
      $.modal.close();
    }
  },

  onBlockerClick (event) {
    // We take care of closing the panel ourselves so that we can
    // trigger `modal-cancel` IFF the user clicks on the black area
    // outside of the content. Clicks on this area are often handled
    // differently to either the "cancel" or "back" buttons, and
    // listening directly on `AFTER_CLOSE` causes listeners to
    // be called on every close.
    if (event.target === event.currentTarget) {
      this.closePanel();

      /**
       * Triggered if the user clicks the black background area of the modal.
       *
       * @event modal-cancel
       */
      this.trigger('modal-cancel');
    }
  },

  onAfterClose () {
    this.destroy(true);
    this.trigger('modal-cancel');
    $('.blocker').off('click', this._boundBlockerClick);
  },

  /**
   * Wrap the destroy function to close the panel, if it has not
   * already been done.
   */
  destroy () {
    this.closePanel();
    if (this._needsToSetBodyMinHeight() && this.model.has('origMinHeight')) {
      $('body').css('min-height', this.model.get('origMinHeight'));
      this.model.unset('origMinHeight');
    }
  },

  /**
   * Check whether the `body` element needs it's `min-height` set
   * so that the body expands to be at least as tall as the modal.
   *
   * @returns {Boolean}
   * @private
   */
  _needsToSetBodyMinHeight() {
    const environment = new Environment(this.window);
    return environment.isFramed();
  },

  /**
   * Ensure the body is at least as tall as the modal. This is used
   * when inside the firstrun iframe and the "why connect another device"
   * content is larger than the body on the /connect_another_device page.
   *
   * @private
   */
  _setBodyMinHeight () {
    const RADIX = 10;
    const bodyMinHeightCssValue = $('body').css('min-height');
    const bodyMinHeight = parseInt(bodyMinHeightCssValue || 0, RADIX);
    const modalHeight = $('.modal').outerHeight();

    if (modalHeight > bodyMinHeight) {
      this.model.set('origMinHeight', bodyMinHeightCssValue);
      $('body').css('min-height', `${modalHeight}px`);
    }
  }
};
