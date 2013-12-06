'use strict';

define([
  'jquery',
  'backbone',
  'views/intro',
  'views/sign_in',
  'views/sign_up',
  'views/confirm',
  'views/settings',
  'transit'
],
function($, Backbone, IntroView, SignInView, SignUpView, ConfirmView, SettingsView) {
  var Router = Backbone.Router.extend({
    routes: {
      '': 'showIntro',
      'signin': 'showSignIn',
      'signup': 'showSignUp',
      'confirm': 'showConfirm',
      'settings': 'showSettings'
    },

    initialize: function() {
      this.$stage = $('#stage');

      this.watchAnchors();
    },

    showIntro: function() {
      this.switch(new IntroView());

      this.$stage.css({ scale: 0.6, opacity: 0 }).transition({ scale: 1, opacity: 1 }, 1500);
    },

    showSignIn: function() {
      this.switch(new SignInView());
    },

    showSignUp: function() {
      this.switch(new SignUpView());
    },

    showConfirm: function() {
      this.switch(new ConfirmView());
    },

    showSettings: function() {
      this.switch(new SettingsView());
    },

    switch: function(view) {
      if (this.currentView) {
        this.currentView.destroy();
      }

      this.currentView = view;

      this.$stage.html(this.currentView.render().el);
    },

    watchAnchors: function() {
      $(document).on('click', 'a[href^="/"]', function(event) {
        if (!event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
          event.preventDefault();

          // Remove leading slashes
          var url = $(event.target).attr('href').replace(/^\//,'');

          // Instruct Backbone to trigger routing events
          this.navigate(url, { trigger: true });
        }

      }.bind(this));
    }
  });

  return Router;
});
