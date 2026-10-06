/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var Poolee = require('poolee');

function parseUrl(url) {
  var match = /([a-zA-Z]+):\/\/(\S+)/.exec(url);
  if (match) {
    return {
      protocol: match[1],
      host: match[2],
    };
  }
  throw new Error('url is invalid: ' + url);
}

function Pool(url, options) {
  options = options || {};
  var parsedUrl = parseUrl(url);
  var protocol = require(parsedUrl.protocol);
  this.poolee = new Poolee(protocol, [parsedUrl.host], {
    timeout: options.timeout || 5000,
    keepAlive: true,
    maxRetries: 0,
  });
}

Pool.prototype.request = function (method, path, data) {
  var poolee = this.poolee;
  return new Promise(function (resolve, reject) {
    poolee.request(
      {
        method: method || 'GET',
        path: path,
        headers: {
          'Content-Type': 'application/json',
        },
        data: data ? JSON.stringify(data) : undefined,
      },
      function handleResponse(err, res, body) {
        var parsedBody = safeParse(body);

        if (err) {
          return reject(err);
        }

        if (res.statusCode < 200 || res.statusCode >= 300) {
          var error = parsedBody || new Error(body);
          error.statusCode = res.statusCode;
          return reject(error);
        }

        if (!body) {
          return resolve();
        }

        if (!parsedBody) {
          return reject(new Error('Invalid JSON'));
        }

        resolve(parsedBody);
      }
    );
  });
};

Pool.prototype.post = function (path, data) {
  return this.request('POST', path, data);
};

Pool.prototype.close = function () {
  /*/
   This is a hack to coax the server to close its existing connections
   /*/
  var socketCount = this.poolee.options.maxSockets || 20;
  function noop() {}
  for (var i = 0; i < socketCount; i++) {
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
