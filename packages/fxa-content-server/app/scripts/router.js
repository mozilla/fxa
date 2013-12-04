'use strict';

define(
  [
    'jquery',
    'backbone',
    'views/intro'
  ],
  function($, Backbone, IntroView) {
    var Router = Backbone.Router.extend({
      routes: {
        '': 'showIntro'
      },

      initialize: function() {
        this.$stage = $('#stage');
      },

      showIntro: function() {
        this.switch(new IntroView());
      },

      switch: function(view) {
        if (this.currentView) {
          this.currentView.destroy();
        }

        this.currentView = view;

        this.$stage.html(this.currentView.render().el);
      }
    });

    // Singleton
    return new Router();
  }
);
