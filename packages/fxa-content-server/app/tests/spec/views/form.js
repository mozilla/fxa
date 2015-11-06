/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var AuthErrors = require('lib/auth-errors');
  var chai = require('chai');
  var Constants = require('lib/constants');
  var FormView = require('views/form');
  var HaltBehavior = require('views/behaviors/halt');
  var Metrics = require('lib/metrics');
  var p = require('lib/promise');
  var sinon = require('sinon');
  var Template = require('stache!templates/test_template');
  var TestHelpers = require('../../lib/helpers');

  var assert = chai.assert;

  describe('views/form', function () {
    var view, metrics;

    var View = FormView.extend({
      template: Template,

      // overridden in tests.
      formIsValid: false,
      isFormSubmitted: false,

      isValid: function () {
        return this.formIsValid;
      },

      showValidationErrors: function () {
        return this.showValidationError('body', 'invalid form');
      },

      submit: function () {
        this.isFormSubmitted = true;
      }
    });

    function testErrorDisplayed(expectedMessage) {
      return view.validateAndSubmit()
          .then(function () {
            // success callback should not be called on failure.
            assert.fail('unexpected success');
          }, function (err) {
            assert.equal(err, expectedMessage);
            assert.isTrue(view.isErrorVisible());
          });
    }

    function testValidationErrorDisplayed(expectedMessage) {
      return view.validateAndSubmit()
          .then(function () {
            // success callback should not be called on failure.
            assert(false, 'unexpected success');
          }, function (err) {
            assert.equal(err, expectedMessage);
          });
    }

    function testFormSubmitted() {
      return view.validateAndSubmit()
                  .then(function () {
                    assert.isTrue(view.isFormSubmitted);
                  });
    }

    beforeEach(function () {
      metrics = new Metrics();
      view = new View({
        metrics: metrics
      });

      return view.render()
          .then(function () {
            $('#container').html(view.el);
          });
    });

    afterEach(function () {
      if (view) {
        view.destroy();
        $(view.el).remove();
        view = null;
      }
    });

    describe('enableSubmitIfValid', function () {
      it('enables submit button if isValid returns true', function () {
        view.formIsValid = true;
        view.enableSubmitIfValid();
        assert.isFalse(view.$('button').hasClass('disabled'));
      });

      it('hides errors if isValid returns true', function () {
        view.displayError('this is an error');
        view.formIsValid = true;
        view.enableSubmitIfValid();
        assert.isFalse(view.isErrorVisible());
      });

      it('disabled submit button if isValid returns false', function () {
        view.formIsValid = false;
        view.enableSubmitIfValid();
        assert.isTrue(view.$('button').hasClass('disabled'));
      });

      it('does nothing if submitting', function () {
        sinon.stub(view, 'isValid', function () {
          return true;
        });

        sinon.stub(view, 'isHalted', function () {
          return false;
        });

        sinon.stub(view, 'isSubmitting', function () {
          return true;
        });

        view.disableForm();
        view.enableSubmitIfValid();
        assert.isFalse(view.isFormEnabled());
        assert.isTrue(view.$('button').hasClass('disabled'));
      });

      it('does nothing if halted', function () {
        sinon.stub(view, 'isValid', function () {
          return true;
        });

        sinon.stub(view, 'isHalted', function () {
          return true;
        });

        sinon.stub(view, 'isSubmitting', function () {
          return false;
        });

        view.disableForm();
        view.enableSubmitIfValid();
        assert.isFalse(view.isFormEnabled());
        assert.isTrue(view.$('button').hasClass('disabled'));
      });
    });

    describe('validateAndSubmit', function () {
      it('submits form if isValid returns true', function () {
        view.formIsValid = true;
        view.enableSubmitIfValid();
        return testFormSubmitted();
      });

      it('shows validation errors if isValid returns false', function () {
        view.formIsValid = false;
        view.enableSubmitIfValid();
        return testValidationErrorDisplayed('invalid form');
      });

      it('only allows one submit at a time', function () {
        view.formIsValid = true;
        view.enableSubmitIfValid();
        view.validateAndSubmit();
        return view.validateAndSubmit()
                  .then(function () {
                    assert(false, 'unexpected success');
                  }, function (err) {
                    assert.equal(err.message, 'submit already in progress');
                  });

      });

      it('does not submit if form is disabled', function () {
        view.formIsValid = true;
        view.disableForm();
        sinon.spy(view, 'submit');
        return view.validateAndSubmit()
          .then(function () {
            assert.isFalse(view.submit.called);
          });
      });

      it('does not submit if form is halted', function () {
        view.formIsValid = true;
        view.enableForm();
        view.halt();
        sinon.spy(view, 'submit');
        return view.validateAndSubmit()
          .then(function () {
            assert.isFalse(view.submit.called);
          });
      });

      it('displays error message and does not disable form if beforeSubmit throws an error', function () {
        view.formIsValid = true;
        view.enableSubmitIfValid();
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
        view.enableSubmitIfValid();
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
        view.enableSubmitIfValid();
        view.beforeSubmit = function () {
          return p().delay(10);
        };

        return testFormSubmitted();
      });

      it('displays error message and does not re-enable form if submit throws an error', function () {
        view.formIsValid = true;
        view.enableSubmitIfValid();
        view.submit = function () {
          throw 'an error message';
        };

        return testErrorDisplayed('an error message')
                  .then(function () {
                    assert.isFalse(view.isFormEnabled());
                  });
      });

      it('submit can return a promise for asynchronous operations', function () {
        view.formIsValid = true;
        view.enableSubmitIfValid();
        view.submit = function () {
          return p().then(function () {
            view.isFormSubmitted = true;
          }).delay(10);
        };

        return testFormSubmitted();
      });
    });

    describe('afterSubmit', function () {
      it('override to prevent re-enabling of form', function () {
        view.formIsValid = true;
        view.enableSubmitIfValid();
        view.afterSubmit = function () {
          // do not re-enable form.
        };

        return view.validateAndSubmit()
          .then(null, function () {
            assert.isFalse(view.isFormEnabled());
          });
      });

      it('errors in overridde are not disaplayed', function () {
        view.formIsValid = true;
        view.enableSubmitIfValid();
        view.afterSubmit = function () {
          throw new Error('error that is not displayed');
        };

        return view.validateAndSubmit()
                  .then(null, function (err) {
                    assert.equal(err.message, 'error that is not displayed');
                    assert.isFalse(view.isErrorVisible());
                  });
      });

      it('re-enables form by default', function () {
        return view.afterSubmit()
          .then(function () {
            assert.isTrue(view.isFormEnabled());
          });
      });

      it('pass in an object with `halt: true` to completely disable form', function () {
        view.disableForm();

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
        // wekbit fails unless focusing another element first.
        $('#otherElement').focus();

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
        }, 50);
      });

      it('invalid class is removed as soon as element is valid again', function (done) {
        view.on('validation_error', function () {
          assert.isTrue(view.$('#focusMe').hasClass('invalid'));

          // add a value, causing the validation error to be removed.
          $('#focusMe').val('heyya!');
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

    describe('validateEmail', function () {
      it('returns false if an empty email', function () {
        view.$('#email').val('');
        assert.isFalse(view.validateEmail('#email'));
        assert.isFalse(view.isElementValid('#email'));
      });

      it('returns false if an invalid email', function () {
        view.$('#email').val('invalid');
        assert.isFalse(view.validateEmail('#email'));
        assert.isFalse(view.isElementValid('#email'));
      });

      it('returns true if a valid email', function () {
        view.$('#email').val('testuser@testuser.com');
        assert.isTrue(view.validateEmail('#email'));
        assert.isTrue(view.isElementValid('#email'));
      });
    });

    describe('validatePassword', function () {
      it('returns false if an empty password', function () {
        view.$('#password').val('');
        assert.isFalse(view.validatePassword('#password'));
        assert.isFalse(view.isElementValid('#password'));
      });

      it('returns false if too short a password', function () {
        view.$('#password').val('1');
        assert.isFalse(view.validatePassword('#password'));
        assert.isFalse(view.isElementValid('#password'));
      });

      it('returns true if a valid password', function () {
        view.$('#password').val(TestHelpers.createRandomHexString(Constants.PASSWORD_MIN_LENGTH));
        assert.isTrue(view.validatePassword('#password'));
        assert.isTrue(view.isElementValid('#password'));
      });
    });

    describe('validateInput', function () {
      it('returns true for an empty non-required input', function () {
        view.$('#notRequired').val('');
        assert.isTrue(view.validateInput('#notRequired'));
        assert.isTrue(view.isElementValid('#notRequired'));
      });

      it('returns true for a filled out non-required input', function () {
        view.$('#notRequired').val('value');
        assert.isTrue(view.validateInput('#notRequired'));
        assert.isTrue(view.isElementValid('#notRequired'));
      });

      it('returns false for an empty required input', function () {
        view.$('#required').val('');
        assert.isFalse(view.validateInput('#required'));
        assert.isFalse(view.isElementValid('#required'));
      });

      it('returns true for a filled out required input', function () {
        view.$('#required').val('value');
        assert.isTrue(view.validateInput('#required'));
        assert.isTrue(view.isElementValid('#required'));
      });

      it('returns true if no internal validation fails, and HTML5 validation is not available', function () {
        sinon.stub(view, '$', function () {
          // completely synthesize a mock element that
          // has no HTML5 form validity.
          return {
            attr: function () {
            },
            val: function () {
              return 'hiya!';
            },
            '0': {
            }
          };
        });
        assert.isTrue(view.validateInput({}));
        view.$.restore();
      });
    });

    describe('showValidationErrors', function () {
      beforeEach(function () {
        // View overrides showValidationErrors, create a new View type
        // with the default showValidationErrors
        var ShowValidationErrorTestView = FormView.extend({
          template: Template
        });

        view = new ShowValidationErrorTestView();

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
        sinon.stub(view, 'showValidationError', function (el, err) {
          assert.ok(el);
          assert.isTrue(AuthErrors.is(err, 'EMAIL_REQUIRED'));
        });
        view.showValidationErrors();
        assert.isTrue(view.showValidationError.called);
      });

      it('shows correct error when an email is invalid', function () {
        view.$('input[type="email"]').val('a');
        sinon.stub(view, 'showValidationError', function (el, err) {
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
        sinon.stub(view, 'showValidationErrorsStart', function () {
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
        view.LONGER_THAN_EXPECTED = 200;
        view.formIsValid = true;
        view.enableSubmitIfValid();

        view.submit = function () {
          var defer = p.defer();

          setTimeout(function () {
            try {
              assert.isTrue(view._isErrorVisible);
              defer.resolve();
            } catch (e) {
              defer.reject(e);
            }
          }, 500);

          return defer.promise;
        };

        return view.validateAndSubmit()
          .then(function () {
            assert.isFalse(view._isErrorVisible);
          });
      });

      it('shows a notification when the response takes too long, switches when an error is thrown', function () {
        // override expectation
        view.LONGER_THAN_EXPECTED = 200;
        view.formIsValid = true;
        view.enableSubmitIfValid();

        view.submit = function () {
          var defer = p.defer();

          setTimeout(function () {
            try {
              assert.isTrue(view._isErrorVisible);
              defer.reject('BOOM');
            } catch (e) {
              defer.reject(e);
            }
          }, 500);

          return defer.promise;
        };

        return view.validateAndSubmit()
          .then(null, function () {
            assert.isTrue(view._isErrorVisible);
            assert.equal(view.$('.error').text(), 'BOOM');
          });
      });

      it('should not hide forceMessage errors', function () {
        view.formIsValid = true;
        view.enableSubmitIfValid();

        view.submit = function () {
          return p()
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

    describe('getElementType', function () {
      it('returns the type of the element', function () {
        assert.equal(view.getElementType('#focusMe'), 'text');
        assert.equal(view.getElementType('#password'), 'password');
      });

      it('returns `password` for text inputs with the `password` class', function () {
        assert.equal(view.getElementType('#focusMe'), 'text');
        view.$('#focusMe').addClass('password');
        assert.equal(view.getElementType('#focusMe'), 'password');
      });
    });

    describe('getElementValue', function () {
      it('gets an element\'s value, does not trim by default', function () {
        var elementVal = 'this is the value of an element ';
        $('#required').val(elementVal);
        assert.equal(view.getElementValue('#required'), elementVal);
      });

      it('trims the value of an email element', function () {
        var elementVal = '   testuser@testuser.com ';
        $('#email').val(elementVal);
        assert.equal(view.getElementValue('#email'), $.trim(elementVal));
      });

      it('does not trim the value of a password element', function () {
        var elementVal = '  password  ';
        $('#password').val(elementVal);
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

        view = new IsValidTestView();

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
        sinon.stub(view, 'isValidStart', function () {
          return false;
        });

        assert.isFalse(view.isValid());
      });

      it('returns false if isValidEnd returns false', function () {
        sinon.stub(view, 'isValidEnd', function () {
          return false;
        });

        assert.isFalse(view.isValid());
      });
    });
  });
});
