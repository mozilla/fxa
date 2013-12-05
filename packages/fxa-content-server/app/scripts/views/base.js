'use strict';

define([
  'underscore',
  'backbone'
],
function(_, Backbone) {
  var BaseView = Backbone.View.extend({
    constructor: function(options) {
      this.subviews = [];

      Backbone.View.call(this, options);
    },

    render: function() {
      this.beforeRender();

      this.destroySubviews();

      this.$el.html(this.template(this.getContext()));

      this.afterRender();

      return this;
    },

    getContext: function () {
      var ctx = this.context() || {};

      ctx.t = this.translate;

      return ctx;
    },

    translate: function() {
      return function(text) {
        return translator.get(text);
      };
    },

    context: function() {
      // Implement in subclasses
    },

    beforeRender: function() {
      // Implement in subclasses
    },

    afterRender: function() {
      // Implement in subclasses
    },

    assign: function(view, selector) {
      view.setElement(this.$(selector));
      view.render();
    },

    destroy: function(remove) {
      if (this.beforeDestroy) {
        this.beforeDestroy();
      }

      if (remove) {
        this.remove();
      } else {
        this.stopListening();
        this.$el.off();
      }

      this.destroySubviews();
    },

    trackSubview: function(view) {
      if (!_.contains(this.subviews, view)) {
        this.subviews.push(view);
      }

      return view;
    },

    destroySubviews: function() {
      _.invoke(this.subviews, 'destroy');

      this.subviews = [];
    }
  });

  return BaseView;
});
