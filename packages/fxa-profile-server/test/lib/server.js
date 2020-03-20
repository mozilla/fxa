/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const version = require('../../lib/config').get('api.version');
const Server = require('../../lib/server');

const api = {};
let server;

async function create() {
  const wrap = {};
  server = await Server.create();
  await expose();

  wrap.api = api;
  wrap.server = server;
  return wrap;
}

function request(options) {
  return new Promise(resolve => {
    server.inject(options).then(res => {
      return resolve(res);
    });
  });
}

function opts(options) {
  if (typeof options === 'string') {
    options = { url: options };
  }
  return options;
}

async function expose() {
  ['GET', 'POST', 'PUT', 'DELETE'].forEach(function(method) {
    exports[method.toLowerCase()] = exports[method] = async function(options) {
      options = opts(options);
      options.method = method;
      return request(options);
    };
  });

  Object.keys(exports).forEach(function(key) {
    api[key] = function api(options) {
      options = opts(options);
      options.url = '/v' + version + options.url;
      return exports[key](options);
    };
  });
}

exports.api = api;
exports.create = create;
