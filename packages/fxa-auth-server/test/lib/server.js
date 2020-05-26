/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const P = require('../../lib/promise');
const createServer = require('../../bin/key_server');
process.env.CONFIG_FILES = require.resolve('./oauth-test.json');
const config = require('../../config');
const version = config.get('oauthServer.api.version');
config.set('log.level', 'critical');
const testConfig = config.getProperties();

function wrapServer(server, close) {
  var wrap = {};
  function request(options) {
    return new P((resolve) => {
      resolve(server.inject(options));
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
  Object.keys(wrap).forEach(function (key) {
    api[key] = function api(options) {
      options = opts(options);
      options.url = '/v' + version + options.url;
      return wrap[key](options);
    };
  });

  wrap.api = api;
  wrap.config = config;
  wrap.close = close;
  return wrap;
}

module.exports.start = async function () {
  const { server, close } = await createServer(testConfig);
  return wrapServer(server, close);
};

module.exports.config = config;
