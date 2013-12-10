/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const config = require('./configuration'),
      keys = require('./keys');

var certifier = require('browserid-certifier')
      .client(config.get('certifier_host'), config.get('certifier_port'));

module.exports = function(app) {
  app.get('/.well-known/browserid', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    keys.publicKey(function(err, publicKey) {
      if (err) throw new Error(err);
      res.render('browserid.html', {
        publicKey: publicKey
      });
    });
  });

  app.get('/provision', function(req, res) {
    var provisioned = req.session.emails || [];
    res.render('provision.html', {
      browserid_server: config.get('browserid_server'),
      provisioned: JSON.stringify(provisioned)
    });
  });

  app.post('/provision', function(req, res) {
    var email = req.body.email,
        publicKey = req.body.publicKey,
        duration = req.body.duration;
    certifier(publicKey, email, duration, function(err, certificate) {
      if (err) {
        console.log(err);
        res.send(JSON.stringify({error: "Internal server error certifying"}), 500);
      } else {
        res.json({
          certificate: certificate
        });
      }
    });
  });

  app.get('/authentication', function(req, res) {
    res.render('authentication.html', {
      browserid_server: config.get('browserid_server'),
      currentEmail: 'null'
    });
  });

  app.post('/authentication', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    if ('asdfasdf' === req.body.password &&
        'foo@dev.fxaccounts.mozilla.org' === req.body.email) {
      if (! req.session.emails) {
        req.session.emails = [];
      }
      req.session.emails.push(req.body.email);
      res.send(JSON.stringify({status: "OK"}));
    } else {
      res.send(JSON.stringify({error: "Wrong username or password"}), 403);
    }
  });

  function routeToVerify(req, res) {
    res.render('verify_email.html', {
      fxa: config.get('fxaccount_url'),
      code: req.query.code,
      uid: req.query.uid
    });
  }

  // route both of these to 'verify_email'
  app.get('/verify_email', function(req, res) {
    routeToVerify(req, res);
  });

  app.get('/v1/verify_email', function(req, res) {
    routeToVerify(req, res);
  });

  app.get('/flow/:page?',
    function(req, res) {
      res.render('accounts/desktop_flow.html', {
        fxa: config.get('fxaccount_url'),
        user: "null",
        verified: 0,
        page: JSON.stringify(req.params.page || ''),
        desktop: true
      });
    });

  app.get('/mobile/:page?',
    function(req, res) {
      res.render('accounts/flow.html', {
        fxa: config.get('fxaccount_url'),
        user: "null",
        verified: 0,
        page: JSON.stringify(req.params.page || '')
      });
    });
};
