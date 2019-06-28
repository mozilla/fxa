/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const P = require('./promise');
const Poolee = require('poolee');
const url = require('url');
const PROTOCOL_MODULES = {
  http: require('http'),
  https: require('https'),
};

function Pool(uri, options = {}) {
  const parsed = url.parse(uri);
  const { protocol, host } = parsed;
  const protocolModule = PROTOCOL_MODULES[protocol.slice(0, -1)];
  if (!protocolModule) {
    throw new Error(`Protocol ${protocol} is not supported.`);
  }
  const port = parsed.port || protocolModule.globalAgent.defaultPort;
  this.poolee = new Poolee(protocolModule, [`${host}:${port}`], {
    timeout: options.timeout || 5000,
    maxPending: options.maxPending || 1000,
    keepAlive: true,
    maxRetries: 0,
  });
}

Pool.prototype.request = function(
  method,
  url,
  params,
  query,
  body,
  headers = {}
) {
  let path;
  try {
    path = url.render(params, query);
  } catch (err) {
    return P.reject(err);
  }

  const d = P.defer();
  let data;
  if (body) {
    headers['Content-Type'] = 'application/json';
    data = JSON.stringify(body);
  }
  this.poolee.request(
    {
      method: method || 'GET',
      path,
      headers,
      data,
    },
    handleResponse
  );
  return d.promise;

  function handleResponse(err, res, body) {
    const parsedBody = safeParse(body);

    if (err) {
      return d.reject(err);
    }

    if (res.statusCode < 200 || res.statusCode >= 300) {
      const error = new Error();
      if (!parsedBody) {
        error.message = body;
      } else {
        Object.assign(error, parsedBody);
      }
      error.statusCode = res.statusCode;
      return d.reject(error);
    }

    if (!body) {
      return d.resolve();
    }

    if (!parsedBody) {
      return d.reject(new Error('Invalid JSON'));
    }

    d.resolve(parsedBody);
  }
};

Pool.prototype.post = function(
  path,
  params,
  body,
  { query = {}, headers = {} } = {}
) {
  return this.request('POST', path, params, query, body, headers);
};

Pool.prototype.put = function(
  path,
  params,
  body,
  { query = {}, headers = {} } = {}
) {
  return this.request('PUT', path, params, query, body, headers);
};

Pool.prototype.get = function(path, params, { query = {}, headers = {} } = {}) {
  return this.request('GET', path, params, query, null, headers);
};

Pool.prototype.del = function(
  path,
  params,
  body,
  { query = {}, headers = {} } = {}
) {
  return this.request('DELETE', path, params, query, body, headers);
};

Pool.prototype.head = function(
  path,
  params,
  { query = {}, headers = {} } = {}
) {
  return this.request('HEAD', path, params, query, null, headers);
};

Pool.prototype.close = function() {
  /*/
    This is a hack to coax the server to close its existing connections
  /*/
  const socketCount = this.poolee.options.maxSockets || 20;
  function noop() {}
  for (let i = 0; i < socketCount; i++) {
    this.poolee.request(
      {
        method: 'GET',
        path: '/',
        headers: {
          Connection: 'close',
        },
      },
      noop
    );
  }
};

module.exports = Pool;

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch (e) {}
}
