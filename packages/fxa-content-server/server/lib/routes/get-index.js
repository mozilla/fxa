/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (config) {
  var STATIC_RESOURCE_URL = config.get('static_resource_url');

  var route = {};
  route.method = 'get';
  route.path = '/';

  route.process = function (req, res) {
    res.render('index', {
      flowBeginTime: Date.now(),
      // Note that staticResourceUrl is added to templates as a build step
      staticResourceUrl: STATIC_RESOURCE_URL
    });
  };

  return route;
};

