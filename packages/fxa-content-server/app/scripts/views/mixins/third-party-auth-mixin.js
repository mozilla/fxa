/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import GleanMetrics from '../../lib/glean';
import SigninMixin from './signin-mixin';
import Storage from '../../lib/storage';
import Url from '../../lib/url';
import FlowEventsMixin from '../mixins/flow-events-mixin';

const DEFAULT_SCOPES = 'openid email profile';

export default {
  dependsOn: [SigninMixin, FlowEventsMixin],

  events: {
    'click #google-login-button': 'googleSignIn',
    'click #apple-login-button': 'appleSignIn',
  },

  initialize() {
    // Flow events need to be initialized before the navigation
    // so the flow_id and flow_begin_time are propagated
    this.initializeFlowEvents();
  },

  beforeRender() {
    // Check to see if this is a request to deeplink into Google/Apple login
    // flow. A bit of a hack but we do a promise to keep our loading indicator on while
    // page navigates to third party auth flow.
    const params = new URLSearchParams(this.window.location.search);
    if (params.get('deeplink') === 'googleLogin') {
      this.logFlowEvent('google.deeplink');
      return new Promise(() => {
        this.googleSignIn();
      });
    } else if (params.get('deeplink') === 'appleLogin') {
      this.logFlowEvent('apple.deeplink');
      return new Promise(() => {
        this.appleSignIn();
      });
    }

    // Check to see if this page is being redirected to at the end of a
    // Google auth flow and if so, restore the original
    // query params and complete the FxA oauth signin
    const thirdPartyAuth = Storage.factory('localStorage', this.window).get(
      'fxa_third_party_params'
    );

    // Since this mixin is loaded from multiple views it is possible to have
    // a race condition and call complete multiple times. We only want to call it
    // on the `enter-email` view.
    if (thirdPartyAuth && this.viewName === 'enter-email') {
      return this.completeSignIn();
    }

    // TODO: determine if we want to log this event for all views,
    // or not at all since this component is no longer behind an experiment flag
    this.logViewEvent('thirdPartyAuth');
  },

  clearStoredParams() {
    Storage.factory('localStorage', this.window).remove(
      'fxa_third_party_params'
    );
  },

  googleSignIn() {
    this.clearStoredParams();

    this.logFlowEvent('google.oauth-start');

    if (this.viewName === 'enter-email') {
      GleanMetrics.emailFirst.googleOauthStart();
    }

    // We stash originating location in the Google state oauth param
    // because we will need it to use it to log the user into FxA
    const currentParams = new URLSearchParams(this.window.location.search);

    if (this.metrics) {
      const metrics = this.metrics.getFlowEventMetadata();
      currentParams.append('flowId', metrics.flowId);
      currentParams.append('flowBeginTime', metrics.flowBeginTime);
      currentParams.append('deviceId', metrics.deviceId);
    }

    currentParams.delete('deeplink');

    const state = encodeURIComponent(
      `${this.window.location.origin}${
        this.window.location.pathname
      }?${currentParams.toString()}`
    );

    // To avoid any CORs issues we create element to store the
    // params need for the request and do a form submission
    const form = this.window.document.createElement('form');
    form.setAttribute('method', 'GET');
    form.setAttribute(
      'action',
      this.config.googleAuthConfig.authorizationEndpoint
    );

    /* eslint-disable camelcase */
    const params = {
      client_id: this.config.googleAuthConfig.clientId,
      scope: DEFAULT_SCOPES,
      redirect_uri: this.config.googleAuthConfig.redirectUri,
      state,
      access_type: 'offline',
      prompt: 'consent',
      response_type: 'code',
      disallow_webview: true,
      ack_webview_shutdown: '2024-09-30',
    };
    /* eslint-enable camelcase */
    for (const p in params) {
      const input = this.window.document.createElement('input');
      input.setAttribute('type', 'hidden');
      input.setAttribute('name', p);
      input.setAttribute('value', params[p]);
      form.appendChild(input);
    }
    this.window.document.body.appendChild(form);

    form.submit();
  },

  appleSignIn() {
    this.clearStoredParams();

    this.logFlowEvent('apple.oauth-start');

    if (this.viewName === 'enter-email') {
      GleanMetrics.emailFirst.appleOauthStart();
    }

    const currentParams = new URLSearchParams(this.window.location.search);

    if (this.metrics) {
      const metrics = this.metrics.getFlowEventMetadata();
      currentParams.append('flowId', metrics.flowId);
      currentParams.append('flowBeginTime', metrics.flowBeginTime);
      currentParams.append('deviceId', metrics.deviceId);
    }

    currentParams.delete('deeplink');

    const state = encodeURIComponent(
      `${this.window.location.origin}${
        this.window.location.pathname
      }?${currentParams.toString()}`
    );

    // To avoid any CORs issues we create element to store the
    // params need for the request and do a form submission
    const form = this.window.document.createElement('form');
    form.setAttribute('method', 'GET');
    form.setAttribute(
      'action',
      this.config.appleAuthConfig.authorizationEndpoint
    );

    /* eslint-disable camelcase */
    const params = {
      client_id: this.config.appleAuthConfig.clientId,
      scope: 'email',
      redirect_uri: this.config.appleAuthConfig.redirectUri,
      state,
      access_type: 'offline',
      prompt: 'consent',
      response_type: 'code id_token',
      response_mode: 'form_post',
    };
    /* eslint-enable camelcase */
    for (const p in params) {
      const input = this.window.document.createElement('input');
      input.setAttribute('type', 'hidden');
      input.setAttribute('name', p);
      input.setAttribute('value', params[p]);
      form.appendChild(input);
    }
    this.window.document.body.appendChild(form);

    form.submit();
  },

  handleOauthResponse() {
    // To finish the oauth flow, we will need to stash away the response from
    // Google (contains state and code) and redirect back to the original FxA login page.
    const searchParams = Url.searchParams(this.window.location.search);
    const redirectUrl = decodeURIComponent(searchParams.state);

    try {
      const url = new URL(redirectUrl);

      if (url.origin === this.window.location.origin) {
        Storage.factory('localStorage', this.window).set(
          'fxa_third_party_params',
          searchParams
        );

        this.navigateAway(redirectUrl);
        return;
      }
    } catch (e) {
      // noop. navigate to home below.
    }

    this.navigateAway('/');
  },

  async completeSignIn() {
    const account = this.getSignedInAccount();
    const authParams = Storage.factory('localStorage', this.window).get(
      'fxa_third_party_params'
    );
    const code = authParams.code;
    const provider = authParams.provider || 'google';

    return this.user
      .verifyAccountThirdParty(account, this.relier, code, provider)
      .then((updatedAccount) => {
        this.clearStoredParams();

        this.logFlowEvent(`${provider}.signin-complete`);

        this.metrics.flush();

        // Sync service requires a password to be set before it can be used.
        // Note that once a password is set, the user will not have an option to use
        // third party login for Sync since it always requires a password.
        if (this.relier.isSync()) {
          return this.navigate('/post_verify/third_party_auth/set_password', {
            provider,
          });
        }

        return this.signIn(updatedAccount);
      })
      .catch(() => {
        this.clearStoredParams();
      });
  },
};
