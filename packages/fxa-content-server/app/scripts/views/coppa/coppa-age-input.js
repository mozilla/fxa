/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var AuthErrors = require('lib/auth-errors');
  var Cocktail = require('cocktail');
  var FloatingPlaceholderMixin = require('views/mixins/floating-placeholder-mixin');
  var FormView = require('views/form');
  var KeyCodes = require('lib/key-codes');
  var Template = require('stache!templates/partial/coppa-age-input');

  var CUTOFF_AGE = 13;
  var AGE_ELEMENT = '#age';

  var View = FormView.extend({

    template: Template,
    className: 'coppa-age-input',

    initialize: function (options) {
      options = options || {};

      this._formPrefill = options.formPrefill;
    },

    events: {
      'input': 'onInput',
      'keydown': 'submitOnEnter',
      'keyup': 'onInput'
    },

    /**
     * Called by the parent view to determine if the user is old enough.
     * @method isUserOldEnough
     * @return {Boolean} true if user is old enough, false otw.
     */
    isUserOldEnough: function () {
      return this._getAge() >= CUTOFF_AGE;
    },

    /**
     * Called by the parent to determine if the user has entered a value.
     * @method hasValue
     * @return {Boolean} true if the element has text, false otherwise.
     * */
    hasValue: function () {
      return !! this.getElementValue(AGE_ELEMENT);
    },

    onInput: function () {
      // limit age to only 3 characters
      var age = this.$(AGE_ELEMENT);
      age.val(age.val().substr(0, 3));
    },

    afterRender: function () {
      this._selectPrefillAge('age');
    },

    /**
     * Called by the parent view to show any validation errors.
     *
     * @method showValidationErrorsEnd
     */
    showValidationErrorsEnd: function () {
      if (! this._validateAge()) {
        this.showValidationError(AGE_ELEMENT, AuthErrors.toError('AGE_REQUIRED'));
      }
    },

    /**
     * Called by the parent view to determine if the COPPA form is valid
     *
     * @method isValid
     */
    isValid: function () {
      return this._validateAge();
    },

    _validateAge: function () {
      return ! isNaN(this._getAge());
    },

    submitOnEnter: function (event) {
      if (event.which === KeyCodes.ENTER) {
        this.trigger('submit');
      }
    },

    _getAge: function () {
      return parseInt(this.$(AGE_ELEMENT).val(), 10);
    },

    _selectPrefillAge: function (context) {
      var prefillYear = this._formPrefill.get(context);
      if (prefillYear) {
        var ageEl = this.$(AGE_ELEMENT);
        ageEl.val(prefillYear);
        this.showFloatingPlaceholder(ageEl);
      }
    },

    beforeDestroy: function () {
      this._formPrefill.set('age', this.$(AGE_ELEMENT).val());
    }
  });

  Cocktail.mixin(
    View,
    FloatingPlaceholderMixin
  );

  module.exports = View;
});
