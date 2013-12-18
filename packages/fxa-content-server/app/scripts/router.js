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
  'transit'
],
function($, Backbone, IntroView, SignInView, SignUpView, ConfirmView, SettingsView, TosView, PpView) {
  var Router = Backbone.Router.extend({
    routes: {
      '': 'showIntro',
      'signin': 'showSignIn',
      'signup': 'showSignUp',
      'confirm': 'showConfirm',
      'settings': 'showSettings',
      'tos': 'showTos',
      'pp': 'showPp'
    },

    initialize: function() {
      this.$stage = $('#stage');

      this.watchAnchors();
    },

    showIntro: function() {
      this.switch(new IntroView());

      // TODO - can this go into the IntroView or into CSS?
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

    showTos: function() {
      this.switch(new TosView());
    },

    showPp: function() {
      this.switch(new PpView());
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
