/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Fetch a translated strings bundle. The best match will be found
// by i18n-abide based on the users `accept-language` headers.

'use strict';
module.exports = function(i18n) {
  const route = {};
  route.method = 'get';
  route.path = '/i18n/client.json';

  route.process = function(req, res, next) {
    // req.locale is set by abide in a previous middleware.
    const locale = i18n.normalizeLocale(req.locale);

    req.url = '/i18n/' + locale + '/client.json';

    // Let any intermediaries know that client.json can vary based
    // on the accept-language. This will also be useful if client.json
    // gains long lived cache-control headers.
    res.set('Vary', 'accept-language');

    // charset must be set on json responses.
    // set charset for Express 4: https://github.com/strongloop/express/wiki/Migrating-from-3.x-to-4.x#rescharset
    res.set('content-type', 'application/json; charset=utf-8');

    // let the static middleware handle the rest.
    next();
  };

  return route;
};
