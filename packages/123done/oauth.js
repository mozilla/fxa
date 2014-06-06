var config = require('./config.json'),
    crypto = require('crypto'),
    request = require('request')
    ;

var DIFFERENT_BROWSER_ERROR = 3005;

// oauth flows are stored in memory
var oauthFlows = { };

// construct a redirect URL
function redirectUrl(action, nonce) {

  return config.auth_uri +
    "?client_id=" + config.client_id +
    "&redirect_uri=" + config.redirect_uri +
    "&state=" + nonce +
    "&scope=" + config.scopes +
    "&action=" + action;
}

module.exports = function(app, db) {

  // begin a new oauth log in flow
  app.get('/api/login', function(req, res) {
    var nonce = crypto.randomBytes(32).toString('hex');
    oauthFlows[nonce] = true;
    req.session.state = nonce;
    var url = redirectUrl("signin", nonce);
    return res.redirect(url);
  });

  // begin a new oauth sign up flow
  app.get('/api/signup', function(req, res) {
    var nonce = crypto.randomBytes(32).toString('hex');
    oauthFlows[nonce] = true;
    req.session.state = nonce;
    var url = redirectUrl("signup", nonce);
    return res.redirect(url);
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
      delete oauthFlows[state];

      request.post({
        uri: config.oauth_uri + '/token',
        json: {
          code: code,
          client_id: config.client_id,
          client_secret: config.client_secret
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
          uri: config.profile_uri + '/profile',
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
    } else if (state && state === req.session.state && req.session.email) {
      // Trying to complete a sign in for an already completed flow
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

};
