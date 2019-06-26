/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/* global require, module */

var express = require('express');
var crypto = require('crypto');
var request = require('request');
var Promise = require('bluebird');

var router = express.Router();
var redirectUrl = require('./lib/oauth').redirectUrl;
var requestToken = require('./lib/oauth').requestToken;
var config = require('../config');
var baseUrl = config.get('base_url');
var fxaOAuthConfig = config.get('fxaOAuth');
var log = require('mozlog')('server.oauth');
// oauth flows are stored in memory
var oauthFlows = {};
var GENERATE_OAUTH_TOKEN_STATE = 'GENERATE_OAUTH_TOKEN';
var DIFFERENT_BROWSER_ERROR = 3005;

/**
 * OAuth Login, redirects to FxA
 */
router.get('/login', function(req, res) {
  var nonce = crypto.randomBytes(32).toString('hex');
  oauthFlows[nonce] = true;
  req.session.state = nonce;
  return res.redirect(redirectUrl('signin', nonce));
});

/**
 * Session Status
 */
router.get('/status', function(req, res) {
  if (req.session && req.session.email) {
    return res.send(
      JSON.stringify({
        email: req.session.email,
        token: req.session.token,
      })
    );
  } else {
    return res.status(401).end();
  }
});

/**
 * Clears local session
 */
router.get('/logout', function(req, res) {
  req.session.reset();
  res.redirect(baseUrl);
});

/**
 * Generates an OAuth Token based on scope
 */
router.post('/generate-token', function(req, res) {
  log.verbose('/generate-token', req.body);
  if (req.body.scopes) {
    return res.redirect(
      redirectUrl('signin', GENERATE_OAUTH_TOKEN_STATE, req.body.scopes)
    );
  } else {
    return res.redirect(baseUrl + 'clients/token');
  }
});

/**
 * OAuth redirect flow, redirects from FxA
 */
router.get('/redirect', function(req, res) {
  var state = req.query.state;
  var code = req.query.code;
  var error = parseInt(req.query.error, 10);

  // The user finished the flow in a different browser.
  // Prompt them to log in again
  if (error === DIFFERENT_BROWSER_ERROR) {
    return res.redirect(baseUrl + '?oauth_incomplete=true');
  }

  if (state && state === GENERATE_OAUTH_TOKEN_STATE) {
    requestToken(code, function(err, r, body) {
      if (err) {
        return res.send(400, err);
      }

      log.verbose(GENERATE_OAUTH_TOKEN_STATE, body);

      return res.redirect(
        baseUrl +
          'clients/token?' +
          'access_token=' +
          body.access_token +
          '&scopes=' +
          body.scope
      );
    });
  } else if (
    code &&
    state &&
    state in oauthFlows &&
    state === req.session.state
  ) {
    // state should exists in our set of active flows and the user should
    // have a cookie with that state
    delete oauthFlows[state];
    delete req.session.state;

    requestToken(code, function(err, r, body) {
      if (err) {
        return res.send(r.status, err);
      }

      log.verbose(err, body);
      req.session.scope = body.scope;
      req.session.token_type = body.token_type;
      var token = (req.session.token = body.access_token);
      var profile;

      requestProfile(token)
        .then(function(profileData) {
          profile = profileData;

          return activateDeveloper(token);
        })
        .done(
          function(developer) {
            // only allow login if developer id is available
            if (developer && developer.developerId && profile.email) {
              req.session.email = profile.email;
              req.session.uid = profile.uid;
              req.session.token = token;
              req.session.developerId = developer.developerId;
            }
            return res.redirect(baseUrl);
          },
          function(response) {
            var msg = 'Error: Developer cannot be validated or activated';
            return res.status(response.status).send(msg);
          }
        );
    });
  } else if (req.session.email) {
    // already logged in
    return res.redirect(baseUrl);
  } else {
    var msg = 'Bad request ';
    if (!code) {
      msg += ' - missing code';
    }

    if (!state) {
      msg += ' - missing state';
    } else if (!oauthFlows[state]) {
      msg += ' - unknown state';
    } else if (state !== req.session.state) {
      msg += " - state cookie doesn't match";
    }

    log.error('msg', msg);

    return res.send(400, msg);
  }
});

/**
 * Request user profile
 *
 * @param {String} token
 * @returns {Promise}
 */
function requestProfile(token) {
  return new Promise(function(resolve, reject) {
    request.get(
      {
        uri: fxaOAuthConfig.profile_uri + '/profile',
        headers: {
          Authorization: 'Bearer ' + token,
        },
        json: true,
      },
      function(err, r, body) {
        log.verbose(err, body);

        if (err || r.statusCode >= 400) {
          return reject({ status: 400, err: err || body });
        }

        return resolve({
          email: body.email,
          uid: body.uid,
        });
      }
    );
  });
}

/**
 * Activate the developer
 *
 * @param {String} token
 * @returns {Promise}
 */
function activateDeveloper(token) {
  return new Promise(function(resolve, reject) {
    request.post(
      {
        uri: fxaOAuthConfig.oauth_internal_uri + '/developer/activate',
        headers: {
          Authorization: 'Bearer ' + token,
        },
        json: true,
      },
      function(err, r, body) {
        log.verbose(err, body);

        if (err || r.statusCode >= 400) {
          return reject({ status: 400, err: err });
        }

        log.verbose('developerData', body);

        return resolve(body);
      }
    );
  });
}

module.exports = router;
