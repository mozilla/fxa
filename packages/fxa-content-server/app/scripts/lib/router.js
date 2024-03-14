/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'underscore';
import AccountRecoveryConfirmKey from '../views/account_recovery_confirm_key';
import Backbone from 'backbone';
import ChooseWhatToSyncView from '../views/choose_what_to_sync';
import Cocktail from 'cocktail';
import CompleteResetPasswordView from '../views/complete_reset_password';
import CompleteSignUpView from '../views/complete_sign_up';
import ConfirmResetPasswordView from '../views/confirm_reset_password';
import ConfirmView from '../views/confirm';
import ConfirmSignupCodeView from '../views/confirm_signup_code';
import ConnectAnotherDeviceView from '../views/connect_another_device';
import ForceAuthView from '../views/force_auth';
import IndexView from '../views/index';
import InlineTotpSetupView from '../views/inline_totp_setup';
import InlineRecoverySetupView from '../views/inline_recovery_setup';
import PermissionsView from '../views/permissions';
import SupportView from '../views/support';
import ReadyView from '../views/ready';
import RedirectAuthView from '../views/authorization';
import ReportSignInView from '../views/report_sign_in';
import ResetPasswordView from '../views/reset_password';
import SignInBouncedView from '../views/sign_in_bounced';
import SignInPasswordView from '../views/sign_in_password';
import SignInRecoveryCodeView from '../views/sign_in_recovery_code';
import SignInReportedView from '../views/sign_in_reported';
import SignInTokenCodeView from '../views/sign_in_token_code';
import SignInTotpCodeView from '../views/sign_in_totp_code';
import SignInUnblockView from '../views/sign_in_unblock';
import SignUpPasswordView from '../views/sign_up_password';
import ThirdPartyAuthSetPasswordView from '../views/post_verify/third_party_auth/set_password';
import Storage from './storage';
import SubscriptionsProductRedirectView from '../views/subscriptions_product_redirect';
import SubscriptionsManagementRedirectView from '../views/subscriptions_management_redirect';
import Url from './url';
import UserAgent from './user-agent';
import VerificationReasons from './verification-reasons';
import WouldYouLikeToSync from '../views/would_you_like_to_sync';
import { isAllowed } from 'fxa-shared/configuration/convict-format-allow-list';
import ReactExperimentMixin from './generalized-react-app-experiment-mixin';
import { getClientReactRouteGroups } from '../../../server/lib/routes/react-app/route-groups-client';

const NAVIGATE_AWAY_IN_MOBILE_DELAY_MS = 75;

function getView(ViewOrPath) {
  if (typeof ViewOrPath === 'string') {
    return import(`../views/${ViewOrPath}`).then((result) => {
      if (result.default) {
        return result.default;
      }
      return result;
    });
  } else {
    return Promise.resolve(ViewOrPath);
  }
}

function createViewHandler(ViewOrPath, options) {
  return function () {
    return getView(ViewOrPath).then((View) => {
      return this.showView(View, options);
    });
  };
}

function createChildViewHandler(ChildViewOrPath, ParentViewOrPath, options) {
  return function () {
    return Promise.all([
      getView(ChildViewOrPath),
      getView(ParentViewOrPath),
    ]).then(([ChildView, ParentView]) => {
      return this.showChildView(ChildView, ParentView, options);
    });
  };
}

function createViewModel(data) {
  return new Backbone.Model(data || {});
}

let Router = Backbone.Router.extend({
  initialize(options = {}) {
    this.broker = options.broker;
    this.config = options.config;
    this.metrics = options.metrics;
    this.notifier = options.notifier;
    this.relier = options.relier;
    this.user = options.user;
    this.window = options.window || window;
    this._viewModelStack = [];

    this.notifier.once(
      'view-shown',
      this._afterFirstViewHasRendered.bind(this)
    );
    this.notifier.on('navigate', this.onNavigate.bind(this));
    this.notifier.on('navigate-back', this.onNavigateBack.bind(this));
    this.notifier.on('email-first-flow', () => this._onEmailFirstFlow());

    // If legacy signin/signup flows are disabled, this is obviously
    // an email-first flow!
    if (this.broker.getCapability('disableLegacySigninSignup')) {
      this._isEmailFirstFlow = true;
    }

    this.storage = Storage.factory('sessionStorage', this.window);
  },
});

