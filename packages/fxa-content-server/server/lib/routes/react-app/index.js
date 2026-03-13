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
    emailFirstRoutes: {
      featureFlagOn: showReactApp.emailFirstRoutes,
      // the order of the routes in the array is important.  do not put '/'
      // first.
      routes: reactRoute.getRoutes([
        'authorization',
        // NOTE: 'oauth' is currently a weird case because because Fx desktop uses
        // it to initiate the pairing flow. We have logic at the Express level to
        // handle showing React/Backbone for this route until pairing is Reactified.
        'oauth',
        '/',
      ]),
      fullProdRollout: true,
    },
    simpleRoutes: {
      featureFlagOn: showReactApp.simpleRoutes,
      routes: reactRoute.getRoutes([
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
        'signin',
        'oauth/signin',
        'oauth/force_auth',
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
        'signin_recovery_code',
        'signin_recovery_choice',
        'signin_recovery_phone',
        'inline_totp_setup',
        'inline_recovery_setup',
        'inline_recovery_key_setup',
        'signin_push_code',
        'signin_push_code_confirm',
        'signin_passwordless_code',
        'oauth/signin_passwordless_code',
      ]),
      fullProdRollout: true,
    },

    signUpRoutes: {
      featureFlagOn: showReactApp.signUpRoutes,
      routes: reactRoute.getRoutes([
        'signup',
        'confirm_signup_code',
        'primary_email_verified',
        'signup_confirmed',
        'signup_verified',
        'signup_confirmed_sync',
        'oauth/signup',
      ]),
      fullProdRollout: true,
    },

    pairRoutes: {
      featureFlagOn: showReactApp.pairRoutes,
      // Note: The '/oauth?channel_id=...' route for Fx Desktop authority entry is handled
      // separately in add-routes.js — it bypasses to Backbone unless pairRoutes is enabled.
      routes: reactRoute.getRoutes([
        'pair',
        'pair/supp',
        'pair/supp/allow',
        'pair/supp/wait_for_auth',
        'pair/success',
        'pair/auth/allow',
        'pair/auth/wait_for_supp',
        'pair/auth/complete',
        'pair/auth/totp',
        'pair/failure',
        'pair/unsupported',
      ]),
      fullProdRollout: true,
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
        // NOTE: This is not a third party auth route, but it must be added
        // to a react-app.index.js list so if users refresh on the page,
        // Express points to React.
        'post_verify/service_welcome',
      ]),
      fullProdRollout: true,
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
