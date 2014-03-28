/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Generic module to use if a view is a form. This module provides a common
 * way to do form validation and invalid element reporting. Descendent modules
 * can provide strategies for the following functions:
 * - isValidStart (optional)
 * - isValidEnd (optional)
 * - showValidationErrorsStart (optional)
 * - showValidationErrorsEnd (optional)
 * - beforeSubmit (optional)
 * - submit (required)
 * - afterSubmit (optional)
 *
 * See documentation for an explanation of each.
 */

'use strict';

define([
  'underscore',
  'jquery',
  'p-promise',
  'views/base',
  'views/tooltip',
  'lib/fxa-client'
],
function (_, $, p, BaseView, Tooltip, FxaClient) {
  var t = BaseView.t;

  var FormView = BaseView.extend({
    constructor: function (options) {
      BaseView.call(this, options);

      this.fxaClient = new FxaClient();

      // attach events of the descendent view and this view.
      this.delegateEvents(_.extend({}, FormView.prototype.events, this.events));
    },

    events: {
      'submit form': BaseView.preventDefaultThen('validateAndSubmit'),
      'keyup form': 'enableSubmitIfValid',
      'change form': 'enableSubmitIfValid'
    },

    enableSubmitIfValid: function () {
      // the change event can be called after the form is already
      // submitted if the user presses "enter" in the form. If the
      // form is in the midst of being submitted, bail out now.
      if (this.isSubmitting()) {
        return;
      }

      if (this.isValid()) {
        this.enableForm();
      } else {
        this.disableForm();
      }
    },

    disableForm: function () {
      this.$('button[type=submit]').addClass('disabled').attr('disabled', 'disabled');
    },

    enableForm: function () {
      this.$('button[type=submit]').removeClass('disabled').removeAttr('disabled');
    },

    /**
     * Validate and if valid, submit the form.
     *
     * If the form is valid, three functions are run in series using
     * a promise chain: beforeSubmit, submit, and afterSubmit.
     *
     * By default, beforeSubmit and afterSubmit are used to prevent
     * multiple concurrent form submissions. This behavior can
     * be overridden in subclasses.
     *
     * Form submission is prevented if beforeSubmit resolves to false.
     *
     * Functions can return a promise to allow for asynchronous operations.
     *
     * If a function throws an error or returns a rejected promise,
     * displayError will display the error to the user.
     *
     * @method validateAndSubmit
     * @return {promise}
     */
    validateAndSubmit: function () {
      var self = this;

      function submitForm() {
        // `submitting` flag is used to prevent multiple
        // form submissions.
        self.submitting = true;

        return p().then(_.bind(self.beforeSubmit, self))
                .then(function (shouldSubmit) {
                  // submission is opt out, not opt in.
                  if (shouldSubmit !== false) {
                    return self.submit();
                  }
                })
                .then(_.bind(self.afterSubmit, self))
                .then(function () {
                  self.submitting = false;
                }, function (err) {
                  self.submitting = false;

                  // surface returned message for testing.
                  throw self.displayError(err);
                });
      }

      return p()
        .then(function () {
          if (self.isSubmitting()) {
            // already submitting, get outta here.
            throw new Error('submitting already in progress');
          } else if (! self.isValid()) {
            // Validation error is surfaced for testing.
            throw self.showValidationErrors();
          } else {
            // all good, do the beforeSubmit, submit, and afterSubmit chain.
            return submitForm();
          }
        });

    },

    /**
     * Checks whether the form is valid. Checks the validitity of each
     * form element. If any elements are invalid, returns false.
     *
     * No errors are displayed.
     *
     * Descendent views can override isValidStart or isValidEnd to perform
     * view specific checks.
     */
    isValid: function () {
      if (! this.isValidStart()) {
        return false;
      }

      var inputEls = this.$('input');
      for (var i = 0, length = inputEls.length; i < length; ++i) {
        var el = inputEls[i];
        if (! this.isElementValid(el)) {
          return false;
        }
      }

      return this.isValidEnd();
    },

    /**
     * Check form for validity.  isValidStart is run before
     * input elements are checked. Descendent views only need to
     * override to do any form specific checks that cannot be
     * handled by the generic handlers.
     *
     * @return true if form is valid, false otw.
     */
    isValidStart: function () {
      return true;
    },

    /**
     * Check form for validity.  isValidEnd is run after
     * input elements are checked. Descendent views only need to
     * override to do any form specific checks that cannot be
     * handled by the generic handlers.
     *
     * @return true if form is valid, false otw.
     */
    isValidEnd: function () {
      return true;
    },

    /**
     * Check to see if an element passes HTML5 form validation.
     */
    isElementValid: function (selector) {
      var el = this.$(selector);
      var type = el.attr('type');

      // email follows our own rules.
      if (type === 'email') {
        return this.validateEmail(selector);
      }

      var value = el.val();
      var isValid = !!(value && el[0].validity.valid);
      return isValid;
    },

    /**
     * Display form validation errors.
     *
     * Descendent views can override showValidationErrorsStart
     * or showValidationErrorsEnd to display view specific messages.
     */
    showValidationErrors: function () {
      this.hideError();

      if (this.showValidationErrorsStart()) {
        // only one message at a time.
        return;
      }

      var inputEls = this.$('input');
      for (var i = 0, length = inputEls.length; i < length; ++i) {
        var el = inputEls[i];
        if (! this.isElementValid(el)) {
          var fieldType = this.getElementType(el);

          if (fieldType === 'email') {
            return this.showEmailValidationError(el);
          } else if (fieldType === 'password') {
            return this.showPasswordValidationError(el);
          }

          // only one message at a time.
          return;
        }
      }

      this.showValidationErrorsEnd();
    },

    getElementType: function (el) {
      var fieldType = $(el).attr('type');

      // text fields with the password class are treated as passwords.
      // These are password fields that have been converted to text
      // fields when the user clicked on 'show'
      if (fieldType === 'text' && $(el).hasClass('password')) {
        fieldType = 'password';
      }

      return fieldType;
    },

    /**
     * Display form validition errors.  isValidStart is run before
     * input element validation errors are displayed. Descendent
     * views only need to override to show any form specific
     * validation errors that are not handled by the generic handlers.
     *
     * @return true if a validation error is displayed.
     */
    showValidationErrorsStart: function () {
    },

    /**
     * Display form validition errors.  isValidEnd is run after
     * input element validation errors are displayed. Descendent
     * views only need to override to show any form specific
     * validation errors that are not handled by the generic handlers.
     *
     * @return true if a validation error is displayed.
     */
    showValidationErrorsEnd: function () {
    },

    /**
     * Validate an email field
     *
     * @return true if email is valid, false otw.
     */
    validateEmail: function (selector) {
      var email = this.$(selector).val();
      if (typeof(email) !== 'string') {
        return false;
      }

      var parts = email.split('@');

      var localLength = parts[0] && parts[0].length;
      var domainLength = parts[1] && parts[1].length;

      // Original regexp from:
      //  http://blog.gerv.net/2011/05/html5_email_address_regexp/
      // Modified to require at least a 2 part tld and remove the
      // length checks, which are done later.
      // IETF spec: http://tools.ietf.org/html/rfc5321#section-4.5.3.1.1
      // NOTE: this does *NOT* allow internationalized domain names.
      return (/^[\w.!#$%&'*+\-\/=?\^`{|}~]+@[a-z\d][a-z\d\-]*(?:\.[a-z\d][a-z\d\-]*)+$/i).test(email) &&
             // total email allwed to be 256 bytes long
             email.length <= 256 &&
             // local side only allowed to be 64 bytes long
             1 <= localLength && localLength <= 64 &&
             // domain side allowed to be up to 255 bytes long which
             // doesn't make much sense unless the local side has 0 length;
             3 <= domainLength && domainLength <= 255;
    },

    showEmailValidationError: function (which) {
      return this.showValidationError(which, t('Valid email required'));
    },

    showPasswordValidationError: function (which) {
      var passwordVal = this.$(which).val();

      var msg = passwordVal ? t('Must be at least 8 characters')
                            : t('Valid password required');

      return this.showValidationError(which, msg);
    },

    /**
     * Show a form validation error to the user in the form of a tooltip.
     */
    showValidationError: function (which, message) {
      var invalidEl = this.$(which);

      var tooltip = new Tooltip({
        message: message,
        invalidEl: invalidEl
      }).on('destroyed', function () {
        invalidEl.removeClass('invalid');
      }).render();

      this.trackSubview(tooltip);

      try {
        invalidEl.addClass('invalid').get(0).focus();
      } catch (e) {
        // IE can blow up if the element is not visible.
      }

      // used for testing
      this.trigger('validation_error', which, message);

      return message;
    },

    /**
     * Descendent views can override.
     *
     * Descendent views may want to override this to allow multiple form
     * submissions or to disable form submissions. Return false or a
     * promise that resolves to false to prevent form submission.
     *
     * @return {promise || boolean || none} Reture a promise if
     *   beforeSubmit is an asynchronous operation.
     */
    beforeSubmit: function () {
      this.disableForm();
    },

    /**
     * Descendent views should override.
     *
     * Submit form data to the server. Only called if isValid returns true
     * and beforeSubmit does not return false.
     *
     * @return {promise || none} Return a promise if submit is
     *   an asynchronous operation.
     */
    submit: function () {
    },

    /**
     * Descendent views can override.
     *
     * Descendent views may want to override this to allow
     * multiple form submissions.
     *
     * @return {promise || none} Return a promise if afterSubmit is
     *   an asynchronous operation.
     */
    afterSubmit: function () {
      this.enableForm();
    },

    /**
     * Check if the form is currently being submitted
     *
     * @return {boolean} true if form is being submitted, false otw.
     */
    isSubmitting: function () {
      return this.submitting;
    }
  });


  return FormView;
});
