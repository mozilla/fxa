/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Fetch a translated strings bundle. The best match will be found
// by i18n-abide based on the users `accept-language` headers.

'use strict';

module.exports = function(i18n) {
  var route = {};
  route.method = 'get';
  route.path = '/i18n/client.json';

  route.process = function (req, res, next) {
    // req.locale is set by abide in a previous middleware.
    req.url = '/i18n/' + req.locale + '/client.json';

    // Let any intermediaries know that client.json can vary based
    // on the accept-language. This will also be useful if client.json
    // gains long lived cache-control headers.
    res.set('Vary', 'accept-language');

    // charset must be set on json responses.
    res.charset = 'utf8';

    // let the static middleware handle the rest.
    next();
  };

  return route;
};
