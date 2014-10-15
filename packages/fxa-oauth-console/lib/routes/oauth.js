/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var express = require('express');
var router = express.Router();
var redirectUrl = require('./lib/oauth').redirectUrl;
var config = require('../config');
var fxaOAuthConfig = config.get('fxaOAuth');

var crypto = require('crypto');
var request = require('request');

// a function to verify that the current user is authenticated
function checkAuth(req, res, next) {
  console.log(req.session);
  if (!req.session.user) {
    res.send("authentication required\n", 401);
  } else {
    next();
  }
}

var DIFFERENT_BROWSER_ERROR = 3005;
// oauth flows are stored in memory
var oauthFlows = { };

/**
 * OAuth Login, redirects to FxA
 */
router.get('/login', function(req, res) {
  var nonce = crypto.randomBytes(32).toString('hex');
  oauthFlows[nonce] = true;
  req.session.state = nonce;
  return res.redirect(redirectUrl("signin", nonce));
});

/**
 * Session Status
 */
router.get('/status', function(req, res) {
  if (req.session && req.session.email) {
    return res.send(JSON.stringify({
      email: req.session.email
    }));
  } else {
    return res.status(403).end();
  }
});

/**
 * Clears local session
 */
router.get('/logout', function(req, res) {
  req.session.reset();
  res.redirect('/');
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
    return res.redirect('/?oauth_incomplete=true');
  }

  // state should exists in our set of active flows and the user should
  // have a cookie with that state
  if (code && state && state in oauthFlows && state === req.session.state) {
    delete oauthFlows[state];
    delete req.session.state;

    request.post({
      uri: fxaOAuthConfig.oauth_uri + '/token',
      json: {
        code: code,
        client_id: fxaOAuthConfig.client_id,
        client_secret: fxaOAuthConfig.client_secret
      }
    }, function(err, r, body) {
      if (err) return res.send(r.status, err);

      console.log(err, body);
      req.session.scopes = body.scopes;
      req.session.token_type = body.token_type;
      var token = req.session.token = body.access_token;

      // store the bearer token
      //db.set(code, body.access_token);

      request.get({
        uri: fxaOAuthConfig.profile_uri + '/profile',
        headers: {
          Authorization: 'Bearer ' + token
        }
      }, function (err, r, body) {
        console.log(err, body);
        if (err || r.status >= 400) {
          return res.send(r ? r.status : 400, err || body);
        }
        var data = JSON.parse(body);
        req.session.email = data.email;
        req.session.uid = data.uid;
        res.redirect('/');
      });
    });
  } else if (req.session.email) {
    // already logged in
    res.redirect('/');
  } else {

    var msg = 'Bad request ';
    if (!code) msg += ' - missing code';

    if (!state) {
      msg += ' - missing state';
    } else if (!oauthFlows[state]) {
      msg += ' - unknown state';
    } else if (state !== req.session.state) {
      msg += ' - state cookie doesn\'t match';
    }

    console.error('msg', msg);

    res.send(400, msg);
  }
});

module.exports = router;
