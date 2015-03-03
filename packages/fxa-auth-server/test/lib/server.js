/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const P = require('../../lib/promise');
const Server = require('../../lib/server');
const Internal = require('../../lib/server/internal');
const version = require('../../lib/config').get('api.version');

function wrapServer(server) {
  var wrap = {};
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

  wrap.post = function post(options) {
    options = opts(options);
    options.method = 'POST';
    return request(options);
  };

  wrap.get = function get(options) {
    options = opts(options);
    options.method = 'GET';
    return request(options);
  };

  wrap.delete = function _delete(options) {
    options = opts(options);
    options.method = 'DELETE';
    return request(options);
  };

  var api = {};
  Object.keys(wrap).forEach(function(key) {
    api[key] = function api(options) {
      options = opts(options);
      options.url = '/v' + version + options.url;
      return wrap[key](options);
    };
  });

  wrap.api = api;
  return wrap;
}

module.exports = wrapServer(Server.create());
module.exports.internal = wrapServer(Internal.create());
