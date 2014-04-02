var config = require('./config.json'),
    crypto = require('crypto'),
    request = require('request')
    ;

// oauth flows are stored in memory
var oauthFlows = { };

// construct a redirect URL
function redirectUrl(nonce) {

  return config.signin_uri +
    "?client_id=" + config.client_id +
    "&redirect_uri=" + config.redirect_uri +
    "&state=" + nonce +
    "&scope=" + config.scopes;
}

module.exports = function(app, db) {

  // begin a new oauth flow
  app.get('/login', function(req, res) {
    var nonce = crypto.randomBytes(32).toString('hex');
    oauthFlows[nonce] = true;
    var url = redirectUrl(nonce);
    return res.redirect(url);
  });

  app.get('/api/oauth', function(req, res) {
    var state = req.query.state;
    var code = req.query.code;

    if (code && state && state in oauthFlows) {
      req.session.code = code;
      delete oauthFlows[state];

      request.post({
        uri: config.oauth_uri + '/token',
        json: {
          code: code,
          client_id: config.client_id,
          client_secret: config.client_secret
        }
      }, function(err, r, body) {
        if (err) res.send(r.status, err);

        console.log(err, res, body);
        req.session.scopes = body.scopes;
        req.session.token_type = body.token_type;

        // store the bearer token
        db.set(code, body.access_token);

        // TODO get the email/avatar from the profile server

        res.send(200);
      });
    } else {
      res.send(400);
    }
  });

};
