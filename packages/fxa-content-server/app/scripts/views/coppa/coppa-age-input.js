/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const AuthErrors = require('lib/auth-errors');
  const Cocktail = require('cocktail');
  const FloatingPlaceholderMixin = require('views/mixins/floating-placeholder-mixin');
  const FormPrefillMixin = require('views/mixins/form-prefill-mixin');
  const FormView = require('views/form');
  const KeyCodes = require('lib/key-codes');
  const Template = require('stache!templates/partial/coppa-age-input');

  const AGE_ELEMENT = '#age';
  const AGE_SIZE_LIMIT = 3;
  const CUTOFF_AGE = 13;

  const View = FormView.extend({
    template: Template,
    className: 'coppa-age-input',

    events: {
      'input': 'onInput',
      'keydown': 'onKeyDown',
      'keyup': 'onInput'
    },

    /**
     * Called by the parent view to determine if the user is old enough.
     * @method isUserOldEnough
     * @return {Boolean} true if user is old enough, false otw.
     */
    isUserOldEnough () {
      return this._getAge() >= CUTOFF_AGE;
    },

    /**
     * Called by the parent to determine if the user has entered a value.
     * @method hasValue
     * @return {Boolean} true if the element has text, false otherwise.
     * */
    hasValue () {
      return !! this.getElementValue(AGE_ELEMENT);
    },

    onInput () {
      // limit age to only 3 characters
      var age = this.$(AGE_ELEMENT);
      if (age.val().length > AGE_SIZE_LIMIT) {
        age.val(age.val().substr(0, AGE_SIZE_LIMIT));
      }
    },

    onKeyDown (event) {
      // helper function to check for digit
      function isKeyADigitOrSpecialCharacter (keyCode) {
        return (
          (keyCode === KeyCodes.BACKSPACE) ||
          (keyCode === KeyCodes.TAB) ||
          (keyCode === KeyCodes.LEFT_ARROW) ||
          (keyCode === KeyCodes.RIGHT_ARROW) ||
          (keyCode >= KeyCodes.NUM_0 && keyCode <= KeyCodes.NUM_9) ||
          (keyCode >= KeyCodes.NUMPAD_0 && keyCode <= KeyCodes.NUMPAD_9)
        );
      }

      // submit on enter, force digit input
      if (event.which === KeyCodes.ENTER) {
        this.trigger('submit');
      } else if (! isKeyADigitOrSpecialCharacter(event.which)) {
        event.preventDefault();
      }
    },

    /**
     * Called by the parent view to show any validation errors.
     *
     * @method showValidationErrorsEnd
     */
    showValidationErrorsEnd () {
      if (! this._validateAge()) {
        this.showValidationError(AGE_ELEMENT, AuthErrors.toError('AGE_REQUIRED'));
      }
    },

    /**
     * Called by the parent view to determine if the COPPA form is valid
     *
     * @method isValid
     *
     * @returns {Boolean}
     */
    isValid () {
      return this._validateAge();
    },

    _validateAge () {
      return ! isNaN(this._getAge());
    },

    _getAge () {
      return parseInt(this.$(AGE_ELEMENT).val(), 10);
    }
  });

  Cocktail.mixin(
    View,
    FloatingPlaceholderMixin,
    FormPrefillMixin
  );

  module.exports = View;
});
