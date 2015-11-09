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

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var Backbone = require('backbone');

  var proto = Backbone.Model.prototype;

  var VerificationInfo = Backbone.Model.extend({
    initialize: function (options) {
      proto.initialize.call(this, options);

      // clean up any whitespace that was probably added by an MUA.
      _.each(this.defaults, function (value, key) {
        if (this.has(key)) {
          var cleanedValue = this.get(key).replace(/ /g, '');
          if (cleanedValue) {
            this.set(key, cleanedValue);
          } else {
            this.unset(key);
          }
        }
      }, this);
    },

    defaults: {},
    validation: {},

    /**
     * Check if the model is valid.
     *
     * @method isValid
     * @returns {boolean} `false` if a `validationError` is set, or if
     *   `validate` either throws or returns false. `true` otherwise.
     */
    isValid: function () {
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
     */
    validate: function (attributes) {
      _.each(this.validation, function (validator, key) {
        if (! validator(attributes[key])) {
          throw new Error('invalid ' + key);
        }
      });
    },

    /**
     * Mark the verification info as expired.
     * @method markExpired
     */
    markExpired: function () {
      this._isExpired = true;
    },

    /**
     * Check if the verification info is expired
     *
     * @method isExpired
     * @returns {boolean} `true` if expired, `false` otw.
     */
    isExpired: function () {
      return !! this._isExpired;
    },

    /**
     * Mark the verification info as damaged. This will cause `isValid` to
     * return `false`.
     * @method markDamaged
     */
    markDamaged: function () {
      this._isDamaged = true;
    },

    /**
     * Check if the verification info is damaged
     *
     * @method isDamaged
     * @returns {boolean} `true` if damaged, `false` otw.
     */
    isDamaged: function () {
      return !! this._isDamaged;
    }
  });

  module.exports = VerificationInfo;
});

