/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'mocha',
  'chai',
  'jquery',
  'views/form',
  'stache!templates/test_template'
],
function (mocha, chai, jQuery, FormView, Template) {
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
      jQuery('body').append(view.el);
    });

    afterEach(function () {
      if (view) {
        view.destroy();
        jQuery(view.el).remove();
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
      it('sets the title of the nearest tooltip', function() {
        view.showValidationError('#focusMe', 'this is an error');
        assert.equal(view.$('.tooltip').attr('title'), 'this is an error');
      });

      it('removes the title of the nearest tooltip when changed', function() {
        view.showValidationError('#focusMe', 'this is an error');
        $('#focusMe').trigger('keydown');
        assert.equal(view.$('.tooltip').attr('title'), null);
      });

      it('focuses the invalid element', function (done) {
        view.$('#focusMe').on('focus', function () {
          done();
        });
        view.showValidationError('#focusMe', 'this is an error');
      });
    });

  });
});

