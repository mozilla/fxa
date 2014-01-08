/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'jquery',
  'backbone',
  'views/intro',
  'views/sign_in',
  'views/sign_up',
  'views/confirm',
  'views/settings',
  'views/tos',
  'views/pp',
  'views/age',
  'views/birthday',
  'views/create_account',
  'views/cannot_create_account',
  'views/complete_sign_up',
  'views/reset_password',
  'views/confirm_reset_password',
  'views/complete_reset_password',
  'views/reset_password_complete',
  'transit'
],
function ($, Backbone, IntroView, SignInView, SignUpView, ConfirmView, SettingsView, TosView, PpView, AgeView, BirthdayView, CreateAccountView, CannotCreateAccountView, CompleteSignUpView, ResetPasswordView, ConfirmResetPasswordView, CompleteResetPasswordView, ResetPasswordCompleteView) {
  var Router = Backbone.Router.extend({
    routes: {
      '': 'showIntro',
      'signin': 'showSignIn',
      'signup': 'showSignUp',
      'confirm': 'showConfirm',
      'settings': 'showSettings',
      'tos': 'showTos',
      'pp': 'showPp',
      'age': 'showAge',
      'birthday': 'showBirthday',
      'create_account': 'showCreateAccount',
      'cannot_create_account': 'showCannotCreateAccount',
      'verify_email': 'showCompleteSignUp',
      'reset_password': 'showResetPassword',
      'confirm_reset_password': 'showConfirmResetPassword',
      'complete_reset_password': 'showCompleteResetPassword',
      'reset_password_complete': 'showResetPasswordComplete'
    },

    initialize: function () {
      this.$stage = $('#stage');

      this.watchAnchors();
    },

    showIntro: function () {
      this.showView(new IntroView());

      // TODO - can this go into the IntroView or into CSS?
      this.$stage.css({ scale: 0.6, opacity: 0 }).transition({ scale: 1, opacity: 1 }, 1500);
    },

    showSignIn: function () {
      this.showView(new SignInView());
    },

    showSignUp: function () {
      this.showView(new SignUpView());
    },

    showConfirm: function () {
      this.showView(new ConfirmView());
    },

    showSettings: function () {
      this.showView(new SettingsView());
    },

    showTos: function () {
      this.showView(new TosView());
    },

    showPp: function () {
      this.showView(new PpView());
    },

    showAge: function () {
      this.showView(new AgeView());
    },

    showBirthday: function () {
      this.showView(new BirthdayView());
    },

    showCreateAccount: function () {
      this.showView(new CreateAccountView());
    },

    showCannotCreateAccount: function () {
      this.showView(new CannotCreateAccountView());
    },

    showCompleteSignUp: function () {
      this.showView(new CompleteSignUpView());
    },

    showResetPassword: function () {
      this.showView(new ResetPasswordView());
    },

    showConfirmResetPassword: function () {
      this.showView(new ConfirmResetPasswordView());
    },

    showCompleteResetPassword: function () {
      this.showView(new CompleteResetPasswordView());
    },

    showResetPasswordComplete: function () {
      this.showView(new ResetPasswordCompleteView());
    },

    showView: function (view) {
      if (this.currentView) {
        this.currentView.destroy();
      }

      this.currentView = view;

      this.$stage.html(this.currentView.render().el);
    },

    watchAnchors: function () {
      $(document).on('click', 'a[href^="/"]', function (event) {
        if (!event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
          event.preventDefault();

          // Remove leading slashes
          var url = $(event.target).attr('href').replace(/^\//, '');

          // Instruct Backbone to trigger routing events
          this.navigate(url, { trigger: true });
        }

      }.bind(this));
    }
  });

  return Router;
});
