/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import SigninMixin from './signin-mixin';
import Storage from '../../lib/storage';
import Url from '../../lib/url';
import ThirdPartyAuthExperimentMixin from '../../views/mixins/third-party-auth-experiment-mixin';

const DEFAULT_SCOPES = 'openid email profile';

export default {
  dependsOn: [SigninMixin, ThirdPartyAuthExperimentMixin],

  events: {
    'click #google-login-button': 'googleSignIn',
  },

  setInitialContext(context) {
    context.set({
      isInThirdPartyAuthExperiment: this.isInThirdPartyAuthExperiment(),
    });
  },

  navigateToThirdPartyAuth() {
    const params = new URLSearchParams(this.window.location.search);
    params.set('thirdPartyAuth', 'true');
    const newUrl = `${this.window.location.origin}/auth?${params.toString()}`;
    return this.navigateAway(newUrl);
  },

  navigateAwayThirdPartyAuth(url, email, options) {
    const params = new URLSearchParams(this.window.location.search);
    params.set('email', email);
    const newUrl = `${this.window.location.origin}/${url}?${params.toString()}`;
    return this.navigateAway(newUrl);
  },

  beforeRender() {
    // Check to see if this page is being redirected to at the end of a
    // Google auth flow and if so, restore the original
    // query params and complete the FxA oauth signin
    const thirdPartyAuth = Storage.factory('localStorage', this.window).get(
      'fxa_third_party_params'
    );
    if (thirdPartyAuth) {
      return this.completeSignIn();
    } else if (
      this.isInThirdPartyAuthExperiment() &&
      this.window.location.pathname !== '/auth'
    ) {
      const params = new URLSearchParams(this.window.location.search);
      if (!params.get('thirdPartyAuth')) {
        return this.navigateToThirdPartyAuth();
      }
    }
  },

  clearStoredParams() {
    Storage.factory('localStorage', this.window).remove(
      'fxa_third_party_params'
    );
  },

  googleSignIn() {
    this.clearStoredParams();

    // We stash originating location in the Google state oauth param
    // because we will need it to use it to log the user into FxA
    const state = encodeURIComponent(this.window.location.href);

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
    Storage.factory('localStorage', this.window).set(
      'fxa_third_party_params',
      searchParams
    );

    const redirectUrl = decodeURIComponent(searchParams.state);
    this.navigateAway(redirectUrl);
  },

  completeSignIn() {
    const account = this.getSignedInAccount();
    const authParams = Storage.factory('localStorage', this.window).get(
      'fxa_third_party_params'
    );
    const code = authParams.code;

    return this.user
      .verifyAccountThirdParty(account, this.relier, code)
      .then((updatedAccount) => {
        this.clearStoredParams();
        return this.signIn(updatedAccount);
      })
      .catch(() => {
        this.clearStoredParams();
      });
  },
};
