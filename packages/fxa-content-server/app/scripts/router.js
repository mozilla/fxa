/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'jquery',
  'backbone',
  'underscore',
  'views/sign_in',
  'views/sign_up',
  'views/confirm',
  'views/tos',
  'views/pp',
  'views/cannot_create_account',
  'views/complete_sign_up',
  'views/reset_password',
  'views/confirm_reset_password',
  'views/complete_reset_password',
  'views/reset_password_complete',
  'views/settings',
  'views/change_password',
  'views/delete_account',
  'transit'
],
function (
  $,
  Backbone,
  _,
  SignInView,
  SignUpView,
  ConfirmView,
  TosView,
  PpView,
  CannotCreateAccountView,
  CompleteSignUpView,
  ResetPasswordView,
  ConfirmResetPasswordView,
  CompleteResetPasswordView,
  ResetPasswordCompleteView,
  SettingsView,
  ChangePasswordView,
  DeleteAccountView
) {
  function showView(View) {
    return function () {
      this.showView(new View());
    };
  }

  var Router = Backbone.Router.extend({
    routes: {
      '': 'redirectToSignup',
      'signin': showView(SignInView),
      'signup': showView(SignUpView),
      'confirm': showView(ConfirmView),
      'settings': showView(SettingsView),
      'change_password': showView(ChangePasswordView),
      'delete_account': showView(DeleteAccountView),
      'tos': showView(TosView),
      'pp': showView(PpView),
      'cannot_create_account': showView(CannotCreateAccountView),
      'verify_email': showView(CompleteSignUpView),
      'reset_password': showView(ResetPasswordView),
      'confirm_reset_password': showView(ConfirmResetPasswordView),
      'complete_reset_password': showView(CompleteResetPasswordView),
      'reset_password_complete': showView(ResetPasswordCompleteView)
    },

    initialize: function () {
      this.$stage = $('#stage');

      this.watchAnchors();
    },

    redirectToSignup: function () {
      this.navigate('/signup', { trigger: true });
    },

    showView: function (view) {
      if (this.currentView) {
        this.currentView.destroy();
      }

      this.currentView = view;

      // Make the stage transparent
      this.$stage.css({ opacity: 0 });

      // render will return false if the view could not be
      // rendered for any reason, including if the view was
      // automatically redirected.
      if (this.currentView.render()) {
        // Render the new view
        this.$stage.html(this.currentView.el);

        // Fade the stage back in
        this.$stage.transition({ opacity: 100 },
          _.bind(this.currentView.afterVisible, this.currentView));
      }
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
