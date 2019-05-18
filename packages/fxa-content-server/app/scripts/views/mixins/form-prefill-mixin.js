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

function getKey($el) {
  return $el.prop('name') || $el.prop('id');
}

function isElementFillable($el, formPrefill) {
  const key = getKey($el);
  return (
    !$el.__val() &&
    $el.attr('autocomplete') !== 'off' &&
    key &&
    !!formPrefill.get(key)
  );
}

export default {
  initialize(options = {}) {
    this.formPrefill = options.formPrefill;

    // NOTE: this assumes `rendered` will be triggered after
    // the view has been rendered, but before `afterRender`.
    // `afterRender` takes care of seeding the model that tracks
    // whether form values have changed and enabling the form
    // if valid.
    this.on('rendered', () => this.fillPrefillableValues());
  },

  fillPrefillableValues() {
    this.getFormElements &&
      this.getFormElements().each((index, el) => {
        const $el = this.$(el);
        if (isElementFillable($el, this.formPrefill)) {
          const key = getKey($el);
          $el.val(this.formPrefill.get(key));
        }
      });
  },

  beforeDestroy() {
    this.getFormElements &&
      this.getFormElements().each((index, el) => {
        const $el = this.$(el);
        const key = getKey($el);
        if (key) {
          this.formPrefill.set(key, $el.__val());
        }
      });
  },
};
