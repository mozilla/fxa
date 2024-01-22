/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { TERMS_PRIVACY_REGEX } = require('./content-server-routes');

/**
 * When you're ready to serve the React version of a page, identify which feature flag
 * group object it should go in and add a new object in `routes` by calling `.getRoute`
 * or setting `routes` with `.getRoutes` on the react route object.
 *
 * If a routeGroup should always be rendered with React in production, set `fullProdRollout` to true.
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
      featureFlagOn: showReactApp.simpleRoutes,
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
      fullProdRollout: true,
    },

    resetPasswordRoutes: {
      featureFlagOn: showReactApp.resetPasswordRoutes,
      routes: reactRoute.getRoutes([
        'reset_password',
        'complete_reset_password',
        'confirm_reset_password',
        'reset_password_verified',
        'reset_password_with_recovery_key_verified',
        'account_recovery_confirm_key',
        'account_recovery_reset_password',
      ]),
      fullProdRollout: true,
    },

    oauthRoutes: {
      featureFlagOn: showReactApp.oauthRoutes,
      routes: [],
      fullProdRollout: false,
    },

    signInRoutes: {
      featureFlagOn: showReactApp.signInRoutes,
      routes: reactRoute.getRoutes([
        'signin_reported',
        'signin_confirmed',
        'signin_verified',
        'signin_bounced',
      ]),
      fullProdRollout: false,
    },

    signUpRoutes: {
      featureFlagOn: showReactApp.signUpRoutes,
      routes: reactRoute.getRoutes([
        'signup',
        'confirm',
        'confirm_signup_code',
        'primary_email_verified',
        'signup_confirmed',
        'signup_verified',
        'oauth/signup',
      ]),
      fullProdRollout: true,
    },

    pairRoutes: {
      featureFlagOn: showReactApp.pairRoutes,
      routes: [],
      fullProdRollout: false,
    },

    postVerifyOtherRoutes: {
      featureFlagOn: showReactApp.postVerifyOtherRoutes,
      routes: [],
      fullProdRollout: false,
    },

    postVerifyCADViaQRRoutes: {
      featureFlagOn: showReactApp.postVerifyCADViaQRRoutes,
      routes: [],
      fullProdRollout: false,
    },

    postVerifyThirdPartyAuthRoutes: {
      featureFlagOn: showReactApp.postVerifyThirdPartyAuthRoutes,
      routes: reactRoute.getRoutes([
        'post_verify/third_party_auth/callback',
        'post_verify/third_party_auth/set_password',
      ]),
      fullProdRollout: false,
    },

    webChannelExampleRoutes: {
      featureFlagOn: showReactApp.webChannelExampleRoutes,
      routes: reactRoute.getRoutes(['web_channel_example']),
      fullProdRollout: false,
    },
  };
};

module.exports = {
  getReactRouteGroups,
};
