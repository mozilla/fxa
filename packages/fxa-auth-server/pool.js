/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var P = require('./promise')
var Poolee = require('poolee')

function parseUrl(url) {
  var match = /([a-zA-Z]+):\/\/(\S+)/.exec(url)
  if (match) {
    return {
      protocol: match[1],
      host: match[2]
    }
  }
  throw new Error('url is invalid: ' + url)
}

function Pool(url, options) {
  options = options || {}
  var foo = parseUrl(url)
  var protocol = require(foo.protocol)
  this.poolee = new Poolee(
    protocol,
    [foo.host],
    {
      timeout: options.timeout || 5000,
      keepAlive: true,
      maxRetries: 2
    }
  )
}

Pool.prototype.request = function (method, path, data) {
  var d = P.defer()
  this.poolee.request(
    {
      method: method || 'GET',
      path: path,
      headers: {
        "Content-Type": "application/json"
      },
      data: data ? JSON.stringify(data) : undefined
    },
    function (err, res, body) {
      if (err || Math.floor(res && res.statusCode / 100) !== 2) {
        var e = new Error(body)
        e.statusCode = res && res.statusCode
        return d.reject(e)
      }
      if (!body) { return d.resolve() }
      var json = null
      try {
        json = JSON.parse(body)
      }
      catch (e) {
        return d.reject(new Error('Invalid JSON'))
      }
      d.resolve(json)
    }
  )
  return d.promise
}

Pool.prototype.post = function (path, data) {
  return this.request('POST', path, data)
}

Pool.prototype.put = function (path, data) {
  return this.request('PUT', path, data)
}

Pool.prototype.get = function (path) {
  return this.request('GET', path)
}

Pool.prototype.del = function (path) {
  return this.request('DELETE', path)
}

Pool.prototype.head = function (path) {
  return this.request('HEAD', path)
}

Pool.prototype.close = function () {
  /*/
    This is a hack to coax the server to close its existing connections
  /*/
  var socketCount = this.poolee.options.maxSockets || 20
  function noop() {}
  for (var i = 0; i < socketCount; i++) {
    this.poolee.request(
      {
        method: 'GET',
        path: '/',
        headers: {
          "Connection": "close"
        }
      },
      noop
    )
  }
}

module.exports = Pool
