/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
    },

    isElementValid: function (selector) {
      var el = this.$(selector);
      var value = el.val();
      return value && el[0].validity.valid;
    },

    displayError: function(msg) {
      // TODO - run the error message through the translator
      this.$('.error').html(msg);
    }
  });

  return BaseView;
});
