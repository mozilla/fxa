/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'backbone',
  'jquery',
  'lib/session',
  'lib/auth-errors'
],
function (_, Backbone, jQuery, Session, authErrors) {
  var ENTER_BUTTON_CODE = 13;

  var BaseView = Backbone.View.extend({
    constructor: function (options) {
      options = options || {};

      this.subviews = [];
      this.window = options.window || window;
      this.translator = options.translator || this.window.translator;
      this.router = options.router || this.window.router;

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
        return self.translator.get(text, self.getContext());
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
        // only elements that are visibile can be focused. When embedded in
        // about:accounts, the content is hidden when the first "focus" is
        // done. Keep trying to focus until the element is actually focused,
        // and then stop trying.
        var autofocusEl = this.$('[autofocus]');

        var self = this;
        var attemptFocus = function () {
          if (autofocusEl.is(':focus')) {
            return;
          }
          self.focus(autofocusEl);
          setTimeout(attemptFocus, 50);
        };

        attemptFocus();
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

    /**
     * Display a success message
     * @method displaySuccess
     * If msg is not given, the contents of the .success element's text
     * will not be updated.
     */
    displaySuccess: function (msg) {
      this.hideError();

      if (msg) {
        this.$('.success').text(this.translator.get(msg));
      }

      this.$('.success').show();
      this.trigger('success', msg);
    },

    hideSuccess: function () {
      this.$('.success').hide();
    },

    /**
     * Display an error message
     * @method displayError
     * If msg is not given, the contents of the .error element's text
     * will not be updated.
     */
    displayError: function (msg) {
      this.hideSuccess();
      this.$('.spinner').hide();

      if (typeof msg === 'number') {
        msg = authErrors[msg];
      }

      if (msg) {
        this.$('.error').text(this.translator.get(msg));
      }

      this.$('.error').show();
      this.trigger('error', msg);
    },

    hideError: function () {
      this.$('.error').hide();
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
    },

    /**
     * Safely focus an element
     */
    focus: function (which) {
      try {
        this.$(which).get(0).focus();
      } catch (e) {
        // IE can blow up if the element is not visible.
      }
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

  /**
   * t is a wrapper that is used for string extraction. The extraction
   * script looks for t(...), and the translator will eventually
   * translate it. t is put onto BaseView instead of
   * Translator to reduce the number of dependencies in the views.
   */
  BaseView.t = function (str) {
    return str;
  };


  return BaseView;
});
