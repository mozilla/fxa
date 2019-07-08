/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Mix into views that should disable the primary button
 * if the form is invalid and enable the button when the
 * form is valid.
 *
 * @mixin DisableFormMixin
 */
// Settings panels have two `primary` buttons, the first is the button
// to open/close the panel, the second to submit. Only the submit button
// should be disabled.
const BUTTON_SELECTOR = 'button[type=submit]';
const DISABLED_CLASS = 'disabled';

export default {
  afterRender() {
    this.onFormChange();
  },

  onFormChange() {
    if (this.isValid()) {
      this.enableForm();
    } else {
      this.disableForm();
    }
  },

  /**
   * Disable the form by disabling the primary button
   */
  disableForm() {
    this.$(BUTTON_SELECTOR).addClass(DISABLED_CLASS);
  },

  /**
   * Enable the form by enabling the primary button.
   */
  enableForm() {
    this.$(BUTTON_SELECTOR).removeClass(DISABLED_CLASS);
  },
};
