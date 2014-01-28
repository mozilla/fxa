/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'backbone',
  'jquery',
  'lib/session'
],
function (_, Backbone, jQuery, Session) {
  var ENTER_BUTTON_CODE = 13;

  var BaseView = Backbone.View.extend({
    constructor: function (options) {
      options = options || {};

      this.subviews = [];
      this.translator = options.translator || window.translator;
      this.router = options.router || window.router;

      Backbone.View.call(this, options);
    },

    render: function () {
      // If the user must be authenticated and they are not, send
      // them to the signin screen.
      if (this.mustAuth && ! Session.sessionToken) {
        this.navigate('signin');
        return false;
      }

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

      ctx.t = _.bind(this.translate, this);

      return ctx;
    },

    translate: function () {
      var self = this;
      return function (text) {
        return translator.get(text, self.getContext());
      };
    },

    context: function () {
      // Implement in subclasses
    },

    beforeRender: function () {
      // Implement in subclasses. If returns false, then the view is not
      // rendered. Useful if the view must immediately redirect to another
      // view.
      return true;
    },

    afterRender: function () {
      // Implement in subclasses
    },

    // called after the view is visible.
    afterVisible: function () {
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

    assign: function (view, selector) {
      view.setElement(this.$(selector));
      view.render();
    },

    destroy: function (remove) {
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

    trackSubview: function (view) {
      if (!_.contains(this.subviews, view)) {
        this.subviews.push(view);
      }

      return view;
    },

    destroySubviews: function () {
      _.invoke(this.subviews, 'destroy');

      this.subviews = [];
    },

    enableButtonWhenValid: function () {
      var enabled = this.isValid && this.isValid();

      this.$('button[type="submit"]').attr('disabled', !enabled);
    },

    isElementValid: function (selector) {
      var el = this.$(selector);
      var value = el.val();
      return value && el[0].validity.valid;
    },

    displayError: function (msg) {
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
    },

    /**
     * navigate to another screen
     */
    navigate: function (page) {
      this.router.navigate(page, { trigger: true });
    }
  });

  /**
   * Return a backbone compatible event handler that
   * prevents the default action, then calls the specified handler.
   * @method Baseview.preventDefaultThen
   * handler can be either a string or a function. If a string, this[handler]
   * will be called. Handler called with context of "this" view and is passed
   * the event
   */
  BaseView.preventDefaultThen = function (handler) {
    return function (event) {
      event.preventDefault();

      // convert a name to a function.
      if (typeof handler === 'string') {
        handler = this[handler];

        if (typeof handler !== 'function') {
          console.warn(handler +
                ' is an invalid function name to use with preventDefaultThen');
        }
      }

      if (typeof handler === 'function') {
        return handler.call(this, event);
      }
    };
  };

  return BaseView;
});
