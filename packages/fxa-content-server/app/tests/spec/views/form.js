/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'jquery',
  'views/form',
  'stache!templates/test_template',
  '../../lib/helpers'
],
function (chai, $, FormView, Template, TestHelpers) {
  /*global describe, beforeEach, afterEach, it*/
  var assert = chai.assert;

  describe('views/form', function () {
    var view;

    beforeEach(function () {
      var View = FormView.extend({
        template: Template,

        // overridden in tests.
        formIsValid: false,

        isValid: function () {
          return this.formIsValid;
        },

        showValidationErrors: function () {
          this.validationErrorsShown = true;
        },

        submit: function () {
          this.formSubmitted = true;
        }
      });

      view = new View({});

      view.render();
      $('body').append(view.el);
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

      it('disabled submit button if isValid returns false', function () {
        view.formIsValid = false;
        view.enableSubmitIfValid();
        assert.isTrue(view.$('button').hasClass('disabled'));
      });
    });

    describe('validateAndSubmit', function () {
      it('submits form if isValid returns true', function () {
        view.formIsValid = true;
        view.validateAndSubmit();
        assert.isTrue(view.formSubmitted);
      });

      it('shows validation errors if isValid returns false', function () {
        view.formIsValid = false;
        view.validateAndSubmit();
        assert.isTrue(view.validationErrorsShown);
      });
    });

    describe('showValidationError', function () {
      it('creates a tooltip', function() {
        view.showValidationError('#focusMe', 'this is an error');
        assert.ok($('.tooltip').length);
      });

      it('focuses the invalid element', function (done) {
        TestHelpers.requiresFocus(function () {
          view.$('#focusMe').on('focus', function () {
            done();
          });
          view.showValidationError('#focusMe', 'this is an error');
        }, done);
      });

      it('adds invalid class to the invalid element', function () {
        view.showValidationError('#focusMe', 'this is an error');
        assert.isTrue(view.$('#focusMe').hasClass('invalid'));
      });

      it('invalid class is removed as soon as element is valid again', function () {
        // element is required, has no value
        view.showValidationError('#focusMe', 'Field is required');
        assert.isTrue(view.$('#focusMe').hasClass('invalid'));

        // add a value
        $('#focusMe').val('heyya!');
        view.$('#focusMe').trigger('keydown');
        assert.isFalse(view.$('#focusMe').hasClass('invalid'));
      });
    });

  });
});

