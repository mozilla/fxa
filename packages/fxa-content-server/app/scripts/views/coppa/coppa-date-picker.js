/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'views/form',
  'stache!templates/partial/coppa-date-picker',
  'lib/strings',
  'lib/auth-errors',
  'lib/promise'
], function (FormView, Template, Strings, AuthErrors, p) {
  var now = new Date();
  var CUTOFF_AGE = {
    year: now.getFullYear() - 13,
    month: now.getMonth(),
    date: now.getDate()
  };

  var View = FormView.extend({

    template: Template,
    className: 'coppa-date-picker',

    initialize: function (options) {
      options = options || {};

      this._formPrefill = options.formPrefill;
      this._shouldFocus = options.shouldFocus;
    },

    events: {
      'keydown #fxa-age-year': 'submitOnEnter',
      'keydown #fxa-age-month': 'submitOnEnter',
      'keydown #fxa-age-date': 'submitOnEnter',
      'change #fxa-age-year': 'onUserYearSelect',
      'change #fxa-age-month': 'onUserMonthSelect',

      // handles select-row hack (issue 822)
      'focus select': 'onSelectFocus',
      'blur select': 'onSelectBlur',
      'change select': 'onSelectChange'
    },

    /**
     * Called by the parent view to determine if the user is old enough.
     * @method isUserOldEnough
     * @param {Object} [userAge] - hash with `year`, `month`, and `date`. Used
     * for testing.
     * @return {Boolean} true if user is old enough, false otw.
     */
    isUserOldEnough: function (userAge) {
      userAge = userAge || this._getSelectedUserAge();
      if (userAge.year < CUTOFF_AGE.year) {
        return true;
      } else if (userAge.year === CUTOFF_AGE.year &&
                 userAge.month < CUTOFF_AGE.month) {
        return true;
      }

      return (userAge.year === CUTOFF_AGE.year &&
                 userAge.month === CUTOFF_AGE.month &&
                 userAge.date <= CUTOFF_AGE.date);
    },

    /**
     * Called by the parent view to determine if the COPPA form is valid
     *
     * @method isValidEnd
     */
    isValidEnd: function () {
      if (! this._validateYear()) {
        return false;
      }

      if (this._getYear() === CUTOFF_AGE.year) {
        return this._validateMonthAndDate();
      }

      return true;
    },

    /**
     * Called by the parent view to show any validation errors.
     *
     * @method showValidationErrorsEnd
     */
    showValidationErrorsEnd: function () {
      if (! this._validateYear()) {
        this.addInvalidRow('#fxa-age-year');

        this.showValidationError('#fxa-age-year',
                AuthErrors.toError('YEAR_OF_BIRTH_REQUIRED'));
      } else if (this._getYear() === CUTOFF_AGE.year &&
               ! this._validateMonthAndDate()) {
        this.addInvalidRow('#fxa-age-month, #fxa-age-date');

        this.showValidationError('#fxa-age-month',
                AuthErrors.toError('BIRTHDAY_REQUIRED'));
      }
    },

    context: function () {
      return {
        shouldFocusYear: !! this._shouldFocus
      };
    },

    render: function () {
      var self = this;
      return p()
        .then(function () {
          self.$el.html(self.template(self.getContext()));
          self._selectPrefillYear();
        });
    },

    onSelectFocus: function (event) {
      this.addSelectFocus(event.target);
    },

    onSelectBlur: function (event) {
      this.removeSelectFocus(event.target);
    },

    onSelectChange: function (event) {
      this.removeInvalidRow(event.target);
    },

    addSelectFocus: function (element) {
      $(element).parent().addClass('select-focus');
    },

    removeSelectFocus: function (element) {
      $(element).parent().removeClass('select-focus');
    },

    addInvalidRow: function (element) {
      $(element).parent().addClass('invalid-row');
    },

    removeInvalidRow: function (element) {
      $(element).parent().removeClass('invalid-row');
    },

    beforeDestroy: function () {
      this._formPrefill.set('year', this.$('#fxa-age-year').val());
    },

    submitOnEnter: function (event) {
      if (event.which === 13) {
        this.trigger('submit');
      }
    },

    _getSelectedUserAge: function () {
      var self = this;
      return {
        year: self._getYear(),
        month: self._getMonth(),
        date: self._getDate()
      };
    },

    _validateYear: function () {
      return ! isNaN(this._getYear());
    },

    _validateMonthAndDate: function () {
      return ! (isNaN(this._getMonth()) || isNaN(this._getDate()));
    },

    _getYear: function () {
      return parseInt(this.$('#fxa-age-year').val(), 10);
    },

    _getMonth: function () {
      return parseInt(this.$('#fxa-age-month').val(), 10);
    },

    _getDate: function () {
      return parseInt(this.$('#fxa-age-date').val(), 10);
    },

    onUserYearSelect: function () {
      if (this._getYear() === CUTOFF_AGE.year) {
        this._toggleDatePicker();
      }
    },

    onUserMonthSelect: function () {
      var datePickerEl = this.$('#fxa-age-date');
      var selectedYear = this._getYear();
      var selectedMonth = this._getMonth();
      var selectedDate = this._getDate();

      if (isNaN(selectedMonth)) {
        this._disableDatePicker(datePickerEl);
      } else {
        this._enableDatePicker(datePickerEl);
      }

      var daysInMonth = this._daysInMonth(selectedYear, selectedMonth);
      this._updateDatePickerValues(datePickerEl, daysInMonth);

      if (this._isValidDateForMonth(selectedDate, daysInMonth)) {
        datePickerEl.val(selectedDate);
      }
    },

    //if the user changes from march to february (or similar),
    //we need to reset out-of-bounds dates, or keep in-bounds dates
    _isValidDateForMonth: function (date, daysInMonth) {
      return (! isNaN(date)) && date <= daysInMonth;
    },

    _disableDatePicker: function (datePickerEl) {
      datePickerEl.attr('disabled', 'true');
      datePickerEl.parent().addClass('disabled');
    },

    _enableDatePicker: function (datePickerEl) {
      datePickerEl.removeAttr('disabled');
      datePickerEl.parent().removeClass('disabled');
    },

    _updateDatePickerValues: function (datePickerEl, days) {
      var defaultValue = datePickerEl.children(':eq(0)');
      datePickerEl.empty();
      datePickerEl.append(defaultValue);
      for (var i = 1; i <= days; i++) {
        var optionHtml = Strings.interpolate(
          '<option id="fxa-day-%s" value="%s">%s</option>', [i, i, i]);
        datePickerEl.append(optionHtml);
      }
    },

    _daysInMonth: function (year, month) {
      return new Date(year, month + 1, 0).getDate();
    },

    _toggleDatePicker: function () {
      this.$('#year-picker').addClass('hidden');
      this.$('#month-date-picker').removeClass('hidden');
      this.focus('#fxa-age-month');
    },

    _selectPrefillYear: function () {
      var prefillYear = this._formPrefill.get('year');
      if (prefillYear) {
        this.$('#fxa-' + prefillYear).attr('selected', 'selected');
      }
    }
  });

  return View;
});
