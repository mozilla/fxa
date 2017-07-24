/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Save/load values for input, textarea and select elements.
 *
 * Values are loaded for elements w/ neither `data-novalue`
 *   and `autocomplete="off"` attributes.
 * Values are saved for elements w/o the data-novalue attribute.
 *
 * `name` or `id` element properties are the keys into
 * the formPrefill model. `name` is preferred for elements with both.
 */

define(function (require, exports, module) {
  'use strict';

  function getKey ($el) {
    return $el.prop('name') || $el.prop('id');
  }

  function isElementFillable ($el, formPrefill) {
    const key = getKey($el);
    return ! $el.__val() &&
           $el.attr('autocomplete') !== 'off' &&
           key &&
           formPrefill.has(key);
  }

  module.exports = {
    initialize (options = {}) {
      this.formPrefill = options.formPrefill;
    },

    afterRender () {
      this.getFormElements().each((index, el) => {
        const $el = this.$(el);
        if (isElementFillable($el, this.formPrefill)) {
          const key = getKey($el);
          $el.val(this.formPrefill.get(key)).trigger('input');
        }
      });
    },

    beforeDestroy () {
      this.getFormElements().each((index, el) => {
        const $el = this.$(el);
        const key = getKey($el);
        if (key) {
          this.formPrefill.set(key, $el.__val());
        }
      });
    }
  };
});
