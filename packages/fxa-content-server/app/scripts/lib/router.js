/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'backbone',
  './storage',
  'underscore',
  '../views/cannot_create_account',
  '../views/choose_what_to_sync',
  '../views/clear_storage',
  '../views/complete_account_unlock',
  '../views/complete_reset_password',
  '../views/complete_sign_up',
  '../views/confirm',
  '../views/confirm_account_unlock',
  '../views/confirm_reset_password',
  '../views/cookies_disabled',
  '../views/force_auth',
  '../views/legal',
  '../views/openid/login',
  '../views/openid/start',
  '../views/permissions',
  '../views/pp',
  '../views/ready',
  '../views/reset_password',
  '../views/settings',
  '../views/settings/avatar_camera',
  '../views/settings/avatar_change',
  '../views/settings/avatar_crop',
  '../views/settings/avatar_gravatar',
  '../views/settings/change_password',
  '../views/settings/communication_preferences',
  '../views/settings/delete_account',
  '../views/settings/display_name',
  '../views/settings/gravatar_permissions',
  '../views/sign_in',
  '../views/sign_up',
  '../views/tos',
  '../views/unexpected_error'
],
function (
  Backbone,
  Storage,
  _,
  CannotCreateAccountView,
  ChooseWhatToSyncView,
  ClearStorageView,
  CompleteAccountUnlockView,
  CompleteResetPasswordView,
  CompleteSignUpView,
  ConfirmView,
  ConfirmAccountUnlockView,
  ConfirmResetPasswordView,
  CookiesDisabledView,
  ForceAuthView,
  LegalView,
  OpenIdLoginView,
  OpenIdStartView,
  PermissionsView,
  PpView,
  ReadyView,
  ResetPasswordView,
  SettingsView,
  AvatarCameraView,
  AvatarChangeView,
  AvatarCropView,
  AvatarGravatarView,
  ChangePasswordView,
  CommunicationPreferencesView,
  DeleteAccountView,
  DisplayNameView,
  GravatarPermissionsView,
  SignInView,
  SignUpView,
  TosView,
  UnexpectedErrorView
) {
  'use strict';

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

  var Router = Backbone.Router.extend({
    routes: {
      '(/)': 'redirectToSignupOrSettings',
      'account_unlock_complete(/)': createViewHandler(ReadyView, { type: 'account_unlock' }),
      'cannot_create_account(/)': createViewHandler(CannotCreateAccountView),
      'choose_what_to_sync(/)': createViewHandler(ChooseWhatToSyncView),
      'clear(/)': createViewHandler(ClearStorageView),
      'complete_reset_password(/)': createViewHandler(CompleteResetPasswordView),
      'complete_unlock_account(/)': createViewHandler(CompleteAccountUnlockView),
      'confirm(/)': createViewHandler(ConfirmView),
      'confirm_account_unlock(/)': createViewHandler(ConfirmAccountUnlockView),
      'confirm_reset_password(/)': createViewHandler(ConfirmResetPasswordView),
      'cookies_disabled(/)': createViewHandler(CookiesDisabledView),
      'force_auth(/)': createViewHandler(ForceAuthView),
      'force_auth_complete(/)': createViewHandler(ReadyView, { type: 'force_auth' }),
      'legal(/)': createViewHandler(LegalView),
      'legal/privacy(/)': createViewHandler(PpView),
      'legal/terms(/)': createViewHandler(TosView),
      'oauth(/)': 'redirectToBestOAuthChoice',
      'oauth/force_auth(/)': createViewHandler(ForceAuthView),
      'oauth/signin(/)': createViewHandler(SignInView),
      'oauth/signup(/)': createViewHandler(SignUpView),
      'openid/login(/)': createViewHandler(OpenIdLoginView),
      'openid/start(/)': createViewHandler(OpenIdStartView),
      'reset_password(/)': createViewHandler(ResetPasswordView),
      'reset_password_complete(/)': createViewHandler(ReadyView, { type: 'reset_password' }),
      'settings(/)': createViewHandler(SettingsView),
      'settings/avatar/camera(/)': createChildViewHandler(AvatarCameraView, SettingsView),
      'settings/avatar/change(/)': createChildViewHandler(AvatarChangeView, SettingsView),
      'settings/avatar/crop(/)': createChildViewHandler(AvatarCropView, SettingsView),
      'settings/avatar/gravatar(/)': createChildViewHandler(AvatarGravatarView, SettingsView),
      'settings/avatar/gravatar_permissions(/)': createChildViewHandler(GravatarPermissionsView, SettingsView),
      'settings/change_password(/)': createChildViewHandler(ChangePasswordView, SettingsView),
      'settings/communication_preferences(/)': createChildViewHandler(CommunicationPreferencesView, SettingsView),
      'settings/delete_account(/)': createChildViewHandler(DeleteAccountView, SettingsView),
      'settings/display_name(/)': createChildViewHandler(DisplayNameView, SettingsView),
      'signin(/)': createViewHandler(SignInView),
      'signin_complete(/)': createViewHandler(ReadyView, { type: 'sign_in' }),
      'signin_permissions(/)': createViewHandler(PermissionsView, { type: 'sign_in' }),
      'signup(/)': createViewHandler(SignUpView),
      'signup_complete(/)': createViewHandler(ReadyView, { type: 'sign_up' }),
      'signup_permissions(/)': createViewHandler(PermissionsView, { type: 'sign_up' }),
      'unexpected_error(/)': createViewHandler(UnexpectedErrorView),
      'verify_email(/)': createViewHandler(CompleteSignUpView)
    },

    initialize: function (options) {
      options = options || {};

      this.able = options.able;
      this.broker = options.broker;
      this.formPrefill = options.formPrefill;
      this.fxaClient = options.fxaClient;
      this.interTabChannel = options.interTabChannel;
      this.language = options.language;
      this.metrics = options.metrics;
      this.notifications = options.notifications;
      this.relier = options.relier;
      this.sentryMetrics = options.sentryMetrics;
      this.user = options.user;
      this.window = options.window || window;

      this.notifications.once('view-shown', this._afterFirstViewHasRendered.bind(this));

      this.storage = Storage.factory('sessionStorage', this.window);
    },

    navigate: function (url, options) {
      options = options || { trigger: true };

      // If the caller has not asked us to clear the query params
      // and the new URL does not contain query params, propagate
      // the current query params to the next view.
      if (! options.clearQueryParams && ! /\?/.test(url)) {
        url = url + this.window.location.search;
      }

      return Backbone.Router.prototype.navigate.call(this, url, options);
    },

    redirectToSignupOrSettings: function () {
      var url = this.user.getSignedInAccount().get('sessionToken') ?
                  '/settings' : '/signup';
      this.navigate(url, { replace: true, trigger: true });
    },

    /**
     * Redirect the user to the best suitable OAuth flow
     */
    redirectToBestOAuthChoice: function () {
      var account = this.user.getChooserAccount();
      var route = '/oauth/signin';

      if (account.isDefault()) {
        route = '/oauth/signup';
      }

      return this.navigate(route, { replace: true, trigger: true });
    },

    /**
     * Get the options to pass to a View constructor.
     *
     * TODO - this only exists because this module used to create the views.
     * There should be a View factory that takes ownership of this logic.
     *
     * @param {object} options - additional options
     * @returns {object}
     */
    getViewOptions: function (options) {
      // passed in options block can override
      // default options.
      var viewOptions = _.extend({
        able: this.able,
        broker: this.broker,
        // back is enabled after the first view is rendered or
        // if the user is re-starts the app.
        canGoBack: this.storage.get('canGoBack') || false,
        formPrefill: this.formPrefill,
        fxaClient: this.fxaClient,
        interTabChannel: this.interTabChannel,
        language: this.language,
        metrics: this.metrics,
        notifications: this.notifications,
        profileClient: this.profileClient,
        relier: this.relier,
        router: this,
        sentryMetrics: this.sentryMetrics,
        user: this.user,
        viewName: this.fragmentToViewName(Backbone.history.fragment),
        window: this.window
      }, options || {});

      return viewOptions;
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

    /**
     * TODO - this is used by views/base to redirect unauthenticated users,
     * pass the currentPage in getViewOptions so that views do not need
     * to reach back into the router to get this information.
     */
    getCurrentPage: function () {
      return Backbone.history.fragment;
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
      this.notifications.trigger(
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
      this.notifications.trigger(
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

  return Router;
});
