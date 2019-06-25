/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

module.exports = function() {
  const route = {};
  route.method = 'get';
  route.path = '/.well-known/apple-app-site-association';

  route.process = function(req, res) {
    // charset must be set on json responses.
    res.charset = 'utf-8';

    // From Apple developer docs,
    // https://developer.apple.com/library/content/documentation/General/Conceptual/AppSearch/UniversalLinks.html#//apple_ref/doc/uid/TP40016308-CH12-SW2
    // to enabled universal link support for a specific domain you need to return a json doc
    // from `/.well-known/apple-app-site-association` path, describing what apps can open which links.
    // The structure below enables FxiOS Fennec (developer builds), FirefoxBeta (Test Flight builds)
    // and Firefox (App store builds) to open FxA links.
    const paths = ['/verify_email', '/complete_signin'];
    res.json({
      applinks: {
        apps: [],
        details: [
          {
            appID: '43AQ936H96.org.mozilla.ios.Firefox',
            paths: paths,
          },
          {
            appID: '43AQ936H96.org.mozilla.ios.Fennec',
            paths: paths,
          },
          {
            appID: '43AQ936H96.org.mozilla.ios.FirefoxBeta',
            paths: paths,
          },
        ],
      },
    });
  };

  return route;
};
