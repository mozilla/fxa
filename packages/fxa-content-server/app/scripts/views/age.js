/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'views/base',
  'stache!templates/age'
],
function (BaseView, AgeTemplate) {
  var now = new Date();

  var VERIFICATION_AGE = 13;
  var NEEDS_VERIFICATION_YEAR = now.getFullYear() - VERIFICATION_AGE;

  var AgeView = BaseView.extend({
    template: AgeTemplate,
    className: 'age',

    events: {
      'submit form': 'age',
      'keyup select': 'enableButtonWhenValid',
      'change select': 'enableButtonWhenValid'
    },

    age: function (event) {
      event.preventDefault();

      if (! this._validateYear()) {
        return;
      }

      var year = parseInt(this.$('#fxa-age-year').val(), 10);

      var nextStep = this._getNextStep(year);

      router.navigate(nextStep, { trigger: true });
    },

    isValid: function () {
      return this._validateYear();
    },

    _validateYear: function () {
      var year = this.$('#fxa-age-year').val();
      return year !== 'none';
    },

    _getNextStep: function (year) {
      var nextStep = 'cannot_create_account';

      if (this._requiresMoreVerification(year)) {
        nextStep = 'birthday';
      } else if (this._canCreateAccount(year)) {
        nextStep = 'create_account';
      }

      return nextStep;
    },

    _requiresMoreVerification: function (year) {
      return year === NEEDS_VERIFICATION_YEAR;
    },

    _canCreateAccount: function (year) {
      return year < NEEDS_VERIFICATION_YEAR;
    }

  });

  return AgeView;
});

