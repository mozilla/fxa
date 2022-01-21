/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import SigninMixin from './signin-mixin';

const GOOGLE_CLIENT_ID =
  '218517873053-th4taguk9dvf03rrgk8sigon84oigf5l.apps.googleusercontent.com';

// class GoogleAuth {
//
//   USER_INFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo';
//   // Google's OAuth 2.0 endpoint for requesting an access token
//   OAUTH2_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
//
//   getUserInfo(accessToken) {
//
//   }
//
//   oauth2SignIn() {
//     // Create element to open OAuth 2.0 endpoint in new window.
//     const form = document.createElement('form');
//     form.setAttribute('method', 'GET');
//     form.setAttribute('action', this.OAUTH2_ENDPOINT);
//
//     // Parameters to pass to OAuth 2.0 endpoint.
//     const params = {
//       'client_id': this.GOOGLE_CLIENT_ID,
//       'scope': 'openid email profile',
//       'redirect_uri': 'http://localhost:3030/oauth/signin',
//       'state': 'try_sample_request',
//       'include_granted_scopes': 'true',
//       'response_type': 'token'
//     };
//
//     // Add form parameters as hidden input values.
//     for (const p in params) {
//       const input = document.createElement('input');
//       input.setAttribute('type', 'hidden');
//       input.setAttribute('name', p);
//       input.setAttribute('value', params[p]);
//       form.appendChild(input);
//     }
//
//     // Add form to page and submit it to open the OAuth 2.0 endpoint.
//     document.body.appendChild(form);
//     form.submit();
//   }
// }

export default {
  dependsOn: [SigninMixin],

  events: {
    'click #google-login-button': 'oauth2SignIn',
  },

  initialize(options) {
    options = options || {};
  },

  afterVisible() {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = this.initializeGoogleAuth.bind(this);
    script.async = true;
    script.defer = true;
    script.id = 'google-client-script';
    document.querySelector('body')?.appendChild(script);
    this.loaded = false;
  },

  initializeGoogleAuth() {
    if (!window.google || this.loaded) {
      return;
    }

    this.loaded = true;
    window.google.accounts.id.initialize({
      // eslint-disable-next-line camelcase
      client_id: GOOGLE_CLIENT_ID,
      callback: this.handleGoogleSignIn.bind(this),
    });

    window.google.accounts.id.renderButton(
      document.getElementById('google-auth-button'),
      {
        text: 'continue_with',
      }
    );
  },

  oauth2SignIn() {
    // Create element to open OAuth 2.0 endpoint in new window.
    const form = document.createElement('form');
    form.setAttribute('method', 'GET');
    form.setAttribute('action', this.OAUTH2_ENDPOINT);

    // Parameters to pass to OAuth 2.0 endpoint.
    const params = {
      client_id: this.GOOGLE_CLIENT_ID,
      scope: 'openid email profile',
      // 'redirect_uri': 'http://localhost:3030/oauth/signin',
      state: 'try_sample_request',
      include_granted_scopes: 'true',
      response_type: 'token',
    };

    // Add form parameters as hidden input values.
    for (const p in params) {
      const input = document.createElement('input');
      input.setAttribute('type', 'hidden');
      input.setAttribute('name', p);
      input.setAttribute('value', params[p]);
      form.appendChild(input);
    }

    // Add form to page and submit it to open the OAuth 2.0 endpoint.
    document.body.appendChild(form);
    form.submit();
  },

  handleGoogleSignIn(data) {
    const account = this.getSignedInAccount();
    this.user
      .verifyAccountThirdParty(account, this.relier, JSON.stringify(data))
      .then((updatedAccount) => {
        return this.signIn(updatedAccount);
      });
  },
};
