/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'jquery',
  'backbone',
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

  function showView(View, options) {
    return function () {
      this.showView(new View(options || {}));
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
      'legal/terms': showView(TosView),
      'legal/privacy': showView(PpView),
      'cannot_create_account': showView(CannotCreateAccountView),
      'verify_email': showView(CompleteSignUpView),
      'reset_password': showView(ResetPasswordView),
      'confirm_reset_password': showView(ConfirmResetPasswordView),
      'complete_reset_password': showView(CompleteResetPasswordView),
      'reset_password_complete': showView(ResetPasswordCompleteView),
      'force_auth': showView(SignInView, { forceAuth: true })
    },

    initialize: function (options) {
      options = options || {};

      this.window = options.window || window;

      this.$stage = $('#stage');

      this.watchAnchors();
    },

    navigate: function (url) {
      // Only add search parameters if they do not already exist.
      // Search parameters are added to the URLs because they are sometimes
      // used to pass state from the browser to the screens. Perhaps we should
      // take the search parameters on startup, toss them into Session, and
      // forget about this malarky?
      if (! /\?/.test(url)) {
        url = url + this.window.location.search;
      }

      return Backbone.Router.prototype.navigate.call(
                            this, url, { trigger: true });
    },

    redirectToSignup: function () {
      this.navigate('/signup');
    },

    showView: function (view) {
      if (this.currentView) {
        this.currentView.destroy();
      }

      this.currentView = view;

      // render will return false if the view could not be
      // rendered for any reason, including if the view was
      // automatically redirected.
      if (this.currentView.render()) {
        // Render the new view
        this.$stage.html(this.currentView.el);

        // explicitly set the display: block using .css. When embedded
        // in about:accounts, the content is not yet visible and show will
        // not display the element.
        this.$stage.css('display', 'block');
        this.currentView.afterVisible();
      }
    },

    watchAnchors: function () {
      var self = this;
      $(document).on('click', 'a[href^="/"]', function (event) {
        if (!event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
          event.preventDefault();

          // Remove leading slashes
          var url = $(event.target).attr('href').replace(/^\//, '');

          // Instruct Backbone to trigger routing events
          self.navigate(url);
        }
      });
    }
  });

  return Router;
});
