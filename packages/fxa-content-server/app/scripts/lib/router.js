/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';


  const _ = require('underscore');
  const AvatarCameraView = require('../views/settings/avatar_camera');
  const AvatarChangeView = require('../views/settings/avatar_change');
  const AvatarCropView = require('../views/settings/avatar_crop');
  const Backbone = require('backbone');
  const CannotCreateAccountView = require('../views/cannot_create_account');
  const ChangePasswordView = require('../views/settings/change_password');
  const ChooseWhatToSyncView = require('../views/choose_what_to_sync');
  const ClearStorageView = require('../views/clear_storage');
  const ClientDisconnectView = require('../views/settings/client_disconnect');
  const ClientsView = require('../views/settings/clients');
  const CommunicationPreferencesView = require('../views/settings/communication_preferences');
  const CompleteResetPasswordView = require('../views/complete_reset_password');
  const CompleteSignUpView = require('../views/complete_sign_up');
  const ConfirmResetPasswordView = require('../views/confirm_reset_password');
  const ConfirmView = require('../views/confirm');
  const ConnectAnotherDeviceView = require('../views/connect_another_device');
  const CookiesDisabledView = require('../views/cookies_disabled');
  const DeleteAccountView = require('../views/settings/delete_account');
  const DisplayNameView = require('../views/settings/display_name');
  const EmailsView = require('../views/settings/emails');
  const ForceAuthView = require('../views/force_auth');
  const IndexView = require('../views/index');
  const LegalView = require('../views/legal');
  const OAuthIndexView = require('../views/oauth_index');
  const PermissionsView = require('../views/permissions');
  const PpView = require('../views/pp');
  const ReadyView = require('../views/ready');
  const ReportSignInView = require('../views/report_sign_in');
  const ResetPasswordView = require('../views/reset_password');
  const SettingsView = require('../views/settings');
  const SignInBouncedView = require('../views/sign_in_bounced');
  const SignInPasswordView = require('../views/sign_in_password');
  const SignInReportedView = require('../views/sign_in_reported');
  const SignInUnblockView = require('../views/sign_in_unblock');
  const SignInView = require('../views/sign_in');
  const SignUpView = require('../views/sign_up');
  const SignUpPasswordView = require('../views/sign_up_password');
  const SmsSendView = require('../views/sms_send');
  const SmsSentView = require('../views/sms_sent');
  const Storage = require('./storage');
  const TosView = require('../views/tos');
  const VerificationReasons = require('./verification-reasons');
  const WhyConnectAnotherDeviceView = require('../views/why_connect_another_device');

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

  const Router = Backbone.Router.extend({
    routes: {
      '(/)': createViewHandler(IndexView),
      'cannot_create_account(/)': createViewHandler(CannotCreateAccountView),
      'choose_what_to_sync(/)': createViewHandler(ChooseWhatToSyncView),
      'clear(/)': createViewHandler(ClearStorageView),
      'complete_reset_password(/)': createViewHandler(CompleteResetPasswordView),
      'complete_signin(/)': createViewHandler(CompleteSignUpView, { type: VerificationReasons.SIGN_IN }),
      'confirm(/)': createViewHandler(ConfirmView, { type: VerificationReasons.SIGN_UP }),
      'confirm_reset_password(/)': createViewHandler(ConfirmResetPasswordView),
      'confirm_signin(/)': createViewHandler(ConfirmView, { type: VerificationReasons.SIGN_IN }),
      'connect_another_device(/)': createViewHandler(ConnectAnotherDeviceView),
      'connect_another_device/why(/)': createChildViewHandler(WhyConnectAnotherDeviceView, ConnectAnotherDeviceView),
      'cookies_disabled(/)': createViewHandler(CookiesDisabledView),
      'force_auth(/)': createViewHandler(ForceAuthView),
      'legal(/)': createViewHandler(LegalView),
      'legal/privacy(/)': createViewHandler(PpView),
      'legal/terms(/)': createViewHandler(TosView),
      'oauth(/)': createViewHandler(OAuthIndexView),
      'oauth/force_auth(/)': createViewHandler(ForceAuthView),
      'oauth/signin(/)': createViewHandler(SignInView),
      'oauth/signup(/)': createViewHandler(SignUpView),
      'report_signin(/)': createViewHandler(ReportSignInView),
      'reset_password(/)': createViewHandler(ResetPasswordView),
      'reset_password_confirmed(/)': createViewHandler(ReadyView, { type: VerificationReasons.PASSWORD_RESET }),
      'reset_password_verified(/)': createViewHandler(ReadyView, { type: VerificationReasons.PASSWORD_RESET }),
      'secondary_email_verified(/)': createViewHandler(ReadyView, { type: VerificationReasons.SECONDARY_EMAIL_VERIFIED }),
      'settings(/)': createViewHandler(SettingsView),
      'settings/avatar/camera(/)': createChildViewHandler(AvatarCameraView, SettingsView),
      'settings/avatar/change(/)': createChildViewHandler(AvatarChangeView, SettingsView),
      'settings/avatar/crop(/)': createChildViewHandler(AvatarCropView, SettingsView),
      'settings/change_password(/)': createChildViewHandler(ChangePasswordView, SettingsView),
      'settings/clients(/)': createChildViewHandler(ClientsView, SettingsView),
      'settings/clients/disconnect(/)': createChildViewHandler(ClientDisconnectView, SettingsView),
      'settings/communication_preferences(/)': createChildViewHandler(CommunicationPreferencesView, SettingsView),
      'settings/delete_account(/)': createChildViewHandler(DeleteAccountView, SettingsView),
      'settings/display_name(/)': createChildViewHandler(DisplayNameView, SettingsView),
      'settings/emails(/)': createChildViewHandler(EmailsView, SettingsView),
      'signin(/)': 'onSignIn',
      'signin_bounced(/)': createViewHandler(SignInBouncedView),
      'signin_confirmed(/)': createViewHandler(ReadyView, { type: VerificationReasons.SIGN_IN }),
      'signin_permissions(/)': createViewHandler(PermissionsView, { type: VerificationReasons.SIGN_IN }),
      'signin_reported(/)': createViewHandler(SignInReportedView),
      'signin_unblock(/)': createViewHandler(SignInUnblockView),
      'signin_verified(/)': createViewHandler(ReadyView, { type: VerificationReasons.SIGN_IN }),
      'signup(/)': 'onSignUp',
      'signup_confirmed(/)': createViewHandler(ReadyView, { type: VerificationReasons.SIGN_UP }),
      'signup_permissions(/)': createViewHandler(PermissionsView, { type: VerificationReasons.SIGN_UP }),
      'signup_verified(/)': createViewHandler(ReadyView, { type: VerificationReasons.SIGN_UP }),
      'sms(/)': createViewHandler(SmsSendView),
      'sms/sent(/)': createViewHandler(SmsSentView),
      'sms/why(/)': createChildViewHandler(WhyConnectAnotherDeviceView, SmsSendView),
      'verify_email(/)': createViewHandler(CompleteSignUpView, { type: VerificationReasons.SIGN_UP }),
      'verify_secondary_email(/)': createViewHandler(CompleteSignUpView, { type: VerificationReasons.SECONDARY_EMAIL_VERIFIED })
    },

    initialize (options = {}) {
      this.metrics = options.metrics;
      this.notifier = options.notifier;
      this.relier = options.relier;
      this.user = options.user;
      this.window = options.window || window;
      this._viewModelStack = [];

      this.notifier.once('view-shown', this._afterFirstViewHasRendered.bind(this));
      this.notifier.on('navigate', this.onNavigate.bind(this));
      this.notifier.on('navigate-back', this.onNavigateBack.bind(this));
      this.notifier.on('email-first-flow', () => this._isEmailFirstFlow = true);

      this.storage = Storage.factory('sessionStorage', this.window);
    },

    onSignUp () {
      const View = this._isEmailFirstFlow ? SignUpPasswordView : SignUpView;
      return this.showView(View);
    },

    onSignIn () {
      const View = this._isEmailFirstFlow ? SignInPasswordView : SignInView;
      return this.showView(View);
    },

    onNavigate (event) {
      if (event.server) {
        return this.navigateAway(event.url);
      }

      this.navigate(event.url, event.nextViewData, event.routerOptions);
    },

    onNavigateBack (event) {
      this.navigateBack(event.nextViewData);
    },

    /**
     * Navigate to `url` using `nextViewData` as the data for the view's model.
     *
     * @param {String} url
     * @param {Object} [nextViewData={}]
     * @param {Object} [options={}]
     *   @param {Boolean} [options.clearQueryParams=false] Clear the query parameters?
     *   @param {Boolean} [options.replace=false] Replace the current view?
     *   @param {Boolean} [options.trigger=true] Show the new view?
     * @returns {any}
     */
    navigate (url, nextViewData = {}, options = {}) {
      if (options.replace && this._viewModelStack.length) {
        this._viewModelStack[this._viewModelStack.length - 1] = createViewModel(nextViewData);
      } else {
        this._viewModelStack.push(createViewModel(nextViewData));
      }

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

    /**
     * Navigate externally to the application, flushing the metrics
     * before doing so.
     *
     * @param {String} url
     * @returns {Promise}
     */
    navigateAway (url) {
      return this.metrics.flush()
        .then(() => {
          this.window.location.href = url;
        });
    },

    /**
     * Go back one URL, combining the previous view's viewModel
     * with the data in `previousViewData`.
     *
     * @param {Object} [previousViewData={}]
     */
    navigateBack (previousViewData = {}) {
      if (this.canGoBack()) {
        // ditch the current view's model, go back to the previous view's model.
        this._viewModelStack.pop();
        const viewModel = this.getCurrentViewModel();
        if (viewModel) {
          viewModel.set(previousViewData);
        }
        this.window.history.back();
      }
    },

    /**
     * Get the current viewModel, if one is available.
     *
     * @returns {Object}
     */
    getCurrentViewModel () {
      if (this._viewModelStack.length) {
        return this._viewModelStack[this._viewModelStack.length - 1];
      }
    },

    /**
     * Get the options to pass to a View constructor.
     *
     * @param {Object} options - additional options
     * @returns {Object}
     */
    getViewOptions (options) {
      // passed in options block can override
      // default options.
      return _.extend({
        canGoBack: this.canGoBack(),
        currentPage: this.getCurrentPage(),
        model: this.getCurrentViewModel(),
        viewName: this.getCurrentViewName()
      }, options);
    },

    /**
     * Is it possible to go back?
     *
     * @returns {Boolean}
     */
    canGoBack () {
      return !! this.storage.get('canGoBack');
    },

    /**
     * Get the pathname of the current page.
     *
     * @returns {String}
     */
    getCurrentPage () {
      const fragment = Backbone.history.fragment || '';
                // strip leading /
      return fragment.replace(/^\//, '')
                // strip trailing /
                .replace(/\/$/, '')
                // we only want the pathname
                .replace(/\?.*/, '');
    },

    getCurrentViewName () {
      return this.fragmentToViewName(this.getCurrentPage());
    },

    _afterFirstViewHasRendered () {
      // back is enabled after the first view is rendered or
      // if the user re-starts the app.
      this.storage.set('canGoBack', true);
    },

    fragmentToViewName (fragment) {
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
     * @param {Function} View - view constructor
     * @param {Object} [options]
     */
    showView (View, options) {
      this.notifier.trigger(
          'show-view', View, this.getViewOptions(options));
    },

    /**
     * Notify the system a new ChildView should be shown.
     *
     * @param {Function} ChildView - view constructor
     * @param {Function} ParentView - view constructor,
     *     the parent of the ChildView
     * @param {Object} [options]
     */
    showChildView (ChildView, ParentView, options) {
      this.notifier.trigger(
          'show-child-view', ChildView, ParentView, this.getViewOptions(options));
    },

    /**
     * Create a route handler that is used to display a View
     *
     * @param {Function} View - constructor of view to show
     * @param {Object} [options] - options to pass to View constructor
     * @returns {Function} - a function that can be given to the router.
     */
    createViewHandler: createViewHandler,

    /**
     * Create a route handler that is used to display a ChildView inside of
     * a ParentView. Views will be created as needed.
     *
     * @param {Function} ChildView - constructor of ChildView to show
     * @param {Function} ParentView - constructor of ParentView to show
     * @param {Object} [options] - options to pass to ChildView &
     *     ParentView constructors
     * @returns {Function} - a function that can be given to the router.
     */
    createChildViewHandler: createChildViewHandler
  });

  module.exports = Router;
});
