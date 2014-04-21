/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'backbone',
  'jquery',
  'p-promise',
  'lib/session',
  'lib/auth-errors',
  'lib/fxa-client',
  'lib/url',
  'lib/strings'
],
function (_, Backbone, jQuery, p, Session, authErrors, FxaClient, Url, Strings) {
  var ENTER_BUTTON_CODE = 13;
  var DEFAULT_TITLE = window.document.title;

  var BaseView = Backbone.View.extend({
    constructor: function (options) {
      options = options || {};

      this.subviews = [];
      this.window = options.window || window;
      this.translator = options.translator || this.window.translator;
      this.router = options.router || this.window.router;

      this.fxaClient = new FxaClient();

      Backbone.View.call(this, options);
    },

    /**
     * Render the view - Rendering is done asynchronously.
     *
     * Two functions can be overridden to perform data validation:
     * * beforeRender - called before rendering occurs. Can be used
     *   to perform data validation. Return a promise to
     *   perform an asynchronous check. Return false or a promise
     *   that resolves to false to prevent rendering.
     * * afterRender - called after the rendering occurs. Can be used
     *   to print an error message after the view is already rendered.
     */
    render: function () {
      var self = this;
      return p()
        .then(function () {
          return self.isUserAuthorized();
        })
        .then(function (isUserAuthorized) {
          if (! isUserAuthorized) {
            // user is not authorized, make them sign in.
            self.navigate('signin', true);
            return false;
          }

          return self.beforeRender();
        })
        .then(function (shouldRender) {
          // rendering is opt out.
          if (shouldRender === false) {
            return false;
          }

          return p().then(function () {
            self.destroySubviews();

            self.$el.html(self.template(self.getContext()));
          })
          .then(_.bind(self.afterRender, self))
          .then(function () {
            self.setTitleFromView();

            return true;
          });
        });
    },

    /**
     * Checks if the user is authorized to view the page. Currently
     * the only check is if the user is signed in and the page requires
     * authentication, but this could be extended to other types of
     * authorization as well.
     */
    isUserAuthorized: function() {
      if (this.mustAuth) {
        return this.fxaClient.isSignedIn(Session.sessionToken);
      }
      return true;
    },

    setTitleFromView: function () {
      var title = DEFAULT_TITLE;
      var titleText = this.$('h1').text();
      var subText = this.$('h2').text();

      if (titleText && subText) {
        title = titleText + ': ' + subText;
      } else if (titleText) {
        title = titleText;
      }

      this.window.document.title = title;
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
      // Implement in subclasses. If returns false, or if returns a promise
      // that resolves to false, then the view is not rendered.
      // Useful if the view must immediately redirect to another view.
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
      this.trigger('destroyed');
    },

    trackSubview: function (view) {
      if (!_.contains(this.subviews, view)) {
        this.subviews.push(view);
        view.on('destroyed', _.bind(this.untrackSubview, this, view));
      }

      return view;
    },

    untrackSubview: function (view) {
      this.subviews = _.without(this.subviews, view);

      return view;
    },

    destroySubviews: function () {
      _.invoke(this.subviews, 'destroy');

      this.subviews = [];
    },

    isSubviewTracked: function (view) {
      return _.indexOf(this.subviews, view) > -1;
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
     * Display an error message.
     * @method translateError
     * @param {string} err - an error object
     * @param {object} errors - optional Errors object that transforms codes into messages
     *
     * @return {string} translated error text (if available), untranslated
     *   error text otw.
     */
    translateError: function (err, errors) {
      errors = errors || authErrors;

      var msg = errors.toMessage(err);
      var context = errors.toContext(err);
      var translated = this.translator.get(msg, context);

      return translated;
    },

    /**
     * Display an error message.
     * @method displayError
     * @param {string} err - If err is not given, the contents of the
     *   `.error` element's text will not be updated.
     * @param {object} errors - optional Errors object that transforms codes into messages
     *
     * @return {string} translated error text (if available), untranslated
     *   error text otw.
     */
    displayError: function (err, errors) {
      this.hideSuccess();
      this.$('.spinner').hide();

      var translated = this.translateError(err, errors);

      if (translated) {
        this.$('.error').text(translated);
      }

      this.$('.error').show();
      this.trigger('error', translated);

      this._isErrorVisible = true;

      return translated;
    },

    /**
     * Display an error message that may contain HTML. Marked unsafe
     * because msg could contain XSS. Use with caution and never
     * with unsanitized user generated content.
     *
     * @method displayErrorUnsafe
     * @param {string} err - If err is not given, the contents of the
     *   `.error` element's text will not be updated.
     * @param {object} errors - optional Errors object that transforms codes into messages
     *
     * @return {string} translated error text (if available), untranslated
     *   error text otw.
     */
    displayErrorUnsafe: function (err, errors) {
      this.hideSuccess();
      this.$('.spinner').hide();

      var translated = this.translateError(err, errors);

      if (translated) {
        this.$('.error').html(translated);
      }

      this.$('.error').show();
      this.trigger('error', translated);

      this._isErrorVisible = true;

      return translated;
    },

    hideError: function () {
      this.$('.error').hide();
      this._isErrorVisible = false;
    },

    isErrorVisible: function () {
      return !!this._isErrorVisible;
    },

    back: function (event) {
      if (event) {
        event.preventDefault();
      }

      this.window.history.back();
    },

    backOnEnter: function (event) {
      if (event.which === ENTER_BUTTON_CODE) {
        this.window.history.back();
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
    },

    /**
     * Invoke the specified handler with the given event. Handler
     * can either be a function or a string. If a string, looks for
     * the handler on `this`.
     *
     * @method invokeHandler
     */
    invokeHandler: function (handler, event) {
      // convert a name to a function.
      if (typeof handler === 'string') {
        handler = this[handler];

        if (typeof handler !== 'function') {
          console.warn(handler + ' is an invalid function name');
        }
      }

      if (typeof handler === 'function') {
        return handler.call(this, event);
      }
    },

    /**
     * Import an item from the URL search parameters into the current context
     */
    importSearchParam: function (itemName) {
      var search = this.window.location.search;
      this[itemName] = Url.searchParam(itemName, search);

      if (! this[itemName]) {
        var err = Strings.interpolate(t('missing search parameter: %(itemName)s'), { itemName: itemName });
        throw new Error(err);
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
      return this.invokeHandler(handler, event);
    };
  };

  /**
   * t is a wrapper that is used for string extraction. The extraction
   * script looks for t(...), and the translator will eventually
   * translate it. t is put onto BaseView instead of
   * Translator to reduce the number of dependencies in the views.
   */
  function t(str) {
    return str;
  }

  BaseView.t = t;

  return BaseView;
});
