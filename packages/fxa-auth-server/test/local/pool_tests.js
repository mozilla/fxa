/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var sinon = require('sinon')
var proxyquire = require('proxyquire')
var Pool, poolee

test(
  'pool.request with default options',
  function (t) {
    setup()

    var pool = new Pool('http://example.com/ignore/me')
    pool.request()

    t.equal(poolee.request.callCount, 1, 'poolee.request was called once')

    var args = poolee.request.getCall(0).args
    t.equal(args.length, 2, 'poolee.request was passed two arguments')

    var options = args[0]
    t.equal(typeof options, 'object', 'options is object')
    t.equal(Object.keys(options).length, 4, 'options has 4 properties')
    t.equal(options.method, 'GET', 'options.method is GET')
    t.equal(options.path, undefined, 'options.path is undefined')
    t.equal(typeof options.headers, 'object', 'options.headers is object')
    t.equal(Object.keys(options.headers).length, 1, 'options.headers has 1 property')
    t.equal(options.headers['Content-Type'], 'application/json', 'Content-Type header is application/json')
    t.equal(options.data, undefined, 'options.data is undefined')

    var callback = args[1]
    t.equal(typeof callback, 'function', 'callback is function')

    t.end()
  }
)

test(
  'pool.request with alternative options',
  function (t) {
    setup()

    var pool = new Pool('http://example.com/')
    pool.request('POST', '/foo', { bar: 'baz' })

    t.equal(poolee.request.callCount, 1, 'poolee.request was called once')

    var args = poolee.request.getCall(0).args
    t.equal(args.length, 2, 'poolee.request was passed two arguments')

    var options = args[0]
    t.equal(typeof options, 'object', 'options is object')
    t.equal(Object.keys(options).length, 4, 'options has 4 properties')
    t.equal(options.method, 'POST', 'options.method is POST')
    t.equal(options.path, '/foo', 'options.path is /foo')
    t.equal(typeof options.headers, 'object', 'options.headers is object')
    t.equal(Object.keys(options.headers).length, 1, 'options.headers has 1 property')
    t.equal(options.headers['Content-Type'], 'application/json', 'Content-Type header is application/json')
    t.equal(options.data, '{"bar":"baz"}', 'options.data is correct')

    var callback = args[1]
    t.equal(typeof callback, 'function', 'callback is function')

    t.end()
  }
)

test(
  'pool.request callback with error',
  function (t) {
    setup()

    var pool = new Pool('http://example.com/')
    pool.request()
      .then(function () {
        t.fail('request should have failed')
        t.end()
      }, function (error) {
        t.equal(typeof error, 'string', 'error is string')
        t.equal(error, 'foo', 'error is correct')
        t.end()
      })

    var args = poolee.request.getCall(0).args
    var callback = args[1]
    callback('foo')
  }
)

test(
  'pool.request callback with HTTP error response',
  function (t) {
    setup()

    var pool = new Pool('http://example.com/')
    pool.request()
      .then(function () {
        t.fail('request should have failed')
        t.end()
      }, function (error) {
        t.ok(error instanceof Error, 'error is Error instance')
        t.equal(error.statusCode, 404, 'error.statusCode is 404')
        t.equal(error.message, 'wibble', 'error.message is correct')
        t.end()
      })

    var args = poolee.request.getCall(0).args
    var callback = args[1]
    callback(null, { statusCode: 404 }, 'wibble')
  }
)

test(
  'pool.request callback with HTTP error response and JSON body',
  function (t) {
    setup()

    var pool = new Pool('http://example.com/')
    pool.request()
      .then(function () {
        t.fail('request should have failed')
        t.end()
      }, function (error) {
        t.equal(error instanceof Error, false, 'error is not Error instance')
        t.equal(typeof error, 'object', 'error is object')
        t.equal(Object.keys(error).length, 2, 'error has two properties')
        t.equal(error.statusCode, 418, 'error.statusCode is 418')
        t.equal(error.foo, 'bar', 'other error data is correct')
        t.end()
      })

    var args = poolee.request.getCall(0).args
    var callback = args[1]
    callback(null, { statusCode: 418 }, '{"foo":"bar"}')
  }
)

