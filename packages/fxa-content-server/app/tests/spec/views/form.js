/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const { assert } = require('chai');
  const AuthErrors = require('lib/auth-errors');
  const Backbone = require('backbone');
  const Constants = require('lib/constants');
  const FormView = require('views/form');
  const HaltBehavior = require('views/behaviors/halt');
  const Metrics = require('lib/metrics');
  const Notifier = require('lib/channels/notifier');
  const p = require('lib/promise');
  const sinon = require('sinon');
  const Template = require('stache!templates/test_template');
  const TestHelpers = require('../../lib/helpers');

  var View = FormView.extend({
    template: Template,

    // overridden in tests.
    formIsValid: false,
    isFormSubmitted: false,

    isValid () {
      return this.formIsValid;
    },

    showValidationErrors () {
      return this.showValidationError('body', 'invalid form');
    },

    submit () {
      this.isFormSubmitted = true;
    },

    setInitialContext (context) {
      context.set({
        error: this.model.get('templateWrittenError'),
        success: this.model.get('templateWrittenSuccess')
      });
    }
  });

  describe('views/form', function () {
    let metrics;
    let model;
    let notifier;
    let view;

    function testErrorDisplayed(expectedMessage) {
      return view.validateAndSubmit()
        .then(assert.fail, function (err) {
          assert.equal(err, expectedMessage);
          assert.isTrue(view.isErrorVisible());
        });
    }

    function testValidationErrorDisplayed(expectedMessage) {
      return view.validateAndSubmit()
        .then(assert.fail, function (err) {
          assert.equal(err, expectedMessage);
        });
    }

    function testFormSubmitted() {
      return view.validateAndSubmit()
        .then(function () {
          assert.isTrue(view.isFormSubmitted);
        });
    }

    function testValidationError($el, expectedError) {
      let validationError;

      try {
        $el.validate();
      } catch (e) {
        validationError = e;
      }

      assert.isTrue(AuthErrors.is(validationError, expectedError));
    }

    function testNoValidationError($el) {
      let validationError;

      try {
        $el.validate();
      } catch (e) {
        validationError = e;
      }

      assert.isUndefined(validationError);
    }


    beforeEach(function () {
      notifier = new Notifier();
      metrics = new Metrics({ notifier });
      model = new Backbone.Model({});
      sinon.spy(notifier, 'trigger');

      view = new View({
        metrics,
        model,
        notifier
      });

      return view.render();
    });

    afterEach(function () {
      if (view) {
        view.remove();
        view.destroy();
        view = null;
      }
    });

    describe('render', () => {
      beforeEach(() => {
        model.set({
          templateWrittenError: 'template written error',
          templateWrittenSuccess: 'template written success'
        });

        return view.render();
      });

      it('does not hide already visible status messages', () => {
        assert.lengthOf(view.$('.error.visible'), 1);
        assert.isTrue(view.isErrorVisible());
        assert.lengthOf(view.$('.success.visible'), 1);
        assert.isTrue(view.isSuccessVisible());
      });
    });

    describe('onFormChange', () => {
      it('hides messages', () => {
        sinon.stub(view, 'isHalted').callsFake(() => false);
        sinon.stub(view, 'isSubmitting').callsFake(() => false);
        sinon.spy(view, 'hideError');
        sinon.spy(view, 'hideSuccess');

        view.onFormChange();
        assert.isTrue(view.hideError.calledOnce);
        assert.isTrue(view.hideSuccess.calledOnce);
      });

      it('does nothing if submitting', function () {
        sinon.stub(view, 'isHalted').callsFake(() => false);
        sinon.stub(view, 'isSubmitting').callsFake(() => true);
        sinon.spy(view, 'hideError');
        sinon.spy(view, 'hideSuccess');

        view.onFormChange();
        assert.isFalse(view.hideError.called);
        assert.isFalse(view.hideSuccess.called);
      });

      it('does nothing if halted', function () {
        sinon.stub(view, 'isHalted').callsFake(() => true);
        sinon.stub(view, 'isSubmitting').callsFake(() => false);
        sinon.spy(view, 'hideError');
        sinon.spy(view, 'hideSuccess');

        view.onFormChange();
        assert.isFalse(view.hideError.called);
        assert.isFalse(view.hideSuccess.called);
      });

      it('notifies of `form.engage` for the first change', () => {
        sinon.stub(view, 'isHalted').callsFake(() => false);
        sinon.stub(view, 'isSubmitting').callsFake(() => false);

        view.onFormChange();
        assert.isTrue(notifier.trigger.calledOnce);
        assert.isTrue(notifier.trigger.calledWith('form.engaged'));
        view.onFormChange();
        view.onFormChange();
        assert.isTrue(notifier.trigger.calledOnce);
      });
    });

    describe('validateAndSubmit', function () {
      it('triggers a `submitStart` event', (done) => {
        view.on('submitStart', () => done());

        view.validateAndSubmit();
      });

      it('submits form if isValid returns true', function () {
        view.formIsValid = true;
        return testFormSubmitted();
      });

      it('shows validation errors if isValid returns false', function () {
        view.formIsValid = false;
        return testValidationErrorDisplayed('invalid form');
      });

      it('only allows one submit at a time', function () {
        view.formIsValid = true;
        view.validateAndSubmit();
        return view.validateAndSubmit()
                  .then(function () {
                    assert(false, 'unexpected success');
                  }, function (err) {
                    assert.equal(err.message, 'submit already in progress');
                  });

      });

      it('does not submit if form is halted', function () {
        view.formIsValid = true;
        view.halt();
        sinon.spy(view, 'submit');
        return view.validateAndSubmit()
          .then(function () {
            assert.isFalse(view.submit.called);
          });
      });

      it('displays error message and does not disable form if beforeSubmit throws an error', function () {
        view.formIsValid = true;
        view.beforeSubmit = function () {
          throw 'an error message';
        };

        return testErrorDisplayed('an error message')
                  .then(function () {
                    assert.isTrue(view.isFormEnabled());
                  });
      });

      it('beforeSubmit can return a false to stop form submission', function () {
        view.formIsValid = true;
        view.beforeSubmit = function () {
          return false;
        };

        return view.validateAndSubmit()
                    .then(function () {
                      assert.isFalse(view.isFormSubmitted);
                    });
      });

      it('beforeSubmit can return a promise for asynchronous operations', function () {
        view.formIsValid = true;
        view.beforeSubmit = function () {
          return p.delay(10);
        };

        return testFormSubmitted();
      });

      it('displays error message if submit throws an error', function () {
        view.formIsValid = true;
        sinon.stub(view, 'submit').callsFake(() => {
          throw 'an error message';
        });

        return testErrorDisplayed('an error message');
      });

      it('submit can return a promise for asynchronous operations', function () {
        view.formIsValid = true;
        view.submit = function () {
          return p.delay(10).then(function () {
            view.isFormSubmitted = true;
          });
        };

        return testFormSubmitted();
      });
    });

    describe('afterSubmit', function () {
      it('errors in override are not disaplayed', function () {
        view.formIsValid = true;
        view.afterSubmit = function () {
          throw new Error('error that is not displayed');
        };

        return view.validateAndSubmit()
          .then(assert.fail, function (err) {
            assert.equal(err.message, 'error that is not displayed');
            assert.isFalse(view.isErrorVisible());
          });
      });

      it('pass in an object with `halt: true` to disable form', function () {
        return view.afterSubmit(new HaltBehavior())
          .then(function () {
            assert.isTrue(view.isHalted());
            assert.isFalse(view.isFormEnabled());
          });
      });
    });

    describe('halt', function () {
      it('prevents input fields from being changed', function () {
        view.halt();

        view.$('input').each(function (index, el) {
          assert.ok(view.$(el).attr('disabled'));
        });
      });

      it('prevents the form from being submitted', function () {
        view.halt();

        assert.ok(view.$('button[type="submit"]').attr('disabled'));
        assert.isFalse(view.isFormEnabled());
      });
    });

    describe('showValidationError', function () {
      it('creates a tooltip', function () {
        view.on('validation_error', function (done) {
          assert.ok(view.$('.tooltip').length);
          done();
        });
        view.showValidationError('#focusMe', 'this is an error');
      });

      it('focuses the invalid element', function (done) {
        $('#container').html(view.el);

        // wekbit fails unless focusing another element first.
        view.$('#otherElement').focus();

        TestHelpers.requiresFocus(function () {
          view.$('#focusMe').on('focus', function () {
            done();
          });
          view.showValidationError('#focusMe', 'this is an error');
        }, done);
      });

      it('logs the error', function (done) {
        var err = AuthErrors.toError('EMAIL_REQUIRED');
        view.on('validation_error', function () {
          TestHelpers.wrapAssertion(function () {
            assert.isTrue(TestHelpers.isErrorLogged(metrics, err));
          }, done);
        });
        view.showValidationError('#focusMe', err);
      });

      it('adds invalid class to the invalid element', function (done) {
        view.showValidationError('#focusMe', 'this is an error');
        setTimeout(function () {
          assert.isTrue(view.$('#focusMe').hasClass('invalid'));
          done();
        }, 20);
      });

      it('invalid class is removed as soon as element is valid again', function (done) {
        view.on('validation_error', function () {
          assert.isTrue(view.$('#focusMe').hasClass('invalid'));

          // add a value, causing the validation error to be removed.
          view.$('#focusMe').val('heyya!');
          view.$('#focusMe').trigger('keyup');
        });

        view.on('validation_error_removed', function () {
          assert.isFalse(view.$('#focusMe').hasClass('invalid'));
          done();
        });

        // element is required, has no value
        view.showValidationError('#focusMe', 'Field is required');
      });
    });

    describe('getFormElements', () => {
      it('gets a list of form fields that do not have the `data-novalue` attribute', function () {
        var $els = view.getFormElements();
        assert.lengthOf($els, 12);

        $els.each((index, el) => {
          const $el = view.$(el);
          assert.isUndefined($el.attr('data-novalue'));
        });
      });
    });

    describe('getFormValues', function () {
      it('gets the value of form fields that do not have the `data-novalue` attribute', function () {
        view.$('#focusMe').val('the value');
        view.$('#otherElement').val('another value');

        var values = view.getFormValues();
        assert.equal(values.focusMe, 'the value');
        assert.equal(values.otherElement, 'another value');
        assert.isUndefined(values.novalue);
      });
    });

    describe('validate - mail', function () {
      it('not valid if an empty email', function () {
        const $el = view.$('#email');
        $el.val('');

        testValidationError($el, 'EMAIL_REQUIRED');
      });

      it('not valid if an invalid email', function () {
        const $el = view.$('#email');
        $el.val('invalid');

        testValidationError($el, 'INVALID_EMAIL');
      });

      it('valid if a valid email', function () {
        const $el = view.$('#email');
        $el.val('testuser@testuser.com');

        testNoValidationError($el);
      });
    });

    describe('validate - password', function () {
      it('invalid if an empty password', function () {
        const $el = view.$('#password');
        $el.val('');

        testValidationError($el, 'PASSWORD_REQUIRED');
      });

      it('invalid if too short a password', function () {
        const $el = view.$('#password');
        $el.val('1');

        testValidationError($el, 'PASSWORD_TOO_SHORT');
      });

      it('valid if a valid password', function () {
        const $el = view.$('#password');
        $el.val(TestHelpers.createRandomHexString(Constants.PASSWORD_MIN_LENGTH));
        testNoValidationError($el);
      });
    });

    describe('validate - text', function () {
      it('valid for an empty non-required input', function () {
        view.$('#notRequired').val('');
        testNoValidationError(view.$('#notRequired'));
      });

      it('valid for a filled out non-required input', function () {
        view.$('#notRequired').val('value');
        testNoValidationError(view.$('#notRequired'));
      });

      it('invalid for an empty required input', function () {
        const $el = view.$('#required');
        $el.val('');

        testValidationError($el, 'INPUT_REQUIRED');
      });

      it('valid for a filled out required input', function () {
        view.$('#required').val('value');
        testNoValidationError(view.$('#required'));
      });
    });

    describe('showValidationErrors', function () {
      beforeEach(function () {
        // View overrides showValidationErrors, create a new View type
        // with the default showValidationErrors
        var ShowValidationErrorTestView = FormView.extend({
          template: Template
        });

        view = new ShowValidationErrorTestView({ notifier });

        return view.render()
          .then(function () {
            view.$('#focusMe').val('a value');
            view.$('#required').val('a value');
            view.$('input[type="email"]').val('testuser@testuser.com');
            view.$('input[type="password"]').val('password');
          });
      });

      it('shows nothing when all elements are valid', function () {
        sinon.spy(view, 'showValidationError');
        view.showValidationErrors();
        assert.isFalse(view.showValidationError.called);
      });

      it('shows correct error when an email is missing', function () {
        view.$('input[type="email"]').val('');
        sinon.stub(view, 'showValidationError').callsFake(function (el, err) {
          assert.ok(el);
          assert.isTrue(AuthErrors.is(err, 'EMAIL_REQUIRED'));
        });
        view.showValidationErrors();
        assert.isTrue(view.showValidationError.called);
      });

      it('shows correct error when an email is invalid', function () {
        view.$('input[type="email"]').val('a');
        sinon.stub(view, 'showValidationError').callsFake(function (el, err) {
          assert.ok(el);
          assert.isTrue(AuthErrors.is(err, 'INVALID_EMAIL'));
        });
        view.showValidationErrors();
        assert.isTrue(view.showValidationError.called);
      });

      it('shows correct error when a password is invalid', function () {
        view.$('input[type="password"]').val('');
        sinon.spy(view, 'showValidationError');
        view.showValidationErrors();
        assert.isTrue(view.showValidationError.called);
      });

      it('shows one message at a time', function () {
        view.$('input[type="email"]').val('a');
        view.$('input[type="password"]').val('');
        sinon.spy(view, 'showValidationError');
        sinon.spy(view, 'showValidationErrorsEnd');
        view.showValidationErrors();
        assert.equal(view.showValidationError.callCount, 1);
        assert.isFalse(view.showValidationErrorsEnd.called);
      });

      it('shows one message at a time with text inputs', function () {
        view.$('input[required]').val('');
        sinon.spy(view, 'showValidationErrorsEnd');
        view.showValidationErrors();
        assert.isFalse(view.showValidationErrorsEnd.called);
      });

      it('gives subclasses the opportunity to show validation errors at the start', function () {
        sinon.stub(view, 'showValidationErrorsStart').callsFake(function () {
          return true;
        });
        view.showValidationErrors();
        assert.isTrue(view.showValidationErrorsStart.called);
      });

      it('gives subclasses the opportunity to show validation errors at the end', function () {
        sinon.spy(view, 'showValidationErrorsEnd');
        view.showValidationErrors();
        assert.isTrue(view.showValidationErrorsEnd.called);
      });
    });

    describe('notifyDelayedRequest', function () {
      it('shows a notification when the response takes too long then hides it', function () {
        // override expectation
        view.LONGER_THAN_EXPECTED = 10;
        view.formIsValid = true;

        view.submit = function () {
          return new Promise((resolve, reject) => {
            setTimeout(function () {
              try {
                assert.isTrue(view._isErrorVisible);
                resolve();
              } catch (e) {
                reject(e);
              }
            }, 20);
          });
        };

        return view.validateAndSubmit()
          .then(function () {
            assert.isFalse(view._isErrorVisible);
          });
      });

      it('shows a notification when the response takes too long, switches when an error is thrown', function () {
        // override expectation
        view.LONGER_THAN_EXPECTED = 10;
        view.formIsValid = true;

        view.submit = function () {
          return new Promise((resolve, reject) => {
            setTimeout(function () {
              try {
                assert.isTrue(view._isErrorVisible);
                reject('BOOM');
              } catch (e) {
                reject(e);
              }
            }, 20);
          });
        };

        return view.validateAndSubmit()
          .then(null, function () {
            assert.isTrue(view._isErrorVisible);
            assert.equal(view.$('.error').text(), 'BOOM');
          });
      });

      it('should not hide forceMessage errors', function () {
        view.formIsValid = true;

        view.submit = function () {
          return Promise.resolve()
            .then(function () {
              return view.displayError({ forceMessage: 'BOOM' });
            });
        };

        return view.validateAndSubmit()
          .then(function () {
            assert.equal(view.$('.error').text(), 'BOOM');
            assert.isTrue(view._isErrorVisible);
          });
      });
    });

    describe('getElementValue', function () {
      it('gets an element\'s value, does not trim by default', function () {
        var elementVal = 'this is the value of an element ';
        view.$('#required').val(elementVal);
        assert.equal(view.getElementValue('#required'), elementVal);
      });

      it('trims the value of an email element', function () {
        var elementVal = '   testuser@testuser.com ';
        view.$('#email').val(elementVal);
        assert.equal(view.getElementValue('#email'), $.trim(elementVal));
      });

      it('does not trim the value of a password element', function () {
        var elementVal = '  password  ';
        view.$('#password').val(elementVal);
        assert.equal(view.getElementValue('#password'), elementVal);
      });
    });

    describe('isValid', function () {
      beforeEach(function () {
        // View overrides isValid, create a new View type
        // with the default isValid
        var IsValidTestView = FormView.extend({
          template: Template
        });

        view = new IsValidTestView({ notifier });

        return view.render()
          .then(function () {
            view.$('#focusMe').val('a value');
            view.$('#required').val('a value');
            view.$('input[type="email"]').val('testuser@testuser.com');
            view.$('input[type="password"]').val('password');
          });
      });

      it('returns true if all elements are valid', function () {
        assert.isTrue(view.isValid());
      });

      it('returns false if one element is invalid', function () {
        view.$('input[type="email"]').val('not_an_email');
        assert.isFalse(view.isValid());
      });

      it('returns false if isValidStart returns false', function () {
        sinon.stub(view, 'isValidStart').callsFake(function () {
          return false;
        });

        assert.isFalse(view.isValid());
      });

      it('returns false if isValidEnd returns false', function () {
        sinon.stub(view, 'isValidEnd').callsFake(function () {
          return false;
        });

        assert.isFalse(view.isValid());
      });
    });
  });
});
