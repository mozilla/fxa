/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import SigninMixin from './signin-mixin';
import Storage from '../../lib/storage';
import Url from '../../lib/url';

const GOOGLE_CLIENT_ID =
  '210899493109-gll5587a3bo8huare772alo08734o4kh.apps.googleusercontent.com';
// Google's OAuth 2.0 endpoint for requesting an access token
const OAUTH2_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const REDIRECT_URI =
  'http://localhost:3030/post_verify/third_party_auth/callback';

export default {
  dependsOn: [SigninMixin],

  events: {
    'click #google-login-button': 'googleSignIn',
  },

  initialize(options) {
    options = options || {};
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
    const form = document.createElement('form');
    form.setAttribute('method', 'GET');
    form.setAttribute('action', OAUTH2_ENDPOINT);

    const params = {
      client_id: GOOGLE_CLIENT_ID,
      scope: 'openid email profile',
      redirect_uri: REDIRECT_URI,
      state,
      access_type: 'offline',
      prompt: 'consent',
      response_type: 'code',
    };
    for (const p in params) {
      const input = document.createElement('input');
      input.setAttribute('type', 'hidden');
      input.setAttribute('name', p);
      input.setAttribute('value', params[p]);
      form.appendChild(input);
    }
    document.body.appendChild(form);
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
