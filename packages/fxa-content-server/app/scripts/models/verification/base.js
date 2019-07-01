/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A model to hold verification data. Verification data is imported from
 * the URL's query parameters and is cleaned up to remove whitespace on
 * initialization.
 *
 * Subclasses should override the `defaults` and `validation`
 * hashes. The `validation` hash contains the same keys as the `defaults`
 * whose values are validation functions.
 */

import _ from 'underscore';
import Backbone from 'backbone';
import Vat from '../../lib/vat';

var proto = Backbone.Model.prototype;

var VerificationInfo = Backbone.Model.extend({
  initialize(options) {
    proto.initialize.call(this, options);

    // clean up any whitespace that was probably added by an MUA.
    _.each(
      this.defaults,
      function(value, key) {
        if (this.has(key)) {
          var cleanedValue = this.get(key).replace(/ /g, '');
          if (cleanedValue) {
            this.set(key, cleanedValue);
          } else {
            this.unset(key);
          }
        }
      },
      this
    );
  },

  defaults: {},
  validation: {},

  /**
   * Check if the model is valid.
   *
   * @method isValid
   * @returns {Boolean} `false` if a `validationError` is set, or if
   *   `validate` either throws or returns false. `true` otherwise.
   */
  isValid() {
    var isValid;

    if (this.isDamaged()) {
      return false;
    }

    try {
      // super's isValid throws if invalid.
      isValid = proto.isValid.call(this);
    } catch (e) {
      isValid = false;
    }

    return isValid;
  },

  /**
   * Validate the data model using the validators defined
   * in the `validation` hash. Called automatically by
   * `isValid`.
   *
   * @method validate
   * @param {Object} attributes
   * @throws any validation errors.
   */
  validate(attributes) {
    const result = Vat.validate(attributes, this.validation, {
      allowUnknown: true,
    });
    if (result.error) {
      throw result.error;
    }
  },

  /**
   * Mark the verification info as expired.
   * @method markExpired
   */
  markExpired() {
    this._isExpired = true;
  },

  /**
   * Check if the verification info is expired
   *
   * @method isExpired
   * @returns {Boolean} `true` if expired, `false` otw.
   */
  isExpired() {
    return !!this._isExpired;
  },

  /**
   * Mark the verification info as used.
   * @method markUsed
   */
  markUsed() {
    this._isUsed = true;
  },

  /**
   * Check if the verification info is used
   *
   * @method isUsed
   * @returns {Boolean} `true` if used, `false` otherwise.
   */
  isUsed() {
    return !!this._isUsed;
  },

  /**
   * Mark the verification info as damaged. This will cause `isValid` to
   * return `false`.
   * @method markDamaged
   */
  markDamaged() {
    this._isDamaged = true;
  },

  /**
   * Check if the verification info is damaged
   *
   * @method isDamaged
   * @returns {Boolean} `true` if damaged, `false` otw.
   */
  isDamaged() {
    return !!this._isDamaged;
  },
});

export default VerificationInfo;
