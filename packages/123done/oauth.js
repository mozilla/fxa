'use strict';

var config = require('./config');
var crypto = require('crypto');
var request = require('request');
var querystring = require('querystring');
var JWTool = require('fxa-jwtool');

var DIFFERENT_BROWSER_ERROR = 3005;

// oauth flows are stored in memory
var oauthFlows = {};

// construct a redirect URL
function toQueryString(obj) {
  return '?' + querystring.stringify(obj);
}

function verifyIdToken(oauthConfig, token) {
  var jku = oauthConfig.jwks_uri;
  var verifier = new JWTool([jku]);
  // Little bit of a hack to find a default kid.
  return verifier
    .fetch(jku)
    .catch(function() {
      /* that preloaded the keyset, ignore inevitable failure */
    })
    .then(function() {
      var defaults = {
        jku: jku,
      };
      var kids = Object.keys(verifier.jwkSets[jku]);
      if (kids.length === 1) {
        defaults.kid = kids[0];
      }
      return verifier.verify(token, defaults);
    })
    .then(function(claims) {
      if (claims.aud !== config.client_id) {
        throw new Error('unexpected id_token audience: ' + claims.aud);
      }
      if (claims.iss !== oauthConfig.issuer) {
        throw new Error('unexpected id_token issuer: ' + claims.iss);
      }
      return claims;
    });
}

function setupOAuthFlow(req, action, options = {}, cb) {
  var params = {
    client_id: config.client_id,
    pkce_client_id: config.pkce_client_id,
    redirect_uri: config.redirect_uri,
    scope: config.scopes,
  };
  if (action) {
    params.action = action;
  }
  if (options.email) {
    params.email = options.email;
  }
  if (options.acrValues) {
    params.acr_values = options.acrValues;
  }
  request.get(
    {
      uri: config.issuer_uri + '/.well-known/openid-configuration',
    },
    function(err, r, body) {
      if (err) {
        return cb(err);
      }
      if (r.status >= 400) {
        return cb('Config lookup error: ' + body);
      }
      try {
        var config = JSON.parse(body);
      } catch (err) {
        return cb(err);
      }

      params.state = crypto.randomBytes(32).toString('hex');
      req.session.state = params.state;
      oauthFlows[params.state] = { params: params, config: config };

      return cb(null, params, config);
    }
  );
}

function redirectUrl(params, oauthConfig) {
  return oauthConfig.authorization_endpoint + toQueryString(params);
}

module.exports = function(app, db) {
  // begin a new oauth log in flow
  app.get('/api/login', function(req, res) {
    setupOAuthFlow(req, 'signin', {}, function(err, params, oauthConfig) {
      if (err) {
        return res.send(400, err);
      }
      return res.redirect(redirectUrl(params, oauthConfig));
    });
  });

  // begin a new oauth sign up flow
  app.get('/api/signup', function(req, res) {
    setupOAuthFlow(req, 'signup', {}, function(err, params, oauthConfig) {
      if (err) {
        return res.send(400, err);
      }
      return res.redirect(redirectUrl(params, oauthConfig));
    });
  });

  // let the content server choose the flow
  app.get('/api/best_choice', function(req, res) {
    setupOAuthFlow(req, null, {}, function(err, params, oauthConfig) {
      if (err) {
        return res.send(400, err);
      }
      return res.redirect(redirectUrl(params, oauthConfig));
    });
  });

  // begin a new oauth email-first flow
  app.get('/api/email_first', function(req, res) {
    setupOAuthFlow(req, 'email', {}, function(err, params, oauthConfig) {
      if (err) {
        return res.send(400, err);
      }
      return res.redirect(redirectUrl(params, oauthConfig));
    });
  });

  app.get('/api/two_step_authentication', function(req, res) {
    setupOAuthFlow(req, 'email', { acrValues: 'AAL2' }, function(
      err,
      params,
      oauthConfig
    ) {
      if (err) {
        return res.send(400, err);
      }
      return res.redirect(redirectUrl(params, oauthConfig));
    });
  });

  // begin a force auth flow
  app.get('/api/force_auth', function(req, res) {
    setupOAuthFlow(req, 'force_auth', { email: req.query.email }, function(
      err,
      params,
      oauthConfig
    ) {
      if (err) {
        return res.send(400, err);
      }
      return res.redirect(redirectUrl(params, oauthConfig));
    });
  });

  app.get('/api/oauth', function(req, res) {
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
      var oauthConfig = oauthFlows[state].config;
      delete oauthFlows[state];
      delete req.session.state;

      request.post(
        {
          uri: oauthConfig.token_endpoint,
          json: {
            code: code,
            client_id: config.client_id,
            client_secret: config.client_secret,
          },
        },
        function(err, r, body) {
          if (err) {
            return res.send(r.status, err);
          }

          console.log(err, body); //eslint-disable-line no-console
          req.session.scopes = body.scopes;
          req.session.token_type = body.token_type;
          var token = (req.session.token = body.access_token);
          var id_token = body.id_token;

          // Verify signature and extract claims from id_token
          verifyIdToken(oauthConfig, id_token)
            .then(function(claims) {
              req.session.uid = claims.sub;
              req.session.amr = claims.amr;
              req.session.acr = claims.acr;
              // Fetch additional profile data.
              request.get(
                {
                  uri: oauthConfig.userinfo_endpoint,
                  headers: {
                    Authorization: 'Bearer ' + token,
                  },
                },
                function(err, r, body) {
                  console.log(err, body); //eslint-disable-line no-console
                  if (err || r.status >= 400) {
                    return res.send(r ? r.status : 400, err || body);
                  }
                  var profile = JSON.parse(body);
                  req.session.email = profile.email;
                  req.session.subscriptions = profile.subscriptions;
                  // ensure the redirect goes to the correct place for either
                  // the redirect or iframe OAuth flows.
                  var referrer = req.get('referrer') || '';
                  var isIframe = referrer.indexOf('/iframe') > -1;
                  if (isIframe) {
                    res.redirect('/iframe');
                  } else {
                    res.redirect('/');
                  }
                }
              );
            })
            .catch(function(err) {
              return res.send(400, err);
            });
        }
      );
    } else if (req.session.email) {
      // already logged in
      res.redirect('/');
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
        msg +=
          " - state cookie doesn't match - " +
          state +
          ' !== ' +
          req.session.state;
      }

      res.send(400, msg);
    }
  });
};
