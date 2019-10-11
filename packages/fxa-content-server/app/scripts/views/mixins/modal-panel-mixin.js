/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Convert a view into a modal panel. A `modal-cancel` event
 * will be triggered if the user clicks on the background area.
 *
 * Any navigation will cause the panel to close.
 */

import $ from 'jquery';
import KeyCodes from '../../lib/key-codes';

export default {
  isModal: true,
  notifications: {
    navigate: 'closePanel',
    'navigate-back': 'closePanel',
  },
  events: {
    keydown: 'keyDownListener',
  },

  /**
   * Open the panel.
   */
  openPanel() {
    this.$el.modal({
      clickClose: false, // we take care of closing on the background ourselves.
      escapeClose: false, // we take care of closing on the escape key ourselves.
      opacity: 0.75,
      showClose: false,
      zIndex: 999,
    });

    this.$el.on($.modal.AFTER_CLOSE, () => this.onAfterClose());

    this._previousActiveElement = document.activeElement;
    this._boundBlockerClick = this.onBlockerClick.bind(this);
    $('.blocker').on('click', this._boundBlockerClick);

    /**
     * Trap keyboard focus when modal opens.
     */
    const modal = this.$el[0];
    modal.setAttribute('tabindex', '1');
    modal.focus();

    const focusableElementsNodeList = modal.querySelectorAll(
      'a[href], button, input[type="radio"]'
    );
    const focusableElements = Array.prototype.slice.call(
      focusableElementsNodeList
    );

    this._keyDownListener = this.keyDownListener.bind(null, focusableElements);
    modal.addEventListener('keydown', this._keyDownListener);
  },

  keyDownListener(focusableElements, event) {
    function getNextSelectable(element = focusableElements[0]) {
      const nextIndex = focusableElements.indexOf(element) + 1;
      // return first element if the next element doesn't exist
      return focusableElements[nextIndex]
        ? focusableElements[nextIndex]
        : focusableElements[0];
    }

    function getPreviousSelectable(
      element = focusableElements[focusableElements.length - 1]
    ) {
      const previousIndex = focusableElements.indexOf(element) - 1;
      // return last element if the previous element doesn't exist
      return focusableElements[previousIndex]
        ? focusableElements[previousIndex]
        : focusableElements[focusableElements.length - 1];
    }

    //avoid IME composition keydown events
    //ref: https://developer.mozilla.org/docs/Web/Events/keydown#Notes
    if (event.isComposing || event.keyCode === KeyCodes.IME) {
      return;
    }
    if (event.keyCode === KeyCodes.TAB) {
      event.preventDefault();
      if (event.shiftKey) {
        getPreviousSelectable(document.activeElement).focus();
      } else {
        getNextSelectable(document.activeElement).focus();
      }
      // the form submits on 'enter' keypress by default, but if focus is on an
      // unselected radio button, we want to select it instead
    } else if (
      event.keyCode === KeyCodes.ENTER &&
      document.activeElement.getAttribute('type') === 'radio' &&
      document.activeElement.checked === false
    ) {
      event.preventDefault();
      document.activeElement.checked = true;
    }
  },

  /**
   * Close the panel.
   */
  closePanel() {
    if ($.modal.isActive()) {
      $.modal.close();
    }
  },

  onBlockerClick(event) {
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

  onAfterClose() {
    this.destroy(true);
    this.trigger('modal-cancel');
    $('.blocker').off('click', this._boundBlockerClick);
    this._previousActiveElement.focus();
  },

  /**
   * Wrap the destroy function to close the panel, if it has not
   * already been done.
   */
  destroy() {
    this.closePanel();
  },
};
