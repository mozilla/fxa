/**
 *
 */

/* eslint-disable */

$(document).ready(function () {
  detectCompletePkceFlow();

  $('button.signin-pkce').click(function (ev) {
    authenticatePkce();
  });
});

/**
 * Starts a FxA OAuth Pkce flow
 */
function authenticatePkce() {
  $.getJSON('/api/login').done(function (data) {
    const codeVerifier = createRandomString(32);
    console.log('codeVerifier', codeVerifier);
    sha256(codeVerifier).then(function (res) {
      const codeChallenge = btoa(
        String.fromCharCode.apply(null, new Uint8Array(res))
      )
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/\=+$/, '');
      localStorage.setItem('pkceCodeVerifier', codeVerifier);

      var queryParams = {
        client_id: data.pkce_client_id,
        state: data.state,
        scope: 'profile',
        response_type: 'code',
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
      };
      window.location.href =
        data.authorization_endpoint + objectToQueryString(queryParams);
    });
  });
}

/**
 * Detects if 123done got a redirect via PKCE
 * Fetches profile data if so
 */
function detectCompletePkceFlow() {
  var params = new URLSearchParams(window.location.href);

  // if we detect a PKCE "Public Client" redirect
  if (params.has('code')) {
    var code = params.get('code');

    $.getJSON('/api/login').done(function (config) {
      var tokenHeaders = new Headers();
      tokenHeaders.append('Content-Type', 'application/json');

      return fetch(
        new Request(config.token_endpoint, {
          method: 'POST',
          headers: tokenHeaders,
          body: JSON.stringify({
            code: code,
            client_id: config.pkce_client_id,
            code_verifier: localStorage.getItem('pkceCodeVerifier'),
          }),
        })
      )
        .then(function (response) {
          if (response.status === 200) return response.json();
          else throw new Error('Something went wrong on api server!');
        })
        .then(function (token) {
          var profileHeaders = new Headers();
          profileHeaders.append('Content-Type', 'application/json');
          profileHeaders.append(
            'Authorization',
            'Bearer ' + token.access_token
          );

          return fetch(
            new Request(config.userinfo_endpoint, {
              method: 'GET',
              headers: profileHeaders,
            })
          );
        })
        .then(function (response) {
          if (response.status === 200) return response.json();
          else throw new Error('Something went wrong on api server!');
        })
        .then(function (profile) {
          $('.signin-pkce').hide();
          $('.pkce-data').text('PKCE Flow Complete:' + JSON.stringify(profile));
          console.log('profile', profile);
        })
        .catch(function (error) {
          console.error(error);
        });
    }); // configData ends
  }
}

// Util functions
function str2base64url(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
}
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

/**
 * Create a query parameter string from a key and value
 *
 * @method createQueryParam
 * @param {String} key
 * @param {Variant} value
 * @returns {String}
 * URL safe serialized query parameter
 */
function createQueryParam(key, value) {
  return encodeURIComponent(key) + '=' + encodeURIComponent(value);
}

/**
 * Create a query string out of an object.
 * @method objectToQueryString
 * @param {Object} obj
 * Object to create query string from
 * @returns {String}
 * URL safe query string
 */
function objectToQueryString(obj) {
  var queryParams = [];

  for (var key in obj) {
    queryParams.push(createQueryParam(key, obj[key]));
  }

  return '?' + queryParams.join('&');
}
