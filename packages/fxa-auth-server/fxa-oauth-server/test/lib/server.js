/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const P = require('../../lib/promise');
const Server = require('../../lib/server');
const version = require('../../lib/config').get('api.version');

function wrapServer(serverPromise) {
  var wrap = {};
  function request(options) {
    return new P(resolve => {
      return serverPromise
        .then(s => {
          return s.inject(options);
        })
        .then(resolve);
    });
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

function createServer(extraServerConfig, createOptions) {
  return wrapServer(Server.create(extraServerConfig, createOptions));
}

module.exports = createServer;
