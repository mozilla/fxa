/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'cocktail',
  'lib/auth-errors',
  'lib/promise',
  'stache!templates/partial/coppa-age-input',
  'views/form',
  'views/mixins/floating-placeholder-mixin'
], function (Cocktail, AuthErrors, p, Template, FormView, FloatingPlaceholderMixin) {
  'use strict';

  var CUTOFF_AGE = 13;
  var View = FormView.extend({

    template: Template,
    className: 'coppa-age-input',

    initialize: function (options) {
      options = options || {};

      this._formPrefill = options.formPrefill;
    },

    events: {
      'keydown': 'submitOnEnter',
      'keyup': 'onInput',
      'input': 'onInput'
    },

    /**
     * Called by the parent view to determine if the user is old enough.
     * @method isUserOldEnough
     * @return {Boolean} true if user is old enough, false otw.
     */
    isUserOldEnough: function () {
      return this._getAge() >= CUTOFF_AGE;
    },

    onInput: function () {
      // limit age to only 3 characters
      var age = this.$('#age');
      age.val(age.val().substr(0, 3));
    },

    render: function () {
      var self = this;

      return p()
        .then(function () {
          self.$el.html(self.template(self.getContext()));
          self.initializePlaceholderFields();
          self._selectPrefillAge('age');
        });
    },

    /**
     * Called by the parent view to show any validation errors.
     *
     * @method showValidationErrorsEnd
     */
    showValidationErrorsEnd: function () {
      if (! this._validateAge()) {
        this.showValidationError('#age', AuthErrors.toError('AGE_REQUIRED'));
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
      if (event.which === 13) {
        this.trigger('submit');
      }
    },

    _getAge: function () {
      return parseInt(this.$('#age').val(), 10);
    },

    _selectPrefillAge: function (context) {
      var prefillYear = this._formPrefill.get(context);
      if (prefillYear) {
        this.$('#age').val(prefillYear);
      }
    },

    beforeDestroy: function () {
      this._formPrefill.set('age', this.$('#age').val());
    }
  });

  Cocktail.mixin(
    View,
    FloatingPlaceholderMixin
  );

  return View;
});
