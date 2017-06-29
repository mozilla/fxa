/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const _ = require('underscore');
  const AuthErrors = require('lib/auth-errors');
  const Backbone = require('backbone');
  const Cocktail = require('cocktail');
  const domWriter = require('lib/dom-writer');
  const ErrorUtils = require('lib/error-utils');
  const ExternalLinksMixin = require('views/mixins/external-links-mixin');
  const NotifierMixin = require('lib/channels/notifier-mixin');
  const NullMetrics = require('lib/null-metrics');
  const Logger = require('lib/logger');
  const p = require('lib/promise');
  const Raven = require('raven');
  const SearchParamMixin = require('lib/search-param-mixin');
  const Strings = require('lib/strings');
  const TimerMixin = require('views/mixins/timer-mixin');
  const VerificationReasons = require('lib/verification-reasons');

  var DEFAULT_TITLE = window.document.title;
  var STATUS_MESSAGE_ANIMATION_MS = 150;

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
      .slideDown(STATUS_MESSAGE_ANIMATION_MS)
      .attr('data-shown', 'true');

    this.trigger('success', msg);
    this._isSuccessVisible = true;
  }

  function displayError(displayStrategy, err) {
    // Errors are disabled on page unload to suppress errors
    // caused by aborted XHR requests.
    if (! this._areErrorsEnabled) {
      this.logger.error('Error ignored: %s', JSON.stringify(err));
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
      .slideDown(STATUS_MESSAGE_ANIMATION_MS)
      .attr('data-shown', 'true');

    this.trigger('error', translated);

    this._isErrorVisible = true;

    return translated;
  }

  /**
   * Return the error module that produced the error, based on the error's
   * namespace.
   *
   * @param {Error} err
   * @returns {Object}
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

    constructor: function (options = {}) {
      this.broker = options.broker;
      this.currentPage = options.currentPage;
      this.model = options.model || new Backbone.Model();
      this.metrics = options.metrics || nullMetrics;
      this.relier = options.relier;
      this.sentryMetrics = options.sentryMetrics || Raven;
      this.childViews = [];
      this.user = options.user;
      this.lang = options.lang;
      this.window = options.window || window;
      this.logger = new Logger(this.window);

      this.navigator = options.navigator || this.window.navigator || navigator;
      this.translator = options.translator || this.window.translator;

      // `events` are defined on child views without extending
      // BaseView's events. Defining events on BaseView (or any
      // of its mixins) results in a clobbered events hash.
      // Just mix the ExternalLinksMixin's events in.
      _.extend(this.events, ExternalLinksMixin.events);

      // Replace any string declarations with a standin
      // that looks up the function by name when invoked.
      // The extra level of indirection allows sinon
      // spies & stubs to be used on DOM event handlers.
      // Without indirection, the original function is
      // always called.
      for (const eventName in this.events) {
        const method = this.events[eventName];
        if (_.isString(method) && _.isFunction(this[method])) {
          // a function must be used instead of a fat arrow
          // or else Backbone will not add the handler.
          this.events[eventName] = function (...args) {
            this[method](...args);
          };
        }
      }

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
      this._boundDisableErrors = this.disableErrors.bind(this);
      $(this.window).on('beforeunload', this._boundDisableErrors);

      this._boundCheckAuthorization = this.checkAuthorization.bind(this);
      $(this.window).on('focus', this._boundCheckAuthorization);
    },

    /**
     * Render the view - Rendering is done asynchronously.
     *
     * Two functions can be overridden to perform data validation:
     * * beforeRender - called before rendering occurs. Can be used
     *   to perform data validation. Return a promise to
     *   perform an asynchronous check. Return false or a promise
     *   that resolves to false to prevent rendering. If `navigate` is
     *   called in `beforeRender`, rendering of the current view
     *   is prevented.
     * * afterRender - called after the rendering occurs. Can be used
     *   to print an error message after the view is already rendered.
     *
     * @returns {Promise}
     */
    render () {
      if (this.layoutClassName) {
        $('body').addClass(this.layoutClassName);
      }

      // reset _hasNavigated for every render, otherwise settings panels
      // cannot re-render themselves after displaying an inline child view.
      this._hasNavigated = false;
      return p()
        .then(() => this.checkAuthorization())
        .then((isUserAuthorized) => {
          return isUserAuthorized && this.beforeRender();
        })
        .then((shouldRender) => {
          // rendering is opt out, should not occur if the view
          // has already navigated.
          if (shouldRender === false || this._hasNavigated) {
            return false;
          }

          return p().then(() => {
            this.destroyChildViews();

            // force a re-load of the context every time the
            // view is rendered or else stale data may
            // be returned.
            this._context = null;
            this.$el.html(this.renderTemplate(this.template.bind(this)));

            // Track whether status messages were made visible via the template.
            this._isErrorVisible = this.$('.error').hasClass('visible');
            this._isSuccessVisible = this.$('.success').hasClass('visible');
          })
          .then(_.bind(this.afterRender, this))
          .then(() => {
            this.trigger('rendered');

            return true;
          });
        });
    },

    /**
     * Render a template using view's own context combined with
     * any additional passed in context.
     *
     * @param {Function} template - template function
     * @param {Object} [additionalContext] - additional context to pass to
     * template function.
     * @returns {String} - rendered template
     */
    renderTemplate (template, additionalContext = {}) {
      const context = _.extend({}, this.getContext(), additionalContext);
      return template(context);
    },

    /**
     * Write content to the DOM
     *
     * @param {String|Element} content
     * @returns {undefined}
     */
    writeToDOM (content) {
      return domWriter.write(this.window, content);
    },

    /**
     * Checks whether the user is authorized to view the current view.
     * If user is not authorized they will be sent to another screen
     * to sign in or confirm their account.
     *
     * @returns {Promise} resolves to true or false.
     */
    checkAuthorization () {
      if (this.mustAuth || this.mustVerify) {
        return this.user.sessionStatus()
          .then((account) => {
            if (this.mustVerify && ! account.get('verified')) {
              var targetScreen;

              if (account.get('verificationReason') === VerificationReasons.SIGN_UP) {
                targetScreen = 'confirm';
              } else if (account.get('verificationReason') === VerificationReasons.SIGN_IN) {
                targetScreen = 'confirm_signin';
              }

              this.navigate(targetScreen, {
                account: account
              });

              return false;
            }

            return true;
          }, (err) => {
            if (AuthErrors.is(err, 'INVALID_TOKEN')) {
              this.logError(AuthErrors.toError('SESSION_EXPIRED'));
              this.navigate(this._reAuthPage(), {
                redirectTo: this.currentPage
              });
              return false;
            }

            throw err;
          });
      }

      return p(true);
    },

    // If the user navigates to a page that requires auth and their session
    // is not currently cached, we ask them to sign in again. If the relier
    // specifies an email address, we force the user to use that account.
    _reAuthPage () {
      if (this.relier && this.relier.get('email')) {
        return 'force_auth';
      }
      return 'signin';
    },

    displayStatusMessages () {
      var success = this.model.get('success');
      if (success) {
        this.displaySuccess(success);
        this.model.unset('success');
      }

      var unsafeSuccess = this.model.get('unsafeSuccess');
      if (unsafeSuccess) {
        this.unsafeDisplaySuccess(unsafeSuccess);
        this.model.unset('unsafeSuccess');
      }

      var error = this.model.get('error');
      if (error) {
        this.displayError(error);
        this.model.unset('error');
      }
    },

    titleFromView (baseTitle) {
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

    getContext () {
      // use cached context, if available. This prevents the context()
      // function from being called multiple times per render.
      if (! this._context) {
        this._context = new Backbone.Model({
          // `t` is a Mustache helper to translate and HTML escape strings.
          t: this.translateInTemplate.bind(this),
          // `unsafeTranslate` is a Mustache helper that translates a
          // string without HTML escaping. Prefer `t`
          unsafeTranslate: this.unsafeTranslateInTemplate.bind(this)
        });
        this.setInitialContext(this._context);
      }
      return this._context.toJSON();
    },

    /**
     * Update the `context` model
     *
     * @param {Object} context
     */
    setInitialContext (context) {
      // Implement in subclasses
    },

    /**
     * Translate a string, output will be HTML escaped.
     *
     * @param {String} text - string to translate
     * @param {Object} [context] - interpolation context, defaults to
     * this.getContext();
     * @returns {String}
     */
    translate (text, context = this.getContext()) {
      if (Strings.hasHTML(text)) {
        const err = AuthErrors.toError('HTML_WILL_BE_ESCAPED');
        err.string = text;
        this.logError(err);
      }

      return _.escape(this.translator.get(text, context));
    },

    /**
     * Translate a string, do not escape the output.
     * This should rarely be used, prefer `translate`
     *
     * ** WARNING ** DOES NOT HTML ESCAPE
     *
     * @param {String} text - string to translate
     * @param {Object} [context] - interpolation context, defaults to
     * this.getContext();
     * @returns {String}
     */
    unsafeTranslate (text, context = this.getContext()) {
      if (Strings.hasUnsafeVariables(text)) {
        const err = AuthErrors.toError('UNSAFE_INTERPOLATION_VARIABLE_NAME');
        err.string = text;
        this.logError(err);
      }

      return this.translator.get(text, context);
    },

    /**
     * Return a Mustache helper that translates a string.
     * Translations are HTML escaped.
     *
     * @param {String} [text] - string to translate
     * @returns {Function}
     */
    translateInTemplate (text) {
      return innerText => this.translate(text || innerText);
    },

    /**
     * Return a Mustache helper that translates a string.
     * Translations are not HTML escaped.
     * Prefer `translateInTemplate`
     *
     * ** WARNING ** DOES NOT HTML ESCAPE
     *
     * @param {string} [text] - string to translate
     * @returns {function}
     */
    unsafeTranslateInTemplate (text) {
      return innerText => this.unsafeTranslate(text || innerText);
    },

    /**
     * Called before rendering begins. If returns false, or if returns
     * a promise that resolves to false, then the view is not
     * rendered. Useful to immediately redirect to another view before
     * rendering begins.
     */
    beforeRender () {
    },

    /**
     * Called after the rendering occurs. Can be used to print an
     * error message after the view is already rendered.
     *
     * @returns {Promise}
     */
    afterRender () {
      // Override in subclasses
      return p();
    },

    /**
     * Called after the view is visible.
     *
     * @returns {Promise}
     */
    afterVisible () {
      // jQuery 3.x requires the view to be visible
      // before animating the status messages.
      this.displayStatusMessages();

      // restyle side-by-side links to stack if they are too long
      // to fit on one line
      var linkContainer = this.$el.find('.links');
      if (linkContainer.length > 0) {
        // takes care of odd number widths
        var halfContainerWidth = Math.floor(linkContainer.width() / 2);
        var shouldResetLinkSize = false;

        linkContainer.children('a').each(function (i, item) {
          var linkWidth = linkContainer.find(item).width();
          // if any link is equal to or more than half its parent's width,
          // make *all* links in the same parent to be stacked
          if (linkWidth >= halfContainerWidth) {
            shouldResetLinkSize = true;
          }
        });

        if (shouldResetLinkSize === true) {
          linkContainer.addClass('centered');
        }
      }

      this.focusAutofocusElement();
      return p();
    },

    destroy (remove) {
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

      $(this.window).off('beforeunload', this._boundDisableErrors);
      $(this.window).off('focus', this._boundCheckAuthorization);

      this.destroyChildViews();

      this.trigger('destroyed');
    },

    trackChildView (view) {
      if (! _.contains(this.childViews, view)) {
        this.childViews.push(view);
        view.on('destroyed', _.bind(this.untrackChildView, this, view));
      }

      return view;
    },

    untrackChildView (view) {
      this.childViews = _.without(this.childViews, view);

      return view;
    },

    destroyChildViews () {
      _.invoke(this.childViews, 'destroy');

      this.childViews = [];
    },

    isChildViewTracked (view) {
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
     * Display a success message. If msg is not given, the contents of
     * the .success element's HTML will not be updated.
     */
    unsafeDisplaySuccess: _.partial(displaySuccess, 'html'),

    hideSuccess () {
      this.$('.success').slideUp(STATUS_MESSAGE_ANIMATION_MS).removeClass('visible');
      this._isSuccessVisible = false;
    },

    /**
     * Return true if the success message is visible
     *
     * @returns {Boolean}
     */
    isSuccessVisible () {
      return !! this._isSuccessVisible;
    },

    /**
     * Display an error message.
     * @method translateError
     * @param {String} err - an error object
     *
     * @return {String} translated error text (if available), untranslated
     *   error text otw.
     */
    translateError (err) {
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
    disableErrors () {
      this._areErrorsEnabled = false;
    },

    /**
     * Display an error message.
     * @method displayError
     * @param {String} err - If err is not given, the contents of the
     *   `.error` element's text will not be updated.
     *
     * @return {String} translated error text (if available), untranslated
     *   error text otw.
     */
    displayError: _.partial(displayError, 'text'),

    /**
     * Display an error message that may contain HTML. Marked unsafe
     * because msg could contain XSS. Use with caution and never
     * with unsanitized user generated content.
     *
     * @method unsafeDisplayError
     * @param {String} err - If err is not given, the contents of the
     *   `.error` element's text will not be updated.
     *
     * @return {String} translated error text (if available), untranslated
     *   error text otw.
     */
    unsafeDisplayError: _.partial(displayError, 'html'),

    /**
     * Log an error to the event stream
     *
     * @param {Error} err
     */
    logError (err) {
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

      ErrorUtils.captureError(err, this.sentryMetrics, this.metrics);
    },


    /**
     * Handle a fatal error. Logs and reports the error, then redirects
     * to the appropriate error page.
     *
     * @param {Error} err
     * @returns {Promise}
     */
    fatalError (err) {
      return ErrorUtils.fatalError(
        err, this.sentryMetrics, this.metrics, this.window, this.translator);
    },

    /**
     * Get the view's name.
     *
     * @returns {String}
     */
    getViewName () {
      return this.viewName;
    },

    _normalizeError (err) {
      var errors = getErrorModule(err);
      if (! err) {
        // likely an error in logic, display an unexpected error to the
        // user and show a console trace to help us debug.
        err = errors.toError('UNEXPECTED_ERROR');

        this.logger.trace();
      }

      if (_.isString(err)) {
        err = new Error(err);
      }

      err.viewName = this.getViewName();

      return err;
    },

    /**
     * Log the current view
     */
    logView () {
      this.metrics.logView(this.getViewName());
    },

    /**
     * Log an event to the event stream
     *
     * @param {String} eventName
     */
    logEvent (eventName) {
      this.metrics.logEvent(eventName);
    },

    /**
     * Log an event once per page load
     *
     * @param {String} eventName
     */
    logEventOnce (eventName) {
      this.metrics.logEventOnce(eventName);
    },

    /**
     * Log an event with the view name as a prefix
     *
     * @param {String} eventName
     */
    logViewEvent (eventName) {
      this.metrics.logViewEvent(this.getViewName(), eventName);
    },

    /**
     * Log a flow event to the event stream
     *
     * @param {String} eventName
     * @param {String} viewName
     * @param {Object} data
     */
    logFlowEvent (eventName, viewName, data) {
      this.notifier.trigger('flow.event', _.assign({}, data, {
        event: eventName,
        viewName
      }));
    },

    /**
     * Log a flow event once per page load
     *
     * @param {String} eventName
     * @param {String} viewName
     */
    logFlowEventOnce (eventName, viewName) {
      this.logFlowEvent(eventName, viewName, { once: true });
    },

    hideError () {
      this.$('.error').slideUp(STATUS_MESSAGE_ANIMATION_MS).removeClass('visible');
      this._isErrorVisible = false;
    },

    isErrorVisible () {
      return !! this._isErrorVisible;
    },

    /**
     * navigate to another screen
     *
     * @param {String} url - url of screen
     * @param {Object} [nextViewData] - data to pass to the next view
     * @param {RouterOptions} [routerOptions] - options to pass to the router
     */
    navigate (url, nextViewData, routerOptions) {
      nextViewData = nextViewData || {};
      routerOptions = routerOptions || {};

      if (nextViewData.error) {
        // log the error entry before the new view is rendered so events
        // stay in the correct order.
        this.logError(nextViewData.error);
      }

      this.notifier.trigger('navigate', {
        nextViewData: nextViewData,
        routerOptions: routerOptions,
        url: url
      });
      this._hasNavigated = true;
    },

    /**
     * Navigate externally to the application.
     *
     * @param {String} url
     */
    navigateAway (url) {
      this.notifier.trigger('navigate', {
        server: true,
        url
      });
    },

    /**
     * Focus the element with the [autofocus] attribute, if not a touch device.
     * Focusing an element on a touch device causes the virtual keyboard to
     * be displayed, which hides part of the screen.
     */
    focusAutofocusElement () {
      // make a huge assumption and say if the device does not have touch,
      // it's a desktop device and autofocus can be applied without
      // hiding part of the view. The no-touch class is added by
      // startup-styles
      const $autofocusEl = this.$('[autofocus]');
      if (! $('html').hasClass('no-touch') || ! $autofocusEl.length) {
        return;
      }

      const attemptFocus = () => {
        if ($autofocusEl.is(':focus')) {
          return;
        }

        // only elements that are visible can be focused. When embedded in
        // about:accounts, the content is hidden when the first "focus" is
        // done. Keep trying to focus until the element is actually focused,
        // and then stop trying.
        if (! $autofocusEl.is(':visible')) {
          this.setTimeout(attemptFocus, 50);
          return;
        }

        this.focus($autofocusEl);
      };

      attemptFocus();
    },

    /**
     * Safely focus an element. Only sets focus on non-touch devices.
     * Focusing an element on a touch device causes the virtual keyboard to
     * be displayed, which hides part of the screen.
     *
     * @param {String} which
     */
    focus (which) {
      if ($('html').hasClass('no-touch')) {
        try {
          const focusEl = this.$(which);
          // place the cursor at the end of the input when the
          // element is focused.
          focusEl.one('focus', () => this.placeCursorAt(focusEl));
          focusEl.get(0).focus();
        } catch (e) {
          // IE can blow up if the element is not visible.
        }
      }
    },

    /**
     * Place the cursor at the given position within the input element
     *
     * @param {String | Element} which - Strings are assumed to be selectors
     * @param {Number} selectionStart - defaults to after the last character.
     * @param {Number} selectionEnd - defaults to selectionStart.
     */
    placeCursorAt (which, selectionStart = $(which).__val().length, selectionEnd = selectionStart) {
      const el = $(which).get(0);

      try {
        el.selectionStart = selectionStart;
        el.selectionEnd = selectionEnd;
      } catch (e) {
        // This can blow up on password fields in Chrome. Drop the error on
        // the ground, for whatever reason, it still behaves as we expect.
      }
    },

    /**
     * Invoke the specified handler with the given event. Handler
     * can either be a function or a string. If a string, looks for
     * the handler on `this`.
     *
     * @method invokeHandler
     * @param {String|Function} handler
     * @param {...*} args - All additional arguments are passed to the handler.
     * @returns {undefined}
     */
    invokeHandler (handler, ...args) {
      // convert a name to a function.
      if (_.isString(handler)) {
        handler = this[handler];

        if (! _.isFunction(handler)) {
          throw new Error(handler + ' is an invalid function name');
        }
      }

      if (_.isFunction(handler)) {
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
     *
     * @returns {Account}
     */
    getSignedInAccount () {
      return this.user.getSignedInAccount();
    },

    /**
     * Returns the account that is active in the current view. It may not
     * be the currently logged in account.
     */
    getAccount () {
      // Implement in subclasses
    },

    /**
     * Shows the ChildView, creating and rendering it if needed.
     *
     * @param {Function} ChildView - child view's constructor
     * @param {Object} [options] - options to send.
     * @returns {Promise} resolves when complete
     */
    showChildView (/* ChildView, options */) {
      // Implement in subclasses
      return p();
    },

    /**
     * Invoke a method on the broker, handling any returned behaviors
     *
     * @method invokeBrokerMethod
     * @param {String} methodName
     * @param {...*} args - all additional arguments are passed to the broker and behavior.
     * @returns {Promise}
     */
    invokeBrokerMethod (methodName, ...args) {
      return p(this.broker[methodName](...args))
        .then((behavior) => this.invokeBehavior(behavior, ...args));
    },

    /**
     * Invoke a behavior returned by an auth broker.
     *
     * @method invokeBehavior
     * @param {Function} behavior
     * @param {...*} args - all additional arguments are passed to the behavior.
     * @returns {Promise} resolves to the behavior's return value if behavior
     *   is a function, otherwise resolves to the behavior value.
     */
    invokeBehavior (behavior, ...args) {
      return p().then(() => {
        if (_.isFunction(behavior)) {
          return behavior(this, ...args);
        }

        return behavior;
      });
    }
  });

  /**
   * Return a backbone compatible event handler that
   * prevents the default action, then calls the specified handler.
   * @method preventDefaultThen
   * @param {Function} handler - Handler can be either a string or a function.
   * If a string, this[handler] will be called. Handler called with context of "this" view and is passed
   * the event
   * @returns {Function}
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
   * @param {Function} handler
   * @returns {Function}
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
   *
   * @param {String} str
   * @returns {String}
   */
  function t(str) {
    return str;
  }

  BaseView.t = t;

  Cocktail.mixin(
    BaseView,
    // Attach the external links mixin in case the
    // view has any external links that need to have
    // their behaviors modified.
    ExternalLinksMixin,
    SearchParamMixin,
    TimerMixin
  );

  module.exports = BaseView;
});
