/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


module.exports = function (config) {

  var baseUrl = config.get('public_url');
  var route = {};
  route.method = 'get';
  route.path = '/openid/login';

  route.process = function (req, res) {
    if (! req.query['openid.mode'] && req.accepts('application/xrds+xml')) {
      res.type('application/xrds+xml');
      return res.send(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
          + '<xrds:XRDS xmlns:xrds="xri://$xrds" xmlns="xri://$xrd*($v*2.0)"><XRD>'
          + '<Service xmlns="xri://$xrd*($v*2.0)">'
          + '<Type>http://specs.openid.net/auth/2.0/return_to</Type>'
          + '<URI>' + baseUrl + '/openid/login</URI>'
          + '</Service></XRD></xrds:XRDS>'
        );
    }

    return res.render('index');
  };

  return route;
};

