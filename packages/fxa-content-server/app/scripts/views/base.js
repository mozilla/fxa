/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'backbone',
  'jquery',
  'lib/promise',
  'lib/session',
  'lib/auth-errors',
  'lib/url',
  'lib/strings',
  'lib/ephemeral-messages',
  'lib/null-metrics',
  'views/mixins/timer-mixin'
],
function (_, Backbone, $, p, Session, AuthErrors,
      Url, Strings, EphemeralMessages, NullMetrics, TimerMixin) {
  var ENTER_BUTTON_CODE = 13;
  var DEFAULT_TITLE = window.document.title;
  var EPHEMERAL_MESSAGE_ANIMATION_MS = 150;

  // Share one ephemeral messages across all views. View can be
  // intialized with an ephemeralMessages for testing.
  var ephemeralMessages = new EphemeralMessages();

  // A null metrics instance is created for unit tests. In the app,
  // when a view is initialized, an initialized Metrics instance
  // is passed in to the contstructor.
  var nullMetrics = new NullMetrics();

  function displaySuccess(displayStrategy, msg) {
    /*jshint validthis: true*/
    this.hideError();

    if (msg) {
      this.$('.success')[displayStrategy](this.translator.get(msg));
    }

    this.$('.success').slideDown(EPHEMERAL_MESSAGE_ANIMATION_MS);
    this.trigger('success', msg);
    this._isSuccessVisible = true;
  }

  function displayError(displayStrategy, err) {
    /*jshint validthis: true*/
    this.hideSuccess();

    err = this._normalizeError(err);

    this.logError(err);
    var translated = this.translateError(err);

    if (translated) {
      this.$('.error')[displayStrategy](translated);
    }

    this.$('.error').slideDown(EPHEMERAL_MESSAGE_ANIMATION_MS);
    this.trigger('error', translated);

    this._isErrorVisible = true;

    return translated;
  }

  var BaseView = Backbone.View.extend({
    constructor: function (options) {
      options = options || {};

      this.subviews = [];
      this.window = options.window || window;
      this.navigator = options.navigator || this.window.navigator || navigator;
      this.translator = options.translator || this.window.translator;
      this.router = options.router || this.window.router;
      this.ephemeralMessages = options.ephemeralMessages || ephemeralMessages;
      this.metrics = options.metrics || nullMetrics;
      this.relier = options.relier;
      this.broker = options.broker;

      this.fxaClient = options.fxaClient;
      this.profileClient = options.profileClient;

      this.automatedBrowser = !!this.searchParam('automatedBrowser');

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
            var err = AuthErrors.toError('SESSION_EXPIRED');
            self.navigate('signin', {
              error: err
            });
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
            self.showEphemeralMessages();
            self.setTitleFromView();

            return true;
          });
        });
    },

    showEphemeralMessages: function () {
      var success = this.ephemeralMessages.get('success');
      if (success) {
        this.displaySuccess(success);
      }

      var successUnsafe = this.ephemeralMessages.get('successUnsafe');
      if (successUnsafe) {
        this.displaySuccessUnsafe(successUnsafe);
      }

      var error = this.ephemeralMessages.get('error');
      if (error) {
        this.displayError(error);
      }
    },

    /**
     * Checks if the user is authorized to view the page. Currently
     * the only check is if the user is signed in and the page requires
     * authentication, but this could be extended to other types of
     * authorization as well.
     */
    isUserAuthorized: function () {
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
      // hiding part of the screen. The no-touch class is added by env-test
      if ($('html').hasClass('no-touch')) {
        var autofocusEl = this.$('[autofocus]');
        if (! autofocusEl.length) {
          return;
        }

        var self = this;
        var attemptFocus = function () {
          if (autofocusEl.is(':focus')) {
            return;
          }
          self.focus(autofocusEl);

          // only elements that are visible can be focused. When embedded in
          // about:accounts, the content is hidden when the first "focus" is
          // done. Keep trying to focus until the element is actually focused,
          // and then stop trying.
          if (! autofocusEl.is(':visible')) {
            self.setTimeout(attemptFocus, 50);
          }
        };

        attemptFocus();
      }
    },

    assign: function (view, selector) {
      view.setElement(this.$(selector));
      view.render();
    },

    destroy: function (remove) {
      this.trigger('destroy');

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
    displaySuccess: _.partial(displaySuccess, 'text'),

    /**
     * Display a success message
     * @method displaySuccess
     * If msg is not given, the contents of the .success element's HTML
     * will not be updated.
     */
    displaySuccessUnsafe: _.partial(displaySuccess, 'html'),

    hideSuccess: function () {
      this.$('.success').slideUp(EPHEMERAL_MESSAGE_ANIMATION_MS);
      this._isSuccessVisible = false;
    },

    /**
     * Return true if the success message is visible
     */
    isSuccessVisible: function () {
      return !!this._isSuccessVisible;
    },

    /**
     * Return the error module that produced the error, based on the error's
     * namespace.
     */
    _errorContext: function (err) {
      if (err && err.errorContext) {
        return err.errorContext;
      } else {
        return AuthErrors;
      }
    },

    /**
     * Display an error message.
     * @method translateError
     * @param {string} err - an error object
     *
     * @return {string} translated error text (if available), untranslated
     *   error text otw.
     */
    translateError: function (err) {
      var errors = this._errorContext(err);

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
     *
     * @return {string} translated error text (if available), untranslated
     *   error text otw.
     */
    displayError: _.partial(displayError, 'text'),

    /**
     * Display an error message that may contain HTML. Marked unsafe
     * because msg could contain XSS. Use with caution and never
     * with unsanitized user generated content.
     *
     * @method displayErrorUnsafe
     * @param {string} err - If err is not given, the contents of the
     *   `.error` element's text will not be updated.
     *
     * @return {string} translated error text (if available), untranslated
     *   error text otw.
     */
    displayErrorUnsafe: _.partial(displayError, 'html'),

    /**
     * Log an error to the event stream
     */
    logError: function (err) {
      err = this._normalizeError(err);

      // The error could already be logged, if so, abort mission.
      // This can occur when `navigate` redirects a user to a different
      // screen and an error is passed. The error is logged before the screen
      // transition, the new screen is rendered, then the original error is
      // displayed. This avoids duplicate entries.
      if (err.logged) {
        return;
      }
      err.logged = true;

      if (typeof console !== 'undefined' && console) {
        console.error(err.message);
      }

      this.metrics.logError(err);
    },

    getScreenName: function () {
      var screenName = Url.pathToScreenName(this.window.location.pathname);
      return screenName;
    },

    _normalizeError: function (err) {
      var errors = this._errorContext(err);
      if (! err) {
        // likely an error in logic, display an unexpected error to the
        // user and show a console trace to help us debug.
        err = errors.toError('UNEXPECTED_ERROR');

        if (this.window.console && this.window.console.trace) {
          this.window.console.trace();
        }
      }

      if (typeof err === 'string') {
        err = new Error(err);
      }

      if (! err.context) {
        err.context = this.getScreenName();
      }

      return err;
    },

    /**
     * Log the current screen
     */
    logScreen: function () {
      this.metrics.logScreen(this.getScreenName());
    },

    /**
     * Log an event to the event stream
     */
    logEvent: function (eventName) {
      this.metrics.logEvent(eventName);
    },

    /**
     * Log an event with the screen name as a prefix
     */
    logScreenEvent: function (eventName) {
      var event = Strings.interpolate('%(screenName)s.%(eventName)s', {
        screenName: this.getScreenName(),
        eventName: eventName
      });

      this.metrics.logEvent(event);
    },

    hideError: function () {
      this.$('.error').slideUp(EPHEMERAL_MESSAGE_ANIMATION_MS);
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
    navigate: function (page, options) {
      options = options || {};
      if (options.success) {
        this.ephemeralMessages.set('success', options.success);
      }
      if (options.successUnsafe) {
        this.ephemeralMessages.set('successUnsafe', options.successUnsafe);
      }

      if (options.error) {
        // log the error entry before the new screen is rendered so events
        // stay in the correct order.
        this.logError(options.error);
        this.ephemeralMessages.set('error', options.error);
      }

      this.router.navigate(page, { trigger: true });
    },

    /**
     * Safely focus an element
     */
    focus: function (which) {
      try {
        var focusEl = this.$(which);
        // place the cursor at the end of the input when the
        // element is focused.
        focusEl.one('focus', function () {
          try {
            this.selectionStart = this.selectionEnd = this.value.length;
          } catch (e) {
            // This can blow up on password fields in Chrome. Drop the error on
            // the ground, for whatever reason, it still behaves as we expect.
          }
        });
        focusEl.get(0).focus();
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
     * @param {string || function} handler.
     */
    invokeHandler: function (handler/*, args...*/) {
      // convert a name to a function.
      if (typeof handler === 'string') {
        handler = this[handler];

        if (typeof handler !== 'function') {
          throw new Error(handler + ' is an invalid function name');
        }
      }

      if (typeof handler === 'function') {
        var args = [].slice.call(arguments, 1);

        // If an `arguments` type object was passed in as the first item,
        // then use that as the arguments list. Otherwise, use all arguments.
        if (_.isArguments(args[0])) {
          args = args[0];
        }

        return handler.apply(this, args);
      }
    },

    /**
     * Fetch a search parameter from this.window.location.search
     */
    searchParam: function (itemName) {
      return Url.searchParam(itemName, this.window.location.search);
    },

    /**
     * Import an item from the URL search parameters into the current context
     */
    importSearchParam: function (itemName) {
      this[itemName] = this.searchParam(itemName);

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
      if (event) {
        event.preventDefault();
      }

      var args = [].slice.call(arguments, 0);
      args.unshift(handler);
      return this.invokeHandler.apply(this, args);
    };
  };

  /**
   * Completely cancel an event (preventDefault, stopPropagation), then call
   * the handler
   * @method BaseView.cancelEventThen
   */
  BaseView.cancelEventThen = function (handler) {
    return function (event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      var args = [].slice.call(arguments, 0);
      args.unshift(handler);
      return this.invokeHandler.apply(this, args);
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

  _.extend(BaseView.prototype, TimerMixin);

  return BaseView;
});
