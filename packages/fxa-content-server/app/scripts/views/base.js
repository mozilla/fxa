/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var _ = require('underscore');
  var AuthErrors = require('lib/auth-errors');
  var Backbone = require('backbone');
  var Cocktail = require('cocktail');
  var EphemeralMessages = require('lib/ephemeral-messages');
  var NotifierMixin = require('views/mixins/notifier-mixin');
  var NullMetrics = require('lib/null-metrics');
  var p = require('lib/promise');
  var Raven = require('raven');
  var TimerMixin = require('views/mixins/timer-mixin');

  var DEFAULT_TITLE = window.document.title;
  var EPHEMERAL_MESSAGE_ANIMATION_MS = 150;

  // Share one ephemeral messages across all views. View can be
  // intialized with an ephemeralMessages for testing.
  var ephemeralMessages = new EphemeralMessages();

  // A null metrics instance is created for unit tests. In the app,
  // when a view is initialized, an initialized Metrics instance
  // is passed in to the constructor.
  var nullMetrics = new NullMetrics();

  function displaySuccess(displayStrategy, msg) {
    this.hideError();
    var $success = this.$('.success');

    if (msg) {
      $success[displayStrategy](this.translator.get(msg));
    }

    // the 'data-shown' attribute value is added so the functional tests
    // can find out if the success message was successfully shown, even
    // if the element is then hidden. In the functional tests,
    // testSuccessWasShown removes the attribute so multiple checks for the
    // element can take place in the same test.
    $success
      .slideDown(EPHEMERAL_MESSAGE_ANIMATION_MS)
      .attr('data-shown', 'true');

    this.trigger('success', msg);
    this._isSuccessVisible = true;
  }

  function displayError(displayStrategy, err) {
    // Errors are disabled on page unload to supress errors
    // caused by aborted XHR requests.
    if (! this._areErrorsEnabled) {
      console.error('Error ignored: %s', JSON.stringify(err));
      return;
    }

    this.hideSuccess();

    err = this._normalizeError(err);

    this.logError(err);
    var translated = this.translateError(err);

    var $error = this.$('.error');
    if (translated) {
      $error[displayStrategy](translated);
    }

    // the 'data-shown' attribute value is added so the functional tests
    // can find out if the error message was successfully shown, even
    // if the element is then hidden. In the functional tests,
    // testErrorWasShown removes the attribute so multiple checks for the
    // element can take place in the same test.
    $error
      .slideDown(EPHEMERAL_MESSAGE_ANIMATION_MS)
      .attr('data-shown', 'true');

    this.trigger('error', translated);

    this._isErrorVisible = true;

    return translated;
  }

  /**
   * Return the error module that produced the error, based on the error's
   * namespace.
   */
  function getErrorModule(err) {
    if (err && err.errorModule) {
      return err.errorModule;
    } else {
      return AuthErrors;
    }
  }


  var BaseView = Backbone.View.extend({
    /**
     * A class name that is added to the 'body' element pre-render
     * and removed on destroy.
     *
     * @property layoutClassName
     */
    layoutClassName: null,

    /**
     * The default view name
     *
     * @property viewName
     */
    viewName: '',

    constructor: function (options) {
      options = options || {};

      this.broker = options.broker;
      this.currentPage = options.currentPage;
      this.ephemeralMessages = options.ephemeralMessages || ephemeralMessages;
      this.fxaClient = options.fxaClient;
      this.metrics = options.metrics || nullMetrics;
      this.relier = options.relier;
      this.sentryMetrics = options.sentryMetrics || Raven;
      this.childViews = [];
      this.user = options.user;
      this.window = options.window || window;

      this.navigator = options.navigator || this.window.navigator || navigator;
      this.translator = options.translator || this.window.translator;

      /**
       * Prefer the `viewName` set on the object prototype. ChildViews
       * define their viewName on the prototype to avoid taking the
       * name of the parent view. This is a terrible hack, but workable
       * until a better solution arises. See #3029
       */
      if (! this.viewName && options.viewName) {
        this.viewName = options.viewName;
      }

      Backbone.View.call(this, options);

      // The mixin's initialize is called directly instead of the normal
      // override the `initialize` function because not all sub-classes
      // call the parent's `initialize`. w/o the call to the parent,
      // the mixin does not initialize correctly.
      NotifierMixin.initialize.call(this, options);

      // Prevent errors from being displayed by aborted XHR requests.
      this._boundDisableErrors = _.bind(this.disableErrors, this);
      $(this.window).on('beforeunload', this._boundDisableErrors);
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

      if (this.layoutClassName) {
        $('body').addClass(this.layoutClassName);
      }

      return p()
        .then(function () {
          return self._checkUserAuthorization();
        })
        .then(function (isUserAuthorized) {
          return isUserAuthorized && self.beforeRender();
        })
        .then(function (shouldRender) {
          // rendering is opt out.
          if (shouldRender === false) {
            return false;
          }

          return p().then(function () {
            self.destroyChildViews();

            // force a re-load of the context every time the
            // view is rendered or else stale data may
            // be returned.
            self._context = null;
            self.$el.html(self.template(self.getContext()));
          })
          .then(_.bind(self.afterRender, self))
          .then(function () {
            self.showEphemeralMessages();
            self.trigger('rendered');

            return true;
          });
        });
    },

    // Checks that the user's current account exists and is
    // verified. Returns either true or false.
    _checkUserAuthorization: function () {
      var self = this;

      return self.isUserAuthorized()
        .then(function (isUserAuthorized) {
          if (! isUserAuthorized) {
            // user is not authorized, make them sign in.
            var err = AuthErrors.toError('SESSION_EXPIRED');
            self.navigate(self._reAuthPage(), {
              data: { redirectTo: self.currentPage },
              error: err
            });
            return false;
          }

          if (self.mustVerify) {
            return self.isUserVerified()
              .then(function (isUserVerified) {
                if (! isUserVerified) {
                  // user is not verified, prompt them to verify.
                  self.navigate('confirm', {
                    data: {
                      account: self.getSignedInAccount()
                    }
                  });
                }

                return isUserVerified;
              });
          }

          return true;
        });
    },

    // If the user navigates to a page that requires auth and their session
    // is not currently cached, we ask them to sign in again. If the relier
    // specifies an email address, we force the user to use that account.
    _reAuthPage: function () {
      var self = this;
      if (self.relier && self.relier.get('email')) {
        return 'force_auth';
      }
      return 'signin';
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

    ephemeralData: function () {
      return this.ephemeralMessages.get('data') || {};
    },

    /**
     * Checks if the user is authorized to view the page. Currently
     * the only check is if the user is signed in and the page requires
     * authentication, but this could be extended to other types of
     * authorization as well.
     */
    isUserAuthorized: function () {
      var self = this;
      var sessionToken;

      return p()
        .then(function () {
          if (self.mustAuth || self.mustVerify) {
            sessionToken = self.getSignedInAccount().get('sessionToken');
            return !! sessionToken && self.fxaClient.isSignedIn(sessionToken);
          }
          return true;
        });
    },

    isUserVerified: function () {
      var self = this;
      var account = self.getSignedInAccount();
      // If the cached account data shows it hasn't been verified,
      // check again and update the data if it has.
      if (! account.get('verified')) {
        return account.isVerified()
          .then(function (hasVerified) {
            if (hasVerified) {
              account.set('verified', hasVerified);
              self.user.setAccount(account);
            }
            return hasVerified;
          });
      }

      return p(true);
    },

    titleFromView: function (baseTitle) {
      var title = baseTitle || DEFAULT_TITLE;
      var titleText = this.$('header:first h1').text();
      var subText = this.$('header:first h2').text();

      if (titleText && subText) {
        title = titleText + ': ' + subText;
      } else if (titleText) {
        title = titleText;
      } else if (subText) {
        title = title + ': ' + subText;
      }

      return title;
    },

    getContext: function () {
      // use cached context, if available. This prevents the context()
      // function from being called multiple times per render.
      if (! this._context) {
        this._context = this.context() || {};
      }
      var ctx = this._context;

      // `t` is a mustache helper to translate strings.
      ctx.t = this.translateInTemplate.bind(this);

      return ctx;
    },

    context: function () {
      // Implement in subclasses
    },

    /**
     * Translate a string
     *
     * @param {string} text - string to translate
     * @returns {string}
     */
    translate: function (text) {
      return this.translator.get(text, this.getContext());
    },

    /**
     * Create a function that can be used by Mustache
     * to translate a string. Useful for translate a string
     * for use in the template, which iteself depends on
     * this.getContext(). This function avoids
     * infinite recursion.
     *
     * @param {string} [text] - string to translate
     * @returns {function}
     */
    translateInTemplate: function (text) {
      if (text) {
        return this.translate.bind(this, text);
      } else {
        return this.translate.bind(this);
      }
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
      // hiding part of the view. The no-touch class is added by
      // startup-styles
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

      if (this.layoutClassName) {
        $('body').removeClass(this.layoutClassName);
      }

      this.$(this.window).off('beforeunload', this._boundDisableErrors);

      this.destroyChildViews();

      this.trigger('destroyed');
    },

    trackChildView: function (view) {
      if (! _.contains(this.childViews, view)) {
        this.childViews.push(view);
        view.on('destroyed', _.bind(this.untrackChildView, this, view));
      }

      return view;
    },

    untrackChildView: function (view) {
      this.childViews = _.without(this.childViews, view);

      return view;
    },

    destroyChildViews: function () {
      _.invoke(this.childViews, 'destroy');

      this.childViews = [];
    },

    isChildViewTracked: function (view) {
      return _.indexOf(this.childViews, view) > -1;
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
      return !! this._isSuccessVisible;
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
      var errors = getErrorModule(err);
      var translated = errors.toInterpolatedMessage(err, this.translator);

      return translated;
    },

    _areErrorsEnabled: true,
    /**
     * Disable logging and display of errors.
     *
     * @method disableErrors
     */
    disableErrors: function () {
      this._areErrorsEnabled = false;
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
      // view and an error is passed. The error is logged before the view
      // transition, the new view is rendered, then the original error is
      // displayed. This avoids duplicate entries.
      if (err.logged) {
        return;
      }
      err.logged = true;

      if (typeof console !== 'undefined' && console) {
        console.error(err.message || err);
      }
      this.sentryMetrics.captureException(err);
      this.metrics.logError(err);
    },

    /**
     * Get the view's name.
     *
     * @returns {string}
     */
    getViewName: function () {
      return this.viewName;
    },

    _normalizeError: function (err) {
      var errors = getErrorModule(err);
      if (! err) {
        // likely an error in logic, display an unexpected error to the
        // user and show a console trace to help us debug.
        err = errors.toError('UNEXPECTED_ERROR');

        if (this.window.console && this.window.console.trace) {
          this.window.console.trace();
        }
      }

      if (_.isString(err)) {
        err = new Error(err);
      }

      if (! err.context) {
        err.context = this.getViewName();
      }

      return err;
    },

    /**
     * Log the current view
     */
    logView: function () {
      this.metrics.logView(this.getViewName());
    },

    /**
     * Log an event to the event stream
     */
    logEvent: function (eventName) {
      this.metrics.logEvent(eventName);
    },

    /**
     * Log an event with the view name as a prefix
     *
     * @param {string} eventName
     */
    logViewEvent: function (eventName) {
      this.metrics.logViewEvent(this.getViewName(), eventName);
    },

    hideError: function () {
      this.$('.error').slideUp(EPHEMERAL_MESSAGE_ANIMATION_MS);
      this._isErrorVisible = false;
    },

    isErrorVisible: function () {
      return !! this._isErrorVisible;
    },

    /**
     * navigate to another view
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
        // log the error entry before the new view is rendered so events
        // stay in the correct order.
        this.logError(options.error);
        this.ephemeralMessages.set('error', options.error);
      }

      if (options.data) {
        this.ephemeralMessages.set('data', options.data);
      }

      this.notifier.trigger('navigate', {
        clearQueryParams: options.clearQueryParams,
        url: page
      });
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
      if (_.isString(handler)) {
        handler = this[handler];

        if (! _.isFunction(handler)) {
          throw new Error(handler + ' is an invalid function name');
        }
      }

      if (_.isFunction(handler)) {
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
     * Returns the currently logged in account
     */
    getSignedInAccount: function () {
      return this.user.getSignedInAccount();
    },

    /**
     * Returns the account that is active in the current view. It may not
     * be the currently logged in account.
     */
    getAccount: function () {
      // Implement in subclasses
    },

    /**
     * Shows the ChildView, creating and rendering it if needed.
     */
    showChildView: function (/* ChildView */) {
      // Implement in subclasses
    },

    /**
     * Invoke a method on the broker, handling any returned behaviors
     *
     * @method invokeBrokerMethod
     * @param {string} methodName
     * @param ...
     * @return {promise}
     */
    invokeBrokerMethod: function (methodName/*, ...*/) {
      var args = [].slice.call(arguments, 1);

      var self = this;
      var broker = self.broker;

      return p(broker[methodName].apply(broker, args))
        .then(self.invokeBehavior.bind(self));
    },

    /**
     * Invoke a behavior returned by an auth broker.
     *
     * @method invokeBehavior
     * @param {function} behavior
     * @return {variant} behavior's return value if behavior is a function,
     *         otherwise return the behavior.
     */
    invokeBehavior: function (behavior) {
      if (_.isFunction(behavior)) {
        return behavior(this);
      }

      return behavior;
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

  Cocktail.mixin(
    BaseView,
    TimerMixin
  );

  module.exports = BaseView;
});
