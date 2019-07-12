/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const PaymentServer = {
  navigateToPaymentServer(view, subscriptionsConfig, redirectPath) {
    const { managementClientId, managementScopes } = subscriptionsConfig;

    // The payments page is a "public" client meaning it doesn't have a client_secret
    // to use to trade OAuth codes for access tokens. Instead, we have to use
    // Proof Key for Code Exchange (PKCE). See https://tools.ietf.org/html/rfc7636.
    // The way this works is when generating a code, we store a secret along with
    // the code. To get the token associated with the code, we have to prove we
    // know the secret. The secret stored with the code is actually a hash of
    // the secret, and it's called the code_challenge. When we trade the code
    // for the token, we send the actual secret (called code_verifier), and the
    // backend calculates the code_challenge from the sent code_verifier and compares
    // that with the stored code_challenge. If the two are a match, then we
    // have proven we know the secret and are given the token.

    // Now, in a PKCE flow, we need the following info when calling /token
    // * code
    // * state
    // * client_id
    // * code_verifier

    // When we create the code, a redirect_uri is returned that contains both
    // the state and code. We don't need to store those anywhere. The payments
    // server knows its client_id. What we need to transmit to the payments server
    // is the code_verifier, and we don't want to do this in the URL so that we
    // can prevent phishing. Remember, code_verifier is a secret, we have to keep
    // it a secret.

    // So, we store it in a cookie. We send the state and code_verifier to the
    // backend. The backend stores those in a cookie that is scoped /payments-pkce
    // path, and will only be returned if the requesting origin is the payments server.
    // We do not store the code in the cookie since that would give the content
    // server knowledge of everything needed to get the token.

    // Once the cookie is set, we redirect to the payments server.
    // The payments server gets the state and code out of the URL. It now needs
    // to get the code_verifier (and a verification `state` from the backend by calling
    // GET /payments-pkce. It compares the URL state to the cookie state to ensure
    // it's not a strange phishing attack. It then gets the last bit
    // of necessary info to get the token, the code_verifier.

    // With all the parameters necessary, we then go trade the authorization code
    // for the access token (and refresh token since we request access_type: offline).

    const codeVerifier = base64UrlEncode(createRandomString(64));
    const state = createRandomString(32);
    const account = view.getSignedInAccount();

    return codeVerifierToCodeChallenge(codeVerifier)
      .then(codeChallenge => {
        console.log('codeChallenge', codeChallenge);
        console.log('codeVerifier', codeVerifier);
        console.log('state', state);

        return Promise.all([
          account.createOAuthCode(managementClientId, state, {
            access_type: 'offline',
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
            scope: managementScopes,
          }),
          fetch('/payments-pkce', {
            body: JSON.stringify({
              // eslint-disable-next-line camelcase
              code_verifier: codeVerifier,
              state,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
          }),
        ]);
      })
      .then(([response]) => {
        view.navigateAway(response.redirect);
      });
  },
};

function sha256(str) {
  var buffer = new TextEncoder('utf-8').encode(str);
  return crypto.subtle.digest('SHA-256', buffer);
}

function createRandomString(length) {
  if (length <= 0) {
    return '';
  }
  var _state = '';
  var possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  for (var i = 0; i < length; i++) {
    _state += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return _state;
}

function codeVerifierToCodeChallenge(codeVerifier) {
  return sha256(codeVerifier).then(res => {
    return base64UrlEncode(
      String.fromCharCode.apply(null, new Uint8Array(res))
    );
  });
}

function base64UrlEncode(str) {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/\=+$/, '');
}
export default PaymentServer;
