/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'underscore',
  'jquery',
  'moment',
  'sinon',
  'lib/auth-errors',
  'lib/promise',
  'views/coppa/coppa-date-picker',
  'models/form-prefill'
],
function (chai, _, $, moment, sinon, p, AuthErrors, View, FormPrefill) {
  var assert = chai.assert;

  var DEFAULT_YEAR = 1990;
  var DEFAULT_MONTH = 1;
  var DEFAULT_DATE = 1;

  function fillOutDatePicker (year, month, date, context) {
    if (year !== null) {
      $('#fxa-age-year').val(year);
      $('#fxa-age-year').change();
    }

    if (month !== null) {
      $('#fxa-age-month').val(month);
      $('#fxa-age-month').change();
    }

    if (date !== null) {
      $('#fxa-age-date').val(date);
      $('#fxa-age-date').change();
    }

    if (context.enableSubmitIfValid) {
      context.enableSubmitIfValid();
    }
  }

  describe('views/coppa/coppa-date-picker', function () {
    var view;
    var formPrefill;

    function createView() {
      view = new View({
        screenName: 'signup',
        formPrefill: formPrefill
      });
    }

    beforeEach(function () {

      formPrefill = new FormPrefill();

      createView();

      return view.render()
        .then(function () {
          $('#container').html(view.el);
        });
    });

    afterEach(function () {
      view.remove();
      view.destroy();

      view = null;
    });

    describe('render', function () {
      it('prefills year if stored in formPrefill (user comes from signup with existing account)', function () {
        formPrefill.set('year', '1990');

        createView();

        return view.render()
          .then(function () {
            assert.ok(view.$('#fxa-1990').is(':selected'));
          });
      });
    });

    describe('isValid', function () {
      it('returns true if year, month, and date are all valid', function () {
        fillOutDatePicker(DEFAULT_YEAR, DEFAULT_MONTH, DEFAULT_DATE, view);

        assert.isTrue(view.isValid());
      });

      it('returns false if no year selected', function () {
        fillOutDatePicker(null, DEFAULT_MONTH, DEFAULT_DATE, view);

        assert.isFalse(view.isValid());
      });

      it('returns false if no month selected and needs to be checked', function () {
        var year = moment().subtract(13, 'years').year();
        fillOutDatePicker(year, null, DEFAULT_DATE, view);

        assert.isFalse(view.isValid());
      });

      it('returns false if no date selected and needs to be checked', function () {
        var year = moment().subtract(13, 'years').year();
        var month = moment().subtract(13, 'years').month();
        fillOutDatePicker(year, month, null, view);

        assert.isFalse(view.isValid());
      });
    });

    describe('showValidationErrors', function () {
      it('shows an error if no year is selected', function () {
        fillOutDatePicker(null, DEFAULT_MONTH, DEFAULT_DATE, view);

        sinon.spy(view, 'showValidationError');

        view.showValidationErrors();
        assert.isTrue(view.showValidationError.called);
      });

      it('shows an error if no month is selected and should be', function () {
        var year = moment().subtract(13, 'years').year();
        fillOutDatePicker(year, null, DEFAULT_DATE, view);

        sinon.spy(view, 'showValidationError');

        view.showValidationErrors();
        assert.isTrue(view.showValidationError.called);
      });

      it('shows an error if no date is selected and should be', function () {
        var year = moment().subtract(13, 'years').year();
        var month = moment().subtract(13, 'years').month();
        fillOutDatePicker(year, month, null, view);

        sinon.spy(view, 'showValidationError');

        view.showValidationErrors();
        assert.isTrue(view.showValidationError.called);
      });
    });

    describe('submitOnEnter', function () {
      function testEnterKeyTriggersSubmit(element, done) {
        view.on('submit', function () {
          done();
        });

        // submit using the enter key
        var e = jQuery.Event('keydown', { which: 13 });
        $(element).trigger(e);
      }

      it('submits form if user presses enter on the year', function (done) {
        testEnterKeyTriggersSubmit('#fxa-age-year', done);
      });

      it('submits form if user presses enter on the month', function (done) {
        testEnterKeyTriggersSubmit('#fxa-age-month', done);
      });

      it('submits form if user presses enter on the day', function (done) {
        testEnterKeyTriggersSubmit('#fxa-age-date', done);
      });
    });

    describe('isUserOldEnough', function () {
      it('returns true if user is 14 year old', function () {
        var ageToCheck = moment().subtract(14, 'years');
        assert.isTrue(view.isUserOldEnough({
          year: ageToCheck.year(),
          month: ageToCheck.month(),
          date: ageToCheck.date()
        }));
      });

      it('returns true if user is 13 years + 1 days old', function () {
        var ageToCheck = moment().subtract(13, 'years').subtract(1, 'days');
        assert.isTrue(view.isUserOldEnough({
          year: ageToCheck.year(),
          month: ageToCheck.month(),
          date: ageToCheck.date()
        }));
      });

      it('returns true if user is 13 years and 29 days old', function () {
        var ageToCheck = moment().subtract(13, 'years').subtract(29, 'days');
        assert.isTrue(view.isUserOldEnough({
          year: ageToCheck.year(),
          month: ageToCheck.month(),
          date: ageToCheck.date()
        }));
      });

      it('returns true if user is 13 years and 1 month old', function () {
        var ageToCheck = moment().subtract(13, 'years').subtract(1, 'months');
        assert.isTrue(view.isUserOldEnough({
          year: ageToCheck.year(),
          month: ageToCheck.month(),
          date: ageToCheck.date()
        }));
      });

      it('returns true if user is 13 years old today - HOORAY!', function () {
        var ageToCheck = moment().subtract(13, 'years');
        assert.isTrue(view.isUserOldEnough({
          year: ageToCheck.year(),
          month: ageToCheck.month(),
          date: ageToCheck.date()
        }));
      });

      it ('returns false if user is 13 years - 1 day old - wait until tomorrow', function () {
        var ageToCheck = moment().subtract(13, 'years').add(1, 'days');
        assert.isFalse(view.isUserOldEnough({
          year: ageToCheck.year(),
          month: ageToCheck.month(),
          date: ageToCheck.date()
        }));
      });

      it('returns false if user is 13 years - 1 month old - wait another month', function () {
        var ageToCheck = moment().subtract(13, 'years').add(1, 'months');
        assert.isFalse(view.isUserOldEnough({
          year: ageToCheck.year(),
          month: ageToCheck.month(),
          date: ageToCheck.date()
        }));
      });

      it('returns false if user is 12 years old - wait another year', function () {
        var ageToCheck = moment().subtract(12, 'years');
        assert.isFalse(view.isUserOldEnough({
          year: ageToCheck.year(),
          month: ageToCheck.month(),
          date: ageToCheck.date()
        }));
      });
    });

    describe('destroy', function () {
      it('saves the form info to formPrefill', function () {
        view.$('#fxa-age-year').val('1990');

        view.destroy();

        assert.equal(formPrefill.get('year'), '1990');
      });
    });
  });
});