test(
  'pool.request callback with HTTP success response and empty body',
  function (t) {
    setup()

    var pool = new Pool('http://example.com/')
    pool.request()
      .then(function (result) {
        t.equal(result, undefined, 'result is undefined')
        t.end()
      }, function () {
        t.fail('request should have succeeded')
        t.end()
      })

    var args = poolee.request.getCall(0).args
    var callback = args[1]
    callback(null, { statusCode: 200 }, '')
  }
)

test(
  'pool.request callback with HTTP success response and valid JSON body',
  function (t) {
    setup()

    var pool = new Pool('http://example.com/')
    pool.request()
      .then(function (result) {
        t.equal(typeof result, 'object', 'result is object')
        t.equal(Object.keys(result).length, 1, 'result has 1 property')
        t.equal(result.foo, 'bar', 'result data is correct')
        t.end()
      }, function () {
        t.fail('request should have succeeded')
        t.end()
      })

    var args = poolee.request.getCall(0).args
    var callback = args[1]
    callback(null, { statusCode: 200 }, '{"foo":"bar"}')
  }
)

test(
  'pool.request callback with HTTP success response and invalid JSON body',
  function (t) {
    setup()

    var pool = new Pool('http://example.com/')
    pool.request()
      .then(function () {
        t.fail('request should have failed')
        t.end()
      }, function (error) {
        t.ok(error instanceof Error, 'error is Error instance')
        t.equal(error.statusCode, undefined, 'error.statusCode is undefined')
        t.equal(error.message, 'Invalid JSON', 'error.message is correct')
        t.end()
      })

    var args = poolee.request.getCall(0).args
    var callback = args[1]
    callback(null, { statusCode: 200 }, 'foo')
  }
)

test(
  'pool.get',
  function (t) {
    setup()

    var pool = new Pool('http://example.com/')
    sinon.stub(pool, 'request', function () {})
    pool.get('foo')

    t.equal(pool.request.callCount, 1, 'pool.request was called once')

    var args = pool.request.getCall(0).args
    t.equal(args.length, 2, 'pool.request was passed three arguments')
    t.equal(args[0], 'GET', 'first argument to pool.request was POST')
    t.equal(args[1], 'foo', 'second argument to pool.request was correct')

    t.end()
  }
)

test(
  'pool.put',
  function (t) {
    setup()

    var pool = new Pool('http://example.com/')
    sinon.stub(pool, 'request', function () {})
    pool.put('baz', 'qux')

    t.equal(pool.request.callCount, 1, 'pool.request was called once')

    var args = pool.request.getCall(0).args
    t.equal(args.length, 3, 'pool.request was passed three arguments')
    t.equal(args[0], 'PUT', 'first argument to pool.request was POST')
    t.equal(args[1], 'baz', 'second argument to pool.request was correct')
    t.equal(args[2], 'qux', 'third argument to pool.request was correct')

    t.end()
  }
)

test(
  'pool.post',
  function (t) {
    setup()

    var pool = new Pool('http://example.com/')
    sinon.stub(pool, 'request', function () {})
    pool.post('foo', 'bar')

    t.equal(pool.request.callCount, 1, 'pool.request was called once')

    var args = pool.request.getCall(0).args
    t.equal(args.length, 3, 'pool.request was passed three arguments')
    t.equal(args[0], 'POST', 'first argument to pool.request was POST')
    t.equal(args[1], 'foo', 'second argument to pool.request was correct')
    t.equal(args[2], 'bar', 'third argument to pool.request was correct')

    t.end()
  }
)

test(
  'pool.del',
  function (t) {
    setup()

    var pool = new Pool('http://example.com/')
    sinon.stub(pool, 'request', function () {})
    pool.del('foo')

    t.equal(pool.request.callCount, 1, 'pool.request was called once')

    var args = pool.request.getCall(0).args
    t.equal(args.length, 2, 'pool.request was passed three arguments')
    t.equal(args[0], 'DELETE', 'first argument to pool.request was POST')
    t.equal(args[1], 'foo', 'second argument to pool.request was correct')

    t.end()
  }
)

function setup () {
  poolee = sinon.createStubInstance(require('poolee'))
  Pool = proxyquire('../../lib/pool', {
    poolee: function () {
      return poolee
    }
  })
}

