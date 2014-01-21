/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'backbone',
  'jquery'
],
function(_, Backbone, jQuery) {
  var ENTER_BUTTON_CODE = 13;

  var BaseView = Backbone.View.extend({
    constructor: function(options) {
      options = options || {};

      this.subviews = [];
      this.translator = options.translator || window.translator;

      Backbone.View.call(this, options);
    },

    render: function() {
      if (! this.beforeRender()) {
        return false;
      }

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
      // Implement in subclasses. If returns false, then the view is not
      // rendered. Useful if the view must immediately redirect to another
      // view.
      return true;
    },

    afterRender: function() {
      // Implement in subclasses
    },

    // called after the view is visible.
    afterVisible: function() {
      // make a huge assumption and say if the device does not have touch,
      // it's a desktop device and autofocus can be applied without
      // hiding part of the screen. The no-touch class is added by modernizr
      if (jQuery('html').hasClass('no-touch')) {
        try {
          this.$('[autofocus]').get(0).focus();
        } catch (e) {
          // IE can blow up if the element is not visible.
        }
      }
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

    enableButtonWhenValid: function() {
      var enabled = this.isValid && this.isValid();

      this.$('button[type="submit"]').attr('disabled', !enabled);
    },

    isElementValid: function (selector) {
      var el = this.$(selector);
      var value = el.val();
      return value && el[0].validity.valid;
    },

    displayError: function(msg) {
      this.$('.spinner').hide();
      this.$('.error').text(this.translator.get(msg));
    },

    back: function (event) {
      if (event) {
        event.preventDefault();
      }

      window.history.back();
    },

    backOnEnter: function (event) {
      if (event.which === ENTER_BUTTON_CODE) {
        window.history.back();
      }
    }
  });

  return BaseView;
});
