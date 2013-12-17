/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'views/base',
  'stache!templates/birthday'
],
function (BaseView, BirthdayTemplate) {
  var BirthdayView = BaseView.extend({
    template: BirthdayTemplate,
    className: 'birthday',

    events: {
      'submit form': 'birthday'
    },

    birthday: function (event) {
      event.preventDefault();

      if (!this._validate()) {
        return;
      }

      var month = this._getMonth();
      var day = this._getDay();

      var nextStep = this._getNextStep(month, day);

      router.navigate(nextStep, { trigger: true });
    },

    _validate: function () {
      return !(isNaN(this._getMonth()) || isNaN(this._getDay()));
    },

    _getMonth: function () {
      var val = this.$('#fxa-month').val();
      return parseInt(val, 10);
    },

    _getDay: function () {
      var val = this.$('#fxa-day').val();
      return parseInt(val, 10);
    },

    _getNextStep: function (month, day) {
      if (this._canCreateAccount(month, day)) {
        return 'create_account';
      }

      return 'cannot_create_account';
    },

    _canCreateAccount: function (month, day) {
      // Make the assumption that the user is 13 during this calendar year.
      // Find out whether they are 12 or 13 now.
      //
      // JS months go from 0-11. The months in the form go from 1-12 to be
      // comprehensible to humans.
      month = month - 1;
      var today = new Date();
      var todayMonth = today.getMonth();
      var todayDay = today.getDate();

      return ((month < todayMonth) ||
              (month === todayMonth && day <= todayDay));
    }
  });

  return BirthdayView;
});

