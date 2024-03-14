/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { TERMS_PRIVACY_REGEX } = require('./content-server-routes');

/**
 * When you're ready to serve the React version of a page, identify which feature flag
 * group object it should go in and add a new object in `routes` by calling `.getRoute`
 * or setting `routes` with `.getRoutes` on the react route object.
 *
 * If a routeGroup should always be rendered with React in production, set `fullRollout` to true.
 * These routes can still be turned off on SRE side by switching featureFlagOn to false
 * on stage or prod for the relevant route if needed. React will ALWAYS be off for the routeGroup
 * if featureFlagOn is set to false.
 *
 * NOTE however that routes that have been sunset in content-server (i.e, simple routes) can no longer
 * fall back to backbone.
 *
 * When setting a regex, the corresponding matches for `router.js` must be set in
 * `react-route-client.js`.
 *  @type {import("./types").GetReactRouteGroups}
 */
const getReactRouteGroups = (showReactApp, reactRoute) => {
  return {
    simpleRoutes: {
      featureFlagOn: showReactApp.simpleRoutes.enabled,
      routes: reactRoute.getRoutes([
        'cannot_create_account',
        'clear',
        'cookies_disabled',
        'legal',
        // Match (allow for optional trailing slash):
        // * /legal/terms
        // * /<locale>/legal/terms
        // * /legal/privacy
        // * /<locale>/legal/privacy
        TERMS_PRIVACY_REGEX,
      ]),
      fullRollout: showReactApp.simpleRoutes.fullRollout,
    },

    resetPasswordRoutes: {
      featureFlagOn: showReactApp.resetPasswordRoutes.enabled,
      routes: reactRoute.getRoutes([
        'reset_password',
        'complete_reset_password',
        'confirm_reset_password',
        'reset_password_verified',
        'reset_password_with_recovery_key_verified',
        'account_recovery_confirm_key',
        'account_recovery_reset_password',
      ]),
      fullRollout: showReactApp.resetPasswordRoutes.fullRollout,
    },

    // TODO: in FXA-9279 verify if we can remove this route group
    // (routes included in signin/signup)
    oauthRoutes: {
      featureFlagOn: showReactApp.oauthRoutes.enabled,
      routes: [],
      fullRollout: showReactApp.oauthRoutes.fullRollout,
    },

    signInRoutes: {
      featureFlagOn: showReactApp.signInRoutes.enabled,
      routes: reactRoute.getRoutes([
        'signin',
        'oauth/signin',
        'signin_token_code',
        'signin_totp_code',
        'signin_reported',
        'signin_confirmed',
        'signin_verified',
        'signin_bounced',
        'report_signin',
        'complete_signin',
        'signin_unblock',
        'force_auth',
      ]),
      fullRollout: showReactApp.signInRoutes.fullRollout,
    },

    signUpRoutes: {
      featureFlagOn: showReactApp.signUpRoutes.enabled,
      routes: reactRoute.getRoutes([
        'signup',
        'confirm_signup_code',
        'primary_email_verified',
        'signup_confirmed',
        'signup_verified',
        'oauth/signup',
      ]),
      fullRollout: showReactApp.signUpRoutes.fullRollout,
    },

    pairRoutes: {
      featureFlagOn: showReactApp.pairRoutes.enabled,
      routes: [],
      fullRollout: showReactApp.pairRoutes.fullRollout,
    },

    postVerifyOtherRoutes: {
      featureFlagOn: showReactApp.postVerifyOtherRoutes.enabled,
      routes: [],
      fullRollout: showReactApp.postVerifyOtherRoutes.fullRollout,
    },

    postVerifyCADViaQRRoutes: {
      featureFlagOn: showReactApp.postVerifyCADViaQRRoutes.enabled,
      routes: [],
      fullRollout: showReactApp.postVerifyCADViaQRRoutes.fullRollout,
    },

    postVerifyThirdPartyAuthRoutes: {
      featureFlagOn: showReactApp.postVerifyThirdPartyAuthRoutes.enabled,
      routes: reactRoute.getRoutes([
        'post_verify/third_party_auth/callback',
        'post_verify/third_party_auth/set_password',
      ]),
      fullRollout: showReactApp.postVerifyThirdPartyAuthRoutes.fullRollout,
    },

    webChannelExampleRoutes: {
      featureFlagOn: showReactApp.webChannelExampleRoutes.enabled,
      routes: reactRoute.getRoutes(['web_channel_example']),
      fullRollout: showReactApp.webChannelExampleRoutes.fullRollout,
    },

    inlineTotpRoutes: {
      featureFlagOn: showReactApp.inlineTotpRoutes.enabled,
      routes: reactRoute.getRoutes([
        'inline_totp_setup',
        'inline_recovery_setup',
      ]),
      fullRollout: showReactApp.inlineTotpRoutes.fullRollout,
    },
  };
};

module.exports = {
  getReactRouteGroups,
};