Cocktail.mixin(Router, ReactExperimentMixin);

Router = Router.extend({
  routes: {
    '(/)': createViewHandler(IndexView),
    'account_recovery_confirm_key(/)': function () {
      this.createReactOrBackboneViewHandler(
        'account_recovery_confirm_key',
        AccountRecoveryConfirmKey
      );
    },
    'account_recovery_reset_password(/)': function () {
      this.createReactOrBackboneViewHandler(
        'account_recovery_reset_password',
        CompleteResetPasswordView
      );
    },
    'authorization(/)': createViewHandler(RedirectAuthView),
    'cannot_create_account(/)': function () {
      this.createReactViewHandler('cannot_create_account');
    },
    'choose_what_to_sync(/)': createViewHandler(ChooseWhatToSyncView),
    'clear(/)': function () {
      this.createReactViewHandler('clear');
    },
    'complete_reset_password(/)': function () {
      this.createReactOrBackboneViewHandler(
        'complete_reset_password',
        CompleteResetPasswordView,
        {
          ...Url.searchParams(this.window.location.search),
        }
      );
    },
    // NOTE - complete_signin must be maintained for backwards compatibility with FF <122
    // With the react conversion, we should only land on the /complete_signin view
    // from signin to sync from version of Firefox <122, when clicking on "resend verification"
    // from Sync Settings.
    // When Extended Service Release is updated to a version >=122, we could consider an alternate experience,
    // such as prompting to update the browser or redirecting to the start of the signin flow so the user can use a code instead.
    'complete_signin(/)': function () {
      this.createReactOrBackboneViewHandler(
        'complete_signin',
        CompleteSignUpView,
        {
          ...Url.searchParams(this.window.location.search),
        },
        {
          type: VerificationReasons.SIGN_IN,
        }
      );
    },
    // We will not be porting the Confirm view to React, see FXA-9054
    'confirm(/)': createViewHandler(ConfirmView, {
      type: VerificationReasons.SIGN_UP,
    }),
    'confirm_reset_password(/)': function () {
      this.createReactOrBackboneViewHandler(
        'confirm_reset_password',
        ConfirmResetPasswordView
      );
    },
    // We will not be porting the Confirm view to React, see FXA-9054
    'confirm_signin(/)': createViewHandler(ConfirmView, {
      type: VerificationReasons.SIGN_IN,
    }),
    'confirm_signup_code(/)': function () {
      /* If a user initiates the OAuth Signup flow in React (e.g. they create an account
      * through an RP), they will be navigated to the React version of `confirm_signup_code`
      * and can be redirected to that RP after signup completion as expected.
      *
      * *However*, `keyFetchToken` and `unwrapBKey`, which are used on `confirm_signup_code`
      * in the OAuth flow, are provided to us when a user creates an unverified account.
      * We do not want to pass these params back and forth between Backbone and React.
      * We can also retrieve these when a user signs in.

      * This means users that have previously created an account but did not verify it
      * and are in the OAuth flow will be in a problematic state when going from Backbone's
      * `signin` to React's `confirm_signup_code`. For this case, we want to use the
      * Backbone `confirm_signup_code` until `signin` is Reactified. See:
      * https://github.com/mozilla/fxa/pull/15839/files#r1344333026
      *
      * Later comment: additionally, we need `keyFetchToken` and `unwrapBKey` to send a
      * webchannel message to the browser for Sync. For this case, we will also show
      * Backbone's `confirm_signup_code` until `signin` is Reactified.
      * */

      const routeName = 'confirm_signup_code';
      // Users that have already reached React Signup will be navigated in-app to this
      // page next (in React). This check handles the OAuth flow and Sync flow when the
      // previous page was Backbone `/signin` - always show Backbone `confirm_signup_code`.
      if (this.relier.isOAuth() || this.relier.isSync()) {
        return getView(routeName).then((View) => {
          return this.showView(View);
        });
      } else {
        this.createReactOrBackboneViewHandler(routeName, ConfirmSignupCodeView);
      }
    },
    'connect_another_device(/)': createViewHandler(ConnectAnotherDeviceView),
    'cookies_disabled(/)': function () {
      this.createReactViewHandler('cookies_disabled', {
        // HACK: this page uses the history API to navigate back and must go back one page
        // further if being redirected from content-server. Flow params are not always
        // available to check against, so we explicitly send in an additional param.
        contentRedirect: true,
        // We pass along `disable_local_storage` for functional-tests that hit another page
        // with this param (synthetically disabling local storage). Without this, tests will
        // be redirected to this page, but local storage will appear enabled.
        /* eslint-disable camelcase */
        ...(Url.searchParam(
          'disable_local_storage',
          this.window.location.search
        ) === '1' && {
          disable_local_storage: 1,
        }),
      });
    },
    'force_auth(/)': function () {
      this.createReactOrBackboneViewHandler('force_auth', ForceAuthView, {
        ...Url.searchParams(this.window.location.search),
      });
    },
    'inline_totp_setup(/)': function () {
      this.createReactOrBackboneViewHandler(
        'inline_totp_setup',
        InlineTotpSetupView
      );
    },
    'inline_recovery_setup(/)': function () {
      this.createReactOrBackboneViewHandler(
        'inline_recovery_setup',
        InlineRecoverySetupView
      );
    },
    'legal(/)': function () {
      this.createReactViewHandler('legal');
    },
    'legal/privacy(/)': function () {
      this.createReactViewHandler('legal/privacy', 'pp', {
        contentRedirect: true,
      });
    },
    ':lang/legal/privacy(/)': function () {
      this.createReactViewHandler('legal/privacy', 'pp', {
        contentRedirect: true,
      });
    },
    'legal/terms(/)': function () {
      this.createReactViewHandler('legal/terms', 'tos', {
        contentRedirect: true,
      });
    },
    ':lang/legal/terms(/)': function () {
      this.createReactViewHandler('legal/terms', 'tos', {
        contentRedirect: true,
      });
    },
    'oauth(/)': createViewHandler(IndexView),
    'oauth/force_auth(/)': createViewHandler(ForceAuthView),
    'oauth/signin(/)': function () {
      this.createReactOrBackboneViewHandler('signin', SignInPasswordView, {
        // see comment in fxa-settings/src/pages/Signin/container.tsx for param explanation
        ...Url.searchParams(this.window.location.search),
        email: this.user.get('emailFromIndex'),
        hasLinkedAccount: this.user.get('hasLinkedAccount'),
        hasPassword: this.user.get('hasPassword'),
      });
    },
    'oauth/signup(/)': function () {
      this.createReactOrBackboneViewHandler(
        'oauth/signup',
        SignUpPasswordView,
        {
          // see comment in fxa-settings/src/pages/Signup/container.tsx for param explanation
          email: this.user.get('emailFromIndex'),
          ...(this.user.get('emailFromIndex') && {
            emailStatusChecked: 'true',
          }),
          ...Url.searchParams(this.window.location.search),
        }
      );
    },
    'oauth/success/:client_id(/)': createViewHandler(ReadyView, {
      type: VerificationReasons.SUCCESSFUL_OAUTH,
    }),
    'pair(/)': createViewHandler('pair/index'),
    'pair/auth/allow(/)': createViewHandler('pair/auth_allow'),
    'pair/auth/complete(/)': createViewHandler('pair/auth_complete'),
    'pair/auth/totp(/)': createViewHandler('pair/auth_totp'),
    'pair/auth/wait_for_supp(/)': createViewHandler('pair/auth_wait_for_supp'),
    'pair/failure(/)': createViewHandler('pair/failure'),
    'pair/success(/)': createViewHandler('pair/success'),
    'pair/supp(/)': createViewHandler('pair/supp', { force: true }),
    'pair/supp/allow(/)': createViewHandler('pair/supp_allow'),
    'pair/supp/wait_for_auth(/)': createViewHandler('pair/supp_wait_for_auth'),
    'pair/unsupported(/)': createViewHandler('pair/unsupported'),
    'post_verify/finish_account_setup/set_password': createViewHandler(
      'post_verify/finish_account_setup/set_password'
    ),
    'post_verify/cad_qr/get_started': createViewHandler(
      'post_verify/cad_qr/get_started'
    ),
    'post_verify/cad_qr/ready_to_scan': createViewHandler(
      'post_verify/cad_qr/ready_to_scan'
    ),
    'post_verify/cad_qr/scan_code': createViewHandler(
      'post_verify/cad_qr/scan_code'
    ),
    'post_verify/cad_qr/connected': createViewHandler(
      'post_verify/cad_qr/connected'
    ),
    'post_verify/newsletters/add_newsletters': createViewHandler(
      'post_verify/newsletters/add_newsletters'
    ),
    'post_verify/password/force_password_change': createViewHandler(
      'post_verify/password/force_password_change'
    ),
    'post_verify/secondary_email/add_secondary_email': createViewHandler(
      'post_verify/secondary_email/add_secondary_email'
    ),
    'post_verify/secondary_email/confirm_secondary_email': createViewHandler(
      'post_verify/secondary_email/confirm_secondary_email'
    ),
    'post_verify/secondary_email/verified_secondary_email': createViewHandler(
      'post_verify/verified',
      {
        type: VerificationReasons.SECONDARY_EMAIL_VERIFIED,
      }
    ),
    'post_verify/third_party_auth/callback(/)': createViewHandler(
      'post_verify/third_party_auth/callback'
    ),
    'post_verify/third_party_auth/set_password(/)': function () {
      this.createReactOrBackboneViewHandler(
        'post_verify/third_party_auth/set_password',
        ThirdPartyAuthSetPasswordView
      );
    },

    'push/confirm_login(/)': createViewHandler('push/confirm_login'),
    'push/send_login(/)': createViewHandler('push/send_login'),
    'push/completed(/)': createViewHandler('push/completed'),
    'primary_email_verified(/)': function () {
      this.createReactOrBackboneViewHandler(
        'primary_email_verified',
        ReadyView,
        null,
        {
          type: VerificationReasons.PRIMARY_EMAIL_VERIFIED,
        }
      );
    },
    'report_signin(/)': function () {
      this.createReactOrBackboneViewHandler('report_signin', ReportSignInView, {
        ...Url.searchParams(this.window.location.search),
      });
    },

    'reset_password(/)': function () {
      this.createReactOrBackboneViewHandler(
        'reset_password',
        ResetPasswordView,
        {
          ...Url.searchParams(this.window.location.search),
        }
      );
    },

    'reset_password_confirmed(/)': createViewHandler(ReadyView, {
      type: VerificationReasons.PASSWORD_RESET,
    }),

    'reset_password_with_recovery_key_verified(/)': function () {
      this.createReactOrBackboneViewHandler(
        'reset_password_with_recovery_key_verified',
        ReadyView,
        null,
        {
          type: VerificationReasons.PASSWORD_RESET_WITH_RECOVERY_KEY,
        }
      );
    },

    'reset_password_verified(/)': function () {
      this.createReactOrBackboneViewHandler(
        'reset_password_verified',
        ReadyView,
        null,
        {
          type: VerificationReasons.PASSWORD_RESET,
        }
      );
    },

    'secondary_email_verified(/)': createViewHandler(ReadyView, {
      type: VerificationReasons.SECONDARY_EMAIL_VERIFIED,
    }),
    'settings(/)': function () {
      // Because settings is a separate js app, we need to ensure navigating
      // from the content-server app passes along flow parameters.
      const { deviceId, flowBeginTime, flowId } =
        this.metrics.getFlowEventMetadata();
      const {
        broker,
        context: ctx,
        isSampledUser,
        service,
        uniqueUserId,
      } = this.metrics.getFilteredData();

      // Some flows can specify a redirect url after a client has logged in. This is
      // useful when you want to ensure the user has authenticated. Our GQL client
      // also sets the `redirect_to` param if a user attempts to navigate directly
      // to a section in settings
      const searchParams = new URLSearchParams(this.window.location.search);
      const redirectUrl = searchParams.get('redirect_to');
      if (redirectUrl) {
        if (!this.isValidRedirect(redirectUrl, this.config.redirectAllowlist)) {
          throw new Error('Invalid redirect!');
        }
        return this.navigateAway(redirectUrl);
      }

      // All other flows should redirect to the settings page
      const settingsEndpoint = '/settings';
      const settingsLink = `${settingsEndpoint}${Url.objToSearchString({
        deviceId,
        flowBeginTime,
        flowId,
        broker,
        context: ctx,
        isSampledUser,
        service,
        uniqueUserId,
      })}`;
      this.navigateAway(settingsLink);
    },
    'signin(/)': function () {
      this.createReactOrBackboneViewHandler('signin', SignInPasswordView, {
        // see comment in fxa-settings/src/pages/Signin/container.tsx for param explanation
        ...Url.searchParams(this.window.location.search),
        email: this.user.get('emailFromIndex'),
        hasLinkedAccount: this.user.get('hasLinkedAccount'),
        hasPassword: this.user.get('hasPassword'),
      });
    },
    'signin_bounced(/)': function () {
      this.createReactOrBackboneViewHandler(
        'signin_bounced',
        SignInBouncedView
      );
    },
    'signin_confirmed(/)': function () {
      this.createReactOrBackboneViewHandler(
        'signin_confirmed',
        ReadyView,
        null,
        {
          type: VerificationReasons.SIGN_IN,
        }
      );
    },
    'signin_permissions(/)': createViewHandler(PermissionsView, {
      type: VerificationReasons.SIGN_IN,
    }),
    'signin_recovery_code(/)': createViewHandler(SignInRecoveryCodeView),
    'signin_reported(/)': function () {
      this.createReactOrBackboneViewHandler(
        'signin_reported',
        SignInReportedView
      );
    },
    'signin_token_code(/)': function () {
      this.createReactOrBackboneViewHandler(
        'signin_token_code',
        SignInTokenCodeView,
        null,
        {
          type: VerificationReasons.SIGN_IN,
        }
      );
    },
    'signin_totp_code(/)': function () {
      this.createReactOrBackboneViewHandler(
        'signin_totp_code',
        SignInTotpCodeView
      );
    },
    'signin_unblock(/)': function () {
      this.createReactOrBackboneViewHandler(
        'signin_unblock',
        SignInUnblockView
      );
    },
    'signin_verified(/)': function () {
      this.createReactOrBackboneViewHandler(
        'signin_verified',
        ReadyView,
        null,
        {
          type: VerificationReasons.SIGN_IN,
        }
      );
    },
    'signup(/)': function () {
      this.createReactOrBackboneViewHandler('signup', SignUpPasswordView, {
        ...Url.searchParams(this.window.location.search),
        // see comment in fxa-settings/src/pages/Signup/container.tsx for param explanation
        email: this.user.get('emailFromIndex'),
        ...(this.user.get('emailFromIndex') && {
          emailStatusChecked: 'true',
        }),
      });
    },
    'signup_confirmed(/)': function () {
      this.createReactOrBackboneViewHandler(
        'signup_confirmed',
        ReadyView,
        null,
        {
          type: VerificationReasons.SIGN_UP,
        }
      );
    },
    'signup_permissions(/)': createViewHandler(PermissionsView, {
      type: VerificationReasons.SIGN_UP,
    }),
    'signup_verified(/)': function () {
      this.createReactOrBackboneViewHandler(
        'signup_verified',
        ReadyView,
        null,
        {
          type: VerificationReasons.SIGN_UP,
        }
      );
    },
    'subscriptions/products/:productId': createViewHandler(
      SubscriptionsProductRedirectView
    ),
    'subscriptions(/)': createViewHandler(SubscriptionsManagementRedirectView),
    'support(/)': createViewHandler(SupportView),
    'verify_email(/)': createViewHandler(CompleteSignUpView, {
      type: VerificationReasons.SIGN_UP,
    }),
    'verify_primary_email(/)': createViewHandler(CompleteSignUpView, {
      type: VerificationReasons.PRIMARY_EMAIL_VERIFIED,
    }),
    'verify_secondary_email(/)': createViewHandler(CompleteSignUpView, {
      type: VerificationReasons.SECONDARY_EMAIL_VERIFIED,
    }),
    'would_you_like_to_sync(/)': createViewHandler(WouldYouLikeToSync),
  },

  /**
   * Checks that 1) the feature flag is on, 2) the route is included in
   * react-app/index.js, and 3) that the user is in the React experiment.
   * @param routeName string
   * @returns boolean
   * */
  showReactApp(routeName) {
    const reactRouteGroups = this.getReactRouteGroups();
    for (const routeGroup in reactRouteGroups) {
      if (
        reactRouteGroups[routeGroup].routes.find((route) => routeName === route)
      ) {
        return (
          reactRouteGroups[routeGroup].featureFlagOn &&
          (this.isInReactExperiment() ||
            reactRouteGroups[routeGroup].fullRollout === true)
        );
      }
    }
    return false;
  },

  getReactRouteGroups() {
    return getClientReactRouteGroups(this.config.showReactApp);
  },

  createReactViewHandler(routeName, additionalParams) {
    const { deviceId, flowBeginTime, flowId } =
      this.metrics.getFlowEventMetadata();

    const link = `/${routeName}${Url.objToSearchString({
      showReactApp: true,
      deviceId,
      flowBeginTime,
      flowId,
      ...additionalParams,
    })}`;

    this.navigateAway(link);
  },

  createReactOrBackboneViewHandler(
    routeName,
    ViewOrPath, // for backbone
    additionalParams, // for react
    backboneViewOptions
  ) {
    const showReactApp = this.showReactApp(routeName);
    if (showReactApp) {
      this.createReactViewHandler(routeName, additionalParams);
    } else {
      return getView(ViewOrPath).then((View) => {
        return this.showView(View, backboneViewOptions);
      });
    }
  },

  onNavigate(event) {
    if (event.server) {
      return this.navigateAway(event.url);
    }

    this.navigate(event.url, event.nextViewData, event.routerOptions);
  },

  onNavigateBack(event) {
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
  navigate(url, nextViewData = {}, options = {}) {
    url = this.broker.transformLink(url);

    if (options.replace && this._viewModelStack.length) {
      this._viewModelStack[this._viewModelStack.length - 1] =
        createViewModel(nextViewData);
    } else {
      this._viewModelStack.push(createViewModel(nextViewData));
    }

    // eslint-disable-next-line no-prototype-builtins
    if (!options.hasOwnProperty('trigger')) {
      options.trigger = true;
    }

    // If the URL to navigate to has the origin as a prefix,
    // remove the origin and just use from the path on. This
    // prevents a situation where for url=http://accounts.firefox.com/settings,
    // backbone sending the user to http://accounts.firefox.com/http://accounts.firefox.com/settings
    if (url.indexOf(this.window.location.origin) === 0) {
      url = url.replace(this.window.location.origin, '');
    }

    const shouldClearQueryParams = !!options.clearQueryParams;
    const hasQueryParams = /\?/.test(url);

    // If the caller has not asked us to clear the query params
    // and the new URL does not contain query params, propagate
    // the current query params to the next view.
    if (!shouldClearQueryParams && !hasQueryParams) {
      url = url + this.window.location.search;
    } else if (shouldClearQueryParams && hasQueryParams) {
      url = url.split('?')[0];
    }

    // With the conversion to react, we needed to pass bounced email address as a param
    // when redirecting to backbone email-first sign in/sign up
    // however, we don't want this param to follow like a bad smell
    // when the user enters a valid email and successfully navigates away
    const params = new URLSearchParams(url.split('?')[1]);
    if (params.get('bouncedEmail')) {
      const path = url.split('?')[0];
      params.delete('bouncedEmail');
      if (params.size) {
        url = path + '?' + params.toString();
      } else {
        url = path;
      }
    }

    if (this.window.location.hash) {
      url += this.window.location.hash;
    }

    return Backbone.Router.prototype.navigate.call(this, url, options);
  },

  /**
   * Checks to see if a url contains a host that we can redirect to. Supports relative paths as well
   * absolute urls.
   * @param {string} redirectLocation - location to redirect to
   * @param {string[]} allowlist - list of allowed hosts
   * @param {RegExp[]} A list of regular expressions to validate against
   */
  isValidRedirect(redirectLocation, allowlist) {
    return isAllowed(redirectLocation, window.location, allowlist);
  },

  /**
   * Navigate externally to the application, flushing the metrics
   * before doing so.
   *
   * @param {String} url
   * @returns {Promise}
   */
  async navigateAway(url) {
    // issue #5626: external links should not get transformed
    if (!/^https?:/.test(url)) {
      url = this.broker.transformLink(url);
    }

    await this.metrics.flush();

    // issue https://github.com/mozilla/fxa/issues/11917:
    // For mobile devices, we add a small delay before redirecting so that our metric
    // events get flushed properly. This is a workaround since they're
    // getting blocked on mobile devices when the flushing occurs too quickly.
    const userAgent = UserAgent(this.window.navigator.userAgent);
    if (userAgent && userAgent.device && userAgent.device.type === 'mobile') {
      return new Promise((resolve) => {
        setTimeout(() => {
          this.window.location.href = url;
          resolve();
        }, NAVIGATE_AWAY_IN_MOBILE_DELAY_MS);
      });
    }

    this.window.location.href = url;
  },

  /**
   * Go back one URL, combining the previous view's viewModel
   * with the data in `previousViewData`.
   *
   * @param {Object} [previousViewData={}]
   */
  navigateBack(previousViewData = {}) {
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
  getCurrentViewModel() {
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
  getViewOptions(options) {
    // passed in options block can override
    // default options.
    return _.extend(
      {
        canGoBack: this.canGoBack(),
        currentPage: this.getCurrentPage(),
        model: this.getCurrentViewModel(),
        viewName: this.getCurrentViewName(),
      },
      options
    );
  },

  /**
   * Is it possible to go back?
   *
   * @returns {Boolean}
   */
  canGoBack() {
    return !!this.storage.get('canGoBack');
  },

  /**
   * Get the pathname of the current page.
   *
   * @returns {String}
   */
  getCurrentPage() {
    const fragment = Backbone.history.fragment || '';
    // strip leading /
    return (
      fragment
        .replace(/^\//, '')
        // strip trailing /
        .replace(/\/$/, '')
        // we only want the pathname
        .replace(/\?.*/, '')
    );
  },

  getCurrentViewName() {
    return this.fragmentToViewName(this.getCurrentPage());
  },

  _afterFirstViewHasRendered() {
    // back is enabled after the first view is rendered or
    // if the user re-starts the app.
    this.storage.set('canGoBack', true);
  },

  _onEmailFirstFlow() {
    this._isEmailFirstFlow = true;

    // back is enabled for email-first so that
    // users can go back to the / screen from "Mistyped email".
    // The initial navigation to the next screen
    // happens before the / page is rendered, causing
    // `canGoBack` to not be set.
    this.storage.set('canGoBack', true);
  },

  fragmentToViewName(fragment) {
    fragment = fragment || '';
    // strip leading /
    return (
      fragment
        .replace(/^\//, '')
        // strip trailing /
        .replace(/\/$/, '')
        // any other slashes get converted to '.'
        .replace(/\//g, '.')
        // search params can contain sensitive info
        .replace(/\?.*/, '')
        // replace _ with -
        .replace(/_/g, '-')
    );
  },

  /**
   * Notify the system a new View should be shown.
   *
   * @param {Function} View - view constructor
   * @param {Object} [options]
   */
  showView(View, options) {
    this.notifier.trigger('show-view', View, this.getViewOptions(options));
  },

  /**
   * Notify the system a new ChildView should be shown.
   *
   * @param {Function} ChildView - view constructor
   * @param {Function} ParentView - view constructor,
   *     the parent of the ChildView
   * @param {Object} [options]
   */
  showChildView(ChildView, ParentView, options) {
    this.notifier.trigger(
      'show-child-view',
      ChildView,
      ParentView,
      this.getViewOptions(options)
    );
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
  createChildViewHandler: createChildViewHandler,
});

export default Router;
