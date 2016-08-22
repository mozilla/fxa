/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var AvatarCameraView = require('../views/settings/avatar_camera');
  var AvatarChangeView = require('../views/settings/avatar_change');
  var AvatarCropView = require('../views/settings/avatar_crop');
  var AvatarGravatarView = require('../views/settings/avatar_gravatar');
  var Backbone = require('backbone');
  var CannotCreateAccountView = require('../views/cannot_create_account');
  var SupportCreateSecurePasswordView = require('../views/support/create_secure_password');
  var VerificationReasons = require('lib/verification-reasons');
  var ChangePasswordView = require('../views/settings/change_password');
  var ChooseWhatToSyncView = require('../views/choose_what_to_sync');
  var ClearStorageView = require('../views/clear_storage');
  var CommunicationPreferencesView = require('../views/settings/communication_preferences');
  var CompleteResetPasswordView = require('../views/complete_reset_password');
  var CompleteSignUpView = require('../views/complete_sign_up');
  var ConfirmResetPasswordView = require('../views/confirm_reset_password');
  var ConfirmView = require('../views/confirm');
  var CookiesDisabledView = require('../views/cookies_disabled');
  var DeleteAccountView = require('../views/settings/delete_account');
  var ClientsView = require('../views/settings/clients');
  var DisplayNameView = require('../views/settings/display_name');
  var ForceAuthView = require('../views/force_auth');
  var GravatarPermissionsView = require('../views/settings/gravatar_permissions');
  var LegalView = require('../views/legal');
  var p = require('./promise');
  var PermissionsView = require('../views/permissions');
  var PpView = require('../views/pp');
  var ReadyView = require('../views/ready');
  var ResetPasswordView = require('../views/reset_password');
  var SettingsView = require('../views/settings');
  var SignInView = require('../views/sign_in');
  var SignUpView = require('../views/sign_up');
  var Storage = require('./storage');
  var TosView = require('../views/tos');

  function createViewHandler(View, options) {
    return function () {
      return this.showView(View, options);
    };
  }

  function createChildViewHandler(ChildView, ParentView, options) {
    return function () {
      return this.showChildView(ChildView, ParentView, options);
    };
  }

  function createViewModel(data) {
    return new Backbone.Model(data || {});
  }

  var Router = Backbone.Router.extend({
    routes: {
      '(/)': 'redirectToSignupOrSettings',
      'cannot_create_account(/)': createViewHandler(CannotCreateAccountView),
      'choose_what_to_sync(/)': createViewHandler(ChooseWhatToSyncView),
      'clear(/)': createViewHandler(ClearStorageView),
      'complete_reset_password(/)': createViewHandler(CompleteResetPasswordView),
      'complete_signin(/)': createViewHandler(CompleteSignUpView, { type: VerificationReasons.SIGN_IN }),
      'confirm(/)': createViewHandler(ConfirmView, { type: VerificationReasons.SIGN_UP }),
      'confirm_reset_password(/)': createViewHandler(ConfirmResetPasswordView),
      'confirm_signin(/)': createViewHandler(ConfirmView, { type: VerificationReasons.SIGN_IN }),
      'cookies_disabled(/)': createViewHandler(CookiesDisabledView),
      'force_auth(/)': createViewHandler(ForceAuthView),
      'force_auth_complete(/)': createViewHandler(ReadyView, { type: VerificationReasons.FORCE_AUTH }),
      'legal(/)': createViewHandler(LegalView),
      'legal/privacy(/)': createViewHandler(PpView),
      'legal/terms(/)': createViewHandler(TosView),
      'oauth(/)': 'redirectToBestOAuthChoice',
      'oauth/force_auth(/)': createViewHandler(ForceAuthView),
      'oauth/signin(/)': createViewHandler(SignInView),
      'oauth/signup(/)': createViewHandler(SignUpView),
      'reset_password(/)': createViewHandler(ResetPasswordView),
      'reset_password_complete(/)': createViewHandler(ReadyView, { type: VerificationReasons.PASSWORD_RESET }),
      'settings(/)': createViewHandler(SettingsView),
      'settings/avatar/camera(/)': createChildViewHandler(AvatarCameraView, SettingsView),
      'settings/avatar/change(/)': createChildViewHandler(AvatarChangeView, SettingsView),
      'settings/avatar/crop(/)': createChildViewHandler(AvatarCropView, SettingsView),
      'settings/avatar/gravatar(/)': createChildViewHandler(AvatarGravatarView, SettingsView),
      'settings/avatar/gravatar_permissions(/)': createChildViewHandler(GravatarPermissionsView, SettingsView),
      'settings/change_password(/)': createChildViewHandler(ChangePasswordView, SettingsView),
      'settings/clients(/)': createChildViewHandler(ClientsView, SettingsView),
      'settings/communication_preferences(/)': createChildViewHandler(CommunicationPreferencesView, SettingsView),
      'settings/delete_account(/)': createChildViewHandler(DeleteAccountView, SettingsView),
      'settings/display_name(/)': createChildViewHandler(DisplayNameView, SettingsView),
      'signin(/)': createViewHandler(SignInView),
      'signin_complete(/)': createViewHandler(ReadyView, { type: VerificationReasons.SIGN_IN }),
      'signin_permissions(/)': createViewHandler(PermissionsView, { type: VerificationReasons.SIGN_IN }),
      'signup(/)': createViewHandler(SignUpView),
      'signup_complete(/)': createViewHandler(ReadyView, { type: VerificationReasons.SIGN_UP }),
      'signup_permissions(/)': createViewHandler(PermissionsView, { type: VerificationReasons.SIGN_UP }),
      'support/create_secure_password(/)': createViewHandler(SupportCreateSecurePasswordView),
      'verify_email(/)': createViewHandler(CompleteSignUpView, { type: VerificationReasons.SIGN_UP })
    },

    initialize: function (options) {
      options = options || {};

      this.broker = options.broker;
      this.metrics = options.metrics;
      this.notifier = options.notifier;
      this.user = options.user;
      this.window = options.window || window;

      this.notifier.once('view-shown', this._afterFirstViewHasRendered.bind(this));
      this.notifier.on('navigate', this.onNavigate.bind(this));
      this.notifier.on('navigate-back', this.onNavigateBack.bind(this));

      this.storage = Storage.factory('sessionStorage', this.window);
    },

    onNavigate: function (event) {
      this._nextViewModel = createViewModel(event.nextViewData);
      this.navigate(event.url, event.routerOptions);
    },

    onNavigateBack: function (event) {
      this._nextViewModel = createViewModel(event.nextViewData);
      this.navigateBack();
    },

    navigate: function (url, options) {
      options = options || {};

      if (! options.hasOwnProperty('trigger')) {
        options.trigger = true;
      }

      // If the caller has not asked us to clear the query params
      // and the new URL does not contain query params, propagate
      // the current query params to the next view.
      if (! options.clearQueryParams && ! /\?/.test(url)) {
        url = url + this.window.location.search;
      }

      return Backbone.Router.prototype.navigate.call(this, url, options);
    },

    navigateBack: function () {
      this.window.history.back();
    },

    redirectToSignupOrSettings: function () {
      var url = this.user.getSignedInAccount().get('sessionToken') ?
                  '/settings' : '/signup';
      this.navigate(url, { replace: true, trigger: true });
    },

    /**
     * Redirect the user to the best suitable OAuth flow.
     * If email parameter is available, it will check to see if an
     * an account associated with it and navigate to signin/signup page.
     *
     * @returns {Promise}
     */
    redirectToBestOAuthChoice: function () {
      var self = this;

      // Attempt to get email address from relier
      var email = self.broker.relier.get('email');

      return p().then(function () {
        if (email) {
          // Attempt to get account status of email and navigate
          // to correct signin/signup page if exists.
          var account = self.user.initAccount({ email: email });
          return self.user.checkAccountEmailExists(account)
            .then(function (exists) {
              if (exists) {
                return '/oauth/signin';
              } else {
                return '/oauth/signup';
              }
            }, function (err) {
              // The error here is a throttling error or server error (500).
              // In either case, we don't want to stop the user from
              // navigating to a signup/signin page. Instead, we fallback
              // to choosing navigation page based on whether account is
              // a default account. Swallow and log error.
              self.metrics.logError(err);
            });
        }
        // If no email in relier, choose navigation page based on
        // whether account is a default account.
      })
      .then(function (route) {
        if (! route) {
          if (self.user.getChooserAccount().isDefault()) {
            route = '/oauth/signup';
          } else {
            route = '/oauth/signin';
          }
        }

        return self.navigate(route, { replace: true, trigger: true });
      });
    },

    /**
     * Get the options to pass to a View constructor.
     *
     * @param {object} options - additional options
     * @returns {object}
     */
    getViewOptions: function (options) {
      // passed in options block can override
      // default options.
      return _.extend({
        canGoBack: this.canGoBack(),
        currentPage: this.getCurrentPage(),
        model: this._nextViewModel,
        viewName: this.getCurrentViewName()
      }, options);
    },

    canGoBack: function () {
      return !! this.storage.get('canGoBack');
    },

    getCurrentPage: function () {
      return Backbone.history.fragment;
    },

    getCurrentViewName: function () {
      return this.fragmentToViewName(this.getCurrentPage());
    },

    _afterFirstViewHasRendered: function () {
      // afterLoaded lets the relier know when the first screen has been
      // loaded. It does not expect a response, so no error handler
      // is attached and the promise is not returned.
      this.broker.afterLoaded();

      // `loaded` is used to determine how long until the
      // first screen is rendered and the user can interact
      // with FxA. Similar to window.onload, but FxA specific.
      this.metrics.logEvent('loaded');

      // back is enabled after the first view is rendered or
      // if the user re-starts the app.
      this.storage.set('canGoBack', true);
    },

    fragmentToViewName: function (fragment) {
      fragment = fragment || '';
      // strip leading /
      return fragment.replace(/^\//, '')
                // strip trailing /
                .replace(/\/$/, '')
                // any other slashes get converted to '.'
                .replace(/\//g, '.')
                // search params can contain sensitive info
                .replace(/\?.*/, '')
                // replace _ with -
                .replace(/_/g, '-');
    },

    /**
     * Notify the system a new View should be shown.
     *
     * @param {function} View - view constructor
     * @param {object} [options]
     */
    showView: function (View, options) {
      this.notifier.trigger(
          'show-view', View, this.getViewOptions(options));
    },

    /**
     * Notify the system a new ChildView should be shown.
     *
     * @param {function} ChildView - view constructor
     * @param {function} ParentView - view constructor,
     *     the parent of the ChildView
     * @param {object} [options]
     */
    showChildView: function (ChildView, ParentView, options) {
      this.notifier.trigger(
          'show-child-view', ChildView, ParentView, this.getViewOptions(options));
    },

    /**
     * Create a route handler that is used to display a View
     *
     * @param {function} View - constructor of view to show
     * @param {object} [options] - options to pass to View constructor
     * @returns {function} - a function that can be given to the router.
     */
    createViewHandler: createViewHandler,

    /**
     * Create a route handler that is used to display a ChildView inside of
     * a ParentView. Views will be created as needed.
     *
     * @param {function} ChildView - constructor of ChildView to show
     * @param {function} ParentView - constructor of ParentView to show
     * @param {object} [options] - options to pass to ChildView &
     *     ParentView constructors
     * @returns {function} - a function that can be given to the router.
     */
    createChildViewHandler: createChildViewHandler
  });

  module.exports = Router;
});
