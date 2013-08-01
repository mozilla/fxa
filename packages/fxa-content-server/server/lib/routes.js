/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const config = require('../lib/configuration');

module.exports = function(app) {
  app.get('/.well-known/browserid', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.render('browserid.html');
  });

  app.get('/provision', function(req, res) {
    var provisioned = req.session.emails || [];
    res.render('provision.html', {
      browserid_server: config.get('browserid_server'),
      provisioned: JSON.stringify(provisioned)
    });
  });

  app.post('/provision', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    var email = req.body.email,
        publicKey = req.body.publicKey,
        duration = req.body.duration;
    var certificate = 'TODO';
    res.send(JSON.stringify({
      certificate: certificate
    }));
  });

  app.get('/authentication', function(req, res) {
    res.render('authentication.html', {
      browserid_server: config.get('browserid_server'),
      currentEmail: 'null'
    });
  });

  app.post('/authentication', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    if ('asdf' === req.body.password &&
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
};