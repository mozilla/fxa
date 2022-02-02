/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import SigninMixin from './signin-mixin';
import Storage from '../../lib/storage';
import Url from '../../lib/url';
import ThirdPartyAuthExperimentMixin from '../../views/mixins/third-party-auth-experiment-mixin';

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

  beforeRender() {
    // Check to see if this page is being redirected to at the end of a
    // Google auth flow and if so, restore the original
    // query params and complete the FxA oauth signin
    const thirdPartyAuth = Storage.factory('localStorage').get(
      'fxa_third_party_params'
    );
    if (thirdPartyAuth) {
      return this.completeSignIn();
    }
  },

  clearStoredParams() {
    Storage.factory('localStorage').remove('fxa_third_party_params');
  },

  googleSignIn() {
    this.clearStoredParams();

    // We stash all FxA oauth params in the Google state oauth param
    // because we will need it to use it to log the user into FxA
    const state = encodeURIComponent(this.window.location.search);

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
      scope: 'openid email profile',
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
    const searchParams = Url.searchParams(this.window.location.search);
    Storage.factory('localStorage').set('fxa_third_party_params', searchParams);

    // Go back to fxa oauth page to complete the original login request
    const oauthState = decodeURIComponent(searchParams.state);
    this.navigateAway(`/oauth/${oauthState}`);
  },

  completeSignIn() {
    const account = this.getSignedInAccount();
    const authParams = Storage.factory('localStorage').get(
      'fxa_third_party_params'
    );
    const code = authParams.code;

    return this.user
      .verifyAccountThirdParty(account, this.relier, code)
      .then((updatedAccount) => {
        this.clearStoredParams();
        return this.signIn(updatedAccount);
      })
      .catch((err) => {
        this.clearStoredParams();
      });
  },
};
