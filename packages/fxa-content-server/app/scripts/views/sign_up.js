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

  // If COPPA says 13, why 14 here? To make UX simpler, we only ask
  // for their year of birth, we do not ask for month and day.
  // To make this safe and ensure we do not let *any* 12 year olds pass,
  // we are saying that it is acceptable for some 13 year olds to be
  // caught in the snare.
  // This is written on 2014-01-16. 13 years ago is 2001-01-16. Somebody born
  // in 2001-01-15 is now 13. Somebody born 2001-01-17 is still only 12.
  // To avoid letting the 12 year old in, add an extra year.
  var TOO_YOUNG_YEAR = now.getFullYear() - 14;

  var View = FormView.extend({
    template: Template,
    className: 'sign-up',

    initialize: function (options) {
      options = options || {};

      var relier = options.relier;

      // preVerifyToken is an opaque token that indicates to the auth server
      // that a user has already been verified and they can skip verification.
      this._preVerifyToken = relier && relier.get('preVerifyToken');

      // Reset forceAuth flag so users who visit the reset_password screen
      // see the correct links.
      Session.set('forceAuth', false);
    },

    beforeRender: function () {
      if (document.cookie.indexOf('tooyoung') > -1) {
        this.navigate('cannot_create_account');
        return p(false);
      }

      this.service = Session.service;

      var self = this;
      return p().then(function () {
        return FormView.prototype.beforeRender.call(self);
      })
      .then(function () {
        if (self.hasService() && self.isSync()) {
          return self.setServiceInfo();
        }
      });
    },

    // afterRender fucnction to handle select-row hack (issue 822)
    afterRender: function() {
      var select = this.$el.find('.select-row select');
      select.focus(function(){
        select.parent().addClass('select-focus');
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
      'keydown #fxa-age-year': 'submitOnEnter'
    },

    context: function () {
      // Session.prefillEmail comes first because users can edit the email,
      // go to another screen, edit the email again, and come back here. We
      // want the last used email.
      var email = Session.prefillEmail || this.searchParam('email');

      var autofocusEl = selectAutoFocusEl(email, Session.prefillPassword);

      return {
        service: Session.service,
        serviceName: this.serviceName,
        email: email,
        password: Session.prefillPassword,
        year: Session.prefillYear || 'none',
        isSync: this.isSync(),
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
      return this._validateYear();
    },

    showValidationErrorsEnd: function () {
      if (! this._validateYear()) {
        //next two lines deal with ff30's select list regression
        var selectRow = this.$el.find('.select-row');
        selectRow.addClass('invalid-row');

        this.showValidationError('#fxa-age-year', AuthErrors.toError('YEAR_OF_BIRTH_REQUIRED'));
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

    _getYear: function () {
      return this.$('#fxa-age-year').val();
    },

    _isUserOldEnough: function () {
      var year = parseInt(this._getYear(), 10);

      return year <= TOO_YOUNG_YEAR;
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
      var email = this.$('.email').val();
      var password = this.$('.password').val();
      var customizeSync = this.$('.customize-sync').is(':checked');
      var preVerifyToken = this._preVerifyToken;

      var self = this;
      return this.fxaClient.signUp(email, password, {
        customizeSync: customizeSync,
        preVerifyToken: preVerifyToken
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
        } else if (self._preVerifyToken && AuthErrors.is(err, 'INVALID_VERIFICATION_CODE')) {
          // The token was invalid and the auth server could not pre-verify
          // the user. Now, just create a new user and force them to verify
          // their email.
          self._preVerifyToken = null;
          return self._createAccount();
        }

        // re-throw error, it will be handled at a lower level.
        throw err;
      });
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
