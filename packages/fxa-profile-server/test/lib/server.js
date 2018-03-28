/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const version = require('../../lib/config').get('api.version');
const P = require('../../lib/promise');
const Server = require('../../lib/server');

var server = Server.create();

function request(options) {
  var deferred = P.defer();
  server.inject(options, deferred.resolve.bind(deferred));
  return deferred.promise;
}

function opts(options) {
  if (typeof options === 'string') {
    options = { url: options };
  }
  return options;
}

['GET', 'POST', 'PUT', 'DELETE'].forEach(function(method) {
  exports[method.toLowerCase()] = exports[method] = function(options) {
    options = opts(options);
    options.method = method;
    return request(options);
  };
});

var api = {};
Object.keys(exports).forEach(function(key) {
  api[key] = function api(options) {
    options = opts(options);
    options.url = '/v' + version + options.url;
    return exports[key](options);
  };
});

exports.api = api;
exports.server = server;
