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

define([
  'underscore',
  'jquery',
  'lib/promise',
  'lib/validate',
  'lib/auth-errors',
  'views/base',
  'views/tooltip',
  'views/decorators/progress_indicator',
  'views/decorators/notify_delayed_request',
  'views/decorators/allow_only_one_submit'
],
function (_, $, p, Validate, AuthErrors, BaseView, Tooltip,
    showButtonProgressIndicator, notifyDelayedRequest, allowOnlyOneSubmit) {
  'use strict';

  /**
   * Decorator that checks whether the form has changed, and if so, call
   * the specified handler.
   * Called if `keypress` or `change` is fired on the form.
   */
  function ifFormValuesChanged(handler) {
    return function () {
      if (this.updateFormValueChanges()) {
        return this.invokeHandler(handler, arguments);
      }
    };
  }

  var FormView = BaseView.extend({

    // Time to wait for a request to finish before showing a notice
    LONGER_THAN_EXPECTED: 10000, // 10 seconds

    constructor: function (options) {
      BaseView.call(this, options);

      // attach events of the descendent view and this view.
      this.delegateEvents(_.extend({}, FormView.prototype.events, this.events));
    },

    events: {
      'submit form': BaseView.preventDefaultThen('validateAndSubmit'),
      'change form': ifFormValuesChanged(BaseView.cancelEventThen('enableSubmitIfValid')),
      'keyup form': ifFormValuesChanged(BaseView.cancelEventThen('enableSubmitIfValid')),
      'input form': ifFormValuesChanged(BaseView.cancelEventThen('enableSubmitIfValid'))
    },

    afterRender: function () {
      this.enableSubmitIfValid();

      BaseView.prototype.afterRender.call(this);
    },

    /**
     * Get the current form values. Does not fetch the value of elements with
     * the `data-novalue` attribute.
     *
     * @method getFormValues
     */
    getFormValues: function () {
      var values = {};
      var inputEls = this.$('input,textarea,select');

      for (var i = 0, length = inputEls.length; i < length; ++i) {
        var el = $(inputEls[i]);
        // elements that have data-novalue (like password show fields)
        // are not added to the values.
        if (typeof el.attr('data-novalue') === 'undefined') {
          var name = el.attr('name') || el.attr('id');
          values[name] = this.getElementValue(el);
        }
      }

      return values;
    },

    enableSubmitIfValid: function (event) {
      // the change event can be called after the form is already
      // submitted if the user presses "enter" in the form. If the
      // form is in the midst of being submitted, bail out now.
      if (this.isSubmitting() || this.isHalted()) {
        return;
      }


      if (this.isValid()) {
        this.hideError();
        this.enableForm();
      } else {
        this.disableForm();
      }
    },

    /**
     * TODO - this should be called disableSubmit
     */
    disableForm: function () {
      // the disabled class is used instead of the disabled attribute
      // so that the submit handler is still called. With the submit attribute
      // applied, no submit handler is fired, and the form validation does not
      // take place.
      this.$('button[type=submit]').addClass('disabled');
      this._isFormEnabled = false;
    },

    enableForm: function () {
      this.$('button[type=submit]').removeClass('disabled');
      this._isFormEnabled = true;
    },

    _isFormEnabled: true,
    isFormEnabled: function () {
      return !! this._isFormEnabled;
    },

    /**
     * Validate and if valid, submit the form.
     *
     * If the form is valid, three functions are run in series using
     * a promise chain: beforeSubmit, submit, and afterSubmit.
     *
     * By default, beforeSubmit and afterSubmit are used to prevent
     * multiple concurrent form submissions. The form is disbled in
     * beforeSubmit, and if no error is displayed, the form is re-enabled
     * in afterSubmit. This behavior can be overridden in subclasses.
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
    validateAndSubmit: allowOnlyOneSubmit(function validateAndSubmit (event) {
      var self = this;
      if (event) {
        event.stopImmediatePropagation();
      }

      return p()
        .then(function () {
          if (self.isHalted()) {
            return;
          }

          if (! self.isValid()) {
            // Validation error is surfaced for testing.
            throw self.showValidationErrors();
          }

          // the form enabled check is done after the validation check
          // so that the form's `submit` handler is triggered and validation
          // error tooltips are displayed, even if the form is disabled.
          if (! self.isFormEnabled()) {
            // form is disabled, get outta here.
            return;
          }

          // all good, do the beforeSubmit, submit, and afterSubmit chain.
          self.logScreenEvent('submit');
          return self._submitForm();
        });
    }),

    _submitForm: notifyDelayedRequest(showButtonProgressIndicator(function () {
      var self = this;
      return p()
          .then(_.bind(self.beforeSubmit, self))
          .then(function (shouldSubmit) {
            // submission is opt out, not opt in.
            if (shouldSubmit !== false) {
              return self.submit();
            }
          })
          .then(null, function (err) {
            // display error and surface for testing.
            self.displayError(err);
            throw err;
          })
          .then(_.bind(self.afterSubmit, self));
    })),

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

      var inputEls = this.$('input').not('#coppa input');
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
    isElementValid: function (el) {
      el = this.$(el);
      var type = this.getElementType(el);

      // email and password follow our own rules.
      if (type === 'email') {
        return this.validateEmail(el);
      } else if (type === 'password') {
        return this.validatePassword(el);
      }

      return this.validateInput(el);
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

      // exclude coppa inputs from validation, coppa has its own validation
      var inputEls = this.$('input').not('#coppa input');
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

    /**
     * Get an element value, trimming the value of whitespace if necesary
     */
    getElementValue: function (el) {
      var value = this.$(el).val();

      if (value && this.getElementType(el) === 'email') {
        value = $.trim(value);
      }

      return value;
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
    validateEmail: function (el) {
      var email = this.getElementValue(el);
      return Validate.isEmailValid(email);
    },

    showEmailValidationError: function (el) {
      var value = this.getElementValue(el);
      var err = value && value.length ?
                  // if the email element has any length, but is marked
                  // as invalid, it's invalid.
                  AuthErrors.toError('INVALID_EMAIL') :
                  // email has no length, it's missing.
                  AuthErrors.toError('EMAIL_REQUIRED');

      return this.showValidationError(el, err);
    },

    /**
     * Validate a password field
     *
     * @return true if password is valid, false otw.
     */
    validatePassword: function (el) {
      var password = this.getElementValue(el);
      return Validate.isPasswordValid(password);
    },

    /**
     * Basic text input validation. By default, only performs `required`
     * attribute validation. If the browser supports HTML5 form validation,
     * browser validation will kick in. If validating an email or password
     * field, call validateEmail or validatePassword instead.
     */
    validateInput: function (el) {
      el = this.$(el);
      var isRequired = typeof el.attr('required') !== 'undefined';

      var value = this.getElementValue(el);

      if (isRequired && value.length === 0) {
        return false;
      }

      // If the browser supports HTML5 form validation, hooray,
      // use its validation too.
      var hasHtml5Validation = !! el[0].validity;
      if (hasHtml5Validation) {
        return el[0].validity.valid;
      }

      return true;
    },

    showPasswordValidationError: function (el) {
      var passwordVal = this.getElementValue(el);

      var errType = passwordVal ? 'PASSWORD_TOO_SHORT' : 'PASSWORD_REQUIRED';

      return this.showValidationError(el, AuthErrors.toError(errType));
    },

    /**
     * Show a form validation error to the user in the form of a tooltip.
     */
    showValidationError: function (el, err) {
      this.logError(err);

      var invalidEl = this.$(el);
      var message = AuthErrors.toMessage(err);

      var tooltip = new Tooltip({
        message: message,
        invalidEl: invalidEl
      });

      var self = this;
      tooltip.on('destroyed', function () {
        invalidEl.removeClass('invalid');
        self.trigger('validation_error_removed', el);
      }).render().then(function () {
        // used for testing
        self.trigger('validation_error', el, message);
      });

      this.trackSubview(tooltip);

      try {
        invalidEl.addClass('invalid').get(0).focus();
      } catch (e) {
        // IE can blow up if the element is not visible.
      }

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
    afterSubmit: function (result) {
      var self = this;
      return p().then(function () {
        // the flow may be halted by an authentication broker after form
        // submission. Views may display an error without throwing an exception.
        // Ensure the flow is not halted and and no errors are visible before
        // re-enabling the form. The user must modify the form for it to
        // be re-enabled.

        if (result && result.halt) {
          self.halt();
        } else if (! self.isErrorVisible()) {
          self.enableForm();
        }

        return result;
      });
    },

    /**
     * Check if the form is currently being submitted
     *
     * @return {boolean} true if form is being submitted, false otw.
     */
    isSubmitting: function () {
      return this._isSubmitting;
    },

    /**
     * Halt! Disable form edits, submission.
     *
     * TODO - this should be named disableForm, but that name is already taken.
     */
    halt: function () {
      this.$('input,textarea,button').attr('disabled', 'disabled').blur();
      this._isHalted = true;
    },

    /**
     * Check if the view is halted
     *
     * @return {boolean} true if the view is halted, false otw.
     */
    isHalted: function () {
      return this._isHalted;
    },

    /**
     * Detect if form values have changed
     *
     * @return {object || null} the form values or null if they haven't changed.
     */
    detectFormValueChanges: function () {
      // oldValues will be `undefined` the first time through.
      var oldValues = this._previousFormValues;
      var newValues = this.getFormValues();

      if (! _.isEqual(oldValues, newValues)) {
        return newValues;
      }

      return null;
    },

    /**
     * Detect if form values have changed and use the new
     * values as the baseline to detect future changes.
     *
     * @return {object || null} the form values or null if they haven't changed.
     */
    updateFormValueChanges: function () {
      var newValues = this.detectFormValueChanges();
      if (newValues) {
        this._previousFormValues = newValues;
      }
      return newValues;
    }
  });

  return FormView;
});
