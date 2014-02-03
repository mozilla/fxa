/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Generic module to use if a view is a form. This module provides a common
 * way to do form validation and invalid element reporting. The module
 * expects consumers to provide strategies for three functions:
 * - isFormValid
 * - showValidationErrors
 * - submitForm
 *
 * See documentation for an explanation of each.
 */

'use strict';

define([
  'underscore',
  'views/base'
],
function (_, BaseView) {
  var FormView = BaseView.extend({
    constructor: function (options) {
      BaseView.call(this, options);

      // attach events of the descendent view and this view.
      this.delegateEvents(_.extend({}, FormView.prototype.events, this.events));
    },

    events: {
      'submit form': BaseView.preventDefaultThen('validateAndSubmit'),
      'keyup form': 'enableSubmitIfValid',
      'change form': 'enableSubmitIfValid'
    },

    enableSubmitIfValid: function () {
      var enabled = this.isFormValid();

      var submitButton = this.$('button[type="submit"]');
      submitButton[enabled ? 'removeClass' : 'addClass']('disabled');
    },

    validateAndSubmit: function () {
      if (this.isFormValid()) {
        this.submitForm();
      } else {
        this.showValidationErrors();
      }
    },

    /**
     * Descendent views must override!
     *
     * Check to see whether all input elements in the form are valid. Does
     * not display any errors. If all input elements are valid, the submit
     * button will be enabled.
     *
     * @return true if all inputs are valid, false otw.
     */
    isFormValid: function () {
      // override in child views.
      return true;
    },

    /**
     * Check to see if an element passes HTML5 form validation.
     */
    isElementValid: function (selector) {
      var el = this.$(selector);
      var value = el.val();
      return value && el[0].validity.valid;
    },

    /**
     * Descendent views must override!
     *
     * Display any form validation errors to the user. Only called if
     * isFormValid returns false.
     */
    showValidationErrors: function () {
      // override in child views to show any validation errors.
    },

    /**
     * Show a form validation error to the user in the form of a tooltip.
     */
    showValidationError: function (which, message) {
      var invalidEl = this.$(which);
      var tooltipEl = invalidEl.closest('.input-row');
      tooltipEl.attr('title', message);

      // keyboard input for input/select elements.
      invalidEl.one('keydown', function() {
        tooltipEl.attr('title', null);
      });
      // handle selecting an option with the mouse for select elements
      invalidEl.find('option').one('click', function() {
        tooltipEl.attr('title', null);
      });

      try {
        invalidEl.get(0).focus();
      } catch (e) {
        // IE can blow up if the element is not visible.
      }

      // used for testing
      this.trigger('validation_error', which, message);
    },

    /**
     * Descendent views must override!
     *
     * Submit form data to the server. Only called if isFormValid returns true
     */
    submitForm: function () {
      // override in child views to submit data to backend.
    }
  });


  return FormView;
});
