/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


var openid = require('openid');

var logger = require('mozlog')('route.get-openid-authenticate');

var OPENID_EXTENSIONS = [
  new openid.AttributeExchange(
    {
      'http://axschema.org/contact/email': 'optional'
    }
  )
];

module.exports = function (config) {

  var baseUrl = config.get('public_url');
  var route = {};
  route.method = 'get';
  route.path = '/openid/authenticate';

  route.process = function (req, res) {
    var id = req.query.identifier;
    openid.authenticate(
      id,
      baseUrl + '/openid/login?service=sync&context=fx_desktop_v2',
      null, // realm
      false, // immediate
      true, // stateless
      function (err, authUrl) {
        if (err) {
          logger.error(err);
          return res.status(500).render('500');
        }
        res.redirect(authUrl);
      },
      OPENID_EXTENSIONS,
      false // strict
    );
  };

  return route;
};

