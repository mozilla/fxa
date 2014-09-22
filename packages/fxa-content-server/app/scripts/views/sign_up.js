/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'p-promise',
  'views/base',
  'views/form',
  'stache!templates/sign_up',
  'lib/session',
  'views/mixins/password-mixin',
  'lib/auth-errors',
  'views/mixins/service-mixin'
],
function (_, p, BaseView, FormView, Template, Session, PasswordMixin, AuthErrors, ServiceMixin) {
  var t = BaseView.t;

  function selectAutoFocusEl(email, password) {
    if (! email) {
      return 'email';
    } else if (! password) {
      return 'password';
    }
    return 'year';
  }

  var now = new Date();

  var CUTOFF_AGE = {
    year: now.getFullYear() - 13,
    month: now.getMonth() + 1, //makes cutoff month indexed to 1
    date: now.getDate()
  };
  
  var userAge = {};

  var View = FormView.extend({
    template: Template,
    className: 'sign-up',

    initialize: function (options) {
      options = options || {};

      // Reset forceAuth flag so users who visit the reset_password screen
      // see the correct links.
      Session.set('forceAuth', false);
    },

    beforeRender: function () {
      if (document.cookie.indexOf('tooyoung') > -1) {
        this.navigate('cannot_create_account');
        return p(false);
      }

      return FormView.prototype.beforeRender.call(this);
    },

    // afterRender fucnction to handle select-row hack (issue 822)
    afterRender: function() {
      var select = this.$el.find('.select-row select');
      select.focus(function(){
        $(this).parent().addClass('select-focus');
      });
      select.blur(function(){
        select.parent().removeClass('select-focus');
      });
      select.change(function(){
        select.parent().removeClass('invalid-row');
      });

      this._selectPrefillYear();

      FormView.prototype.afterRender.call(this);
    },

    events: {
      'change .show-password': 'onPasswordVisibilityChange',
      'keydown #fxa-age-year': 'submitOnEnter',
      'change #fxa-age-year': 'onUserYearSelect',
      'change #fxa-age-month': 'onUserMonthSelect',
      'change #fxa-age-date': 'onUserDateSelect'
    },

    context: function () {
      // Session.prefillEmail comes first because users can edit the email,
      // go to another screen, edit the email again, and come back here. We
      // want the last used email.
      var email = Session.prefillEmail || this.searchParam('email');

      var autofocusEl = selectAutoFocusEl(email, Session.prefillPassword);

      return {
        service: this.relier.get('service'),
        serviceName: this.relier.get('serviceName'),
        email: email,
        password: Session.prefillPassword,
        year: Session.prefillYear || 'none',
        isSync: this.relier.isSync(),
        shouldFocusEmail: autofocusEl === 'email',
        shouldFocusPassword: autofocusEl === 'password',
        shouldFocusYear: autofocusEl === 'year',
        error: this.error
      };
    },

    beforeDestroy: function () {
      Session.set('prefillEmail', this.$('.email').val());
      Session.set('prefillPassword', this.$('.password').val());
      Session.set('prefillYear', this.$('#fxa-age-year').val());
    },

    submitOnEnter: function (event) {
      if (event.which === 13) {
        this.validateAndSubmit();
      }
    },

    isValidEnd: function () {
      if (userAge.year > CUTOFF_AGE.year || userAge.year < CUTOFF_AGE.year) {
        return this._validateYear();
      }
      return ( this._validateYear() && this._validateMonthAndDate() );
    },

    showValidationErrorsEnd: function () {
      if (! this._validateYear()) {
        //next two lines deal with ff30's select list regression
        var selectYearRow = $('#fxa-age-year').parent();
        selectYearRow.addClass('invalid-row');

        this.showValidationError('#fxa-age-year', AuthErrors.toError('YEAR_OF_BIRTH_REQUIRED'));
      } else if (userAge.year === CUTOFF_AGE.year) {
        if (! this._validateMonthAndDate()) {

          var selectMonthDateRow = this.$('#fxa-age-month, #fxa-age-date').parent();
          selectMonthDateRow.addClass('invalid-row');

          this.showValidationError('#fxa-age-month', AuthErrors.toError('BIRTHDAY_REQUIRED'));
        }
      }
    },

    submit: function () {
      if (! this._isUserOldEnough()) {
        return this._cannotCreateAccount();
      }

      return this._createAccount();
    },

    _validateYear: function () {
      return ! isNaN(this._getYear());
    },

    _validateMonthAndDate: function() {
      return ! (isNaN(this._getMonth()) || isNaN(this._getDate()));
    },

    _getYear: function () {
      return this.$('#fxa-age-year').val();
    },

    _getMonth: function() {
      return this.$('#fxa-age-month').val();
    },

    _getDate: function() {
      return this.$('#fxa-age-date').val();
    },

    _isUserOldEnough: function () {
      if (userAge.year < CUTOFF_AGE.year) {
        return true;
      } else if (userAge.year === CUTOFF_AGE.year) {
        
        if (userAge.month <= CUTOFF_AGE.month && userAge.date <= CUTOFF_AGE.date) {
          return true;
        }

      }
      return false;
    },

    _cannotCreateAccount: function () {
      // this is a session cookie. It will go away once:
      // 1. the user closes the tab
      // and
      // 2. the user closes the browser
      // Both of these have to happen or else the cookie
      // hangs around like a bad smell.
      document.cookie = 'tooyoung=1;';

      this.navigate('cannot_create_account');
    },

    _createAccount: function () {
      var self = this;
      var email = self.$('.email').val();
      var password = self.$('.password').val();
      var customizeSync = self.$('.customize-sync').is(':checked');

      return self.fxaClient.signUp(email, password, {
        customizeSync: customizeSync,
        preVerifyToken: self.relier.get('preVerifyToken')
      }).then(_.bind(self.onSignUpSuccess, self))
      .then(null, function (err) {
        // Account already exists. No attempt is made at signing the
        // user in directly, instead, point the user to the signin page
        // where the entered email/password will be prefilled.
        if (AuthErrors.is(err, 'ACCOUNT_ALREADY_EXISTS')) {
          return self._suggestSignIn(err);
        } else if (AuthErrors.is(err, 'USER_CANCELED_LOGIN')) {
          self.logEvent('login.canceled');
          // if user canceled login, just stop
          return;
        } else if (self.relier.has('preVerifyToken') && AuthErrors.is(err, 'INVALID_VERIFICATION_CODE')) {
          // The token was invalid and the auth server could not pre-verify
          // the user. Now, just create a new user and force them to verify
          // their email.
          self.relier.unset('preVerifyToken');
          return self._createAccount();
        }

        // re-throw error, it will be handled at a lower level.
        throw err;
      });
    },

    onUserYearSelect: function() {
      userAge.year = parseInt(this._getYear(), 10);
      if (userAge.year === CUTOFF_AGE.year) {
        this._toggleDatePicker(); 
      }
    },

    onUserMonthSelect: function() {
      userAge.month = parseInt(this._getMonth(), 10);
      var days = this._daysInMonth(userAge.year, userAge.month);
      var datePickerEl = this.$('#fxa-age-date');

      if (isNaN(userAge.month)) {
        this._disableDatePicker(datePickerEl);
        userAge.date = 'none';
      } else {
        this._enableDatePicker(datePickerEl);
      }

      this._updateDatePickerValues(datePickerEl, days);
      
      if (this._isDateValidOnMonthChange(days)) {
        datePickerEl.val(userAge.date);
      }
    },

    onUserDateSelect: function() {
      userAge.date = parseInt(this._getDate(), 10); 
    },

    //if the user changes from march to february (or similar),
    //we need to reset out-of-bounds dates, or keep in-bounds dates
    _isDateValidOnMonthChange: function(days) {
      if (typeof userAge.date === 'number') {
        return userAge.date <= days;
      }
    },

    _disableDatePicker: function(datePickerEl) {
      datePickerEl.attr('disabled', 'true');
      datePickerEl.parent().addClass('disabled');
    },

    _enableDatePicker: function(datePickerEl) {
      datePickerEl.removeAttr('disabled');
      datePickerEl.parent().removeClass('disabled');
    },

    _updateDatePickerValues: function(datePickerEl, days) {
      var defaultValue = datePickerEl.children(':eq(0)');
      datePickerEl.empty();
      datePickerEl.append(defaultValue);
      for (var i = 1; i <= days; i++) {
        datePickerEl.append('<option id="fxa-day-' + i + 'value="' + i + ' " >' + i + ' </option>');
      }
    },

    _daysInMonth: function(year, month) {
      return new Date(year, month, 0).getDate();
    },

    _toggleDatePicker: function() {
      this.$('#year-picker').addClass('hidden');
      this.$('#month-date-picker').removeClass('hidden').find("#fxa-age-month").focus();
    },

    onSignUpSuccess: function(accountData) {
      // user was pre-verified, just send them to the signup complete screen.
      if (accountData.verified) {
        this.navigate('signup_complete');
      } else {
        this.navigate('confirm');
      }
    },

    _suggestSignIn: function (err) {
      err.forceMessage = t('Account already exists. <a href="/signin">Sign in</a>');
      return this.displayErrorUnsafe(err);
    },

    _selectPrefillYear: function () {
      if (Session.prefillYear) {
        this.$('#fxa-' + Session.prefillYear).attr('selected', 'selected');
      }
    }
  });

  _.extend(View.prototype, PasswordMixin);
  _.extend(View.prototype, ServiceMixin);

  return View;
});
