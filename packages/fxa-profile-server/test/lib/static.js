/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const P = require('../../lib/promise');
const Static = require('../../lib/server/_static');

function request(options) {
  var server = Static.create();
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

exports.get = function get(options) {
  options = opts(options);
  options.url = options.url.replace('http://localhost:1112', '');
  options.method = 'GET';
  return request(options);
};
