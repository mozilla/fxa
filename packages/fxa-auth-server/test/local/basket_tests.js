/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

var path = require('path')
var test = require('../ptaptest')
var proxyquire = require('proxyquire')
var sinon = require('sinon')
var config = require('../../config').getProperties()

var request = sinon.spy()
var basketQueue = {
  on: sinon.spy(),
  start: sinon.spy()
}
var SQSReceiver = sinon.spy(function () {
  return basketQueue
})

var dependencies = {
  request: request
}
dependencies[path.resolve(__dirname, '../../bin') + '/../lib/sqs'] = function () {
  return SQSReceiver
}
proxyquire('../../bin/basket.js', dependencies)

test(
  'basket tests',
  function (t) {
    // queue initialisation
    t.equal(SQSReceiver.callCount, 1, 'SQSReceiver was called once')
    var args = SQSReceiver.args[0]
    t.equal(args.length, 2, 'SQSReceiver was passed two arguments')
    t.equal(args[0], config.basket.region, 'region argument was correct')
    t.ok(Array.isArray(args[1]), 'urls argument was array')
    t.equal(args[1].length, 1, 'urls array contained one item')
    t.equal(args[1][0], config.basket.queueUrl, 'urls item was correct')

    t.equal(basketQueue.on.callCount, 1, 'basketQueue.on was called once')
    args = basketQueue.on.args[0]
    t.equal(args.length, 2, 'basketQueue.on was passed two arguments')
    t.equal(args[0], 'data', 'event argument was correct')
    t.equal(typeof args[1], 'function', 'listener argument was function')
    var messageHandler = args[1]

    t.equal(basketQueue.start.callCount, 1, 'basketQueue.start was called once')
    t.equal(basketQueue.start.args[0].length, 0, 'basketQueue.start was passed no arguments')

    t.equal(request.callCount, 0, 'request was not called')

    // verified event
    var message = {
      event: 'verified',
      uid: 'foo',
      email: 'bar@example.org',
      locale: 'baz',
      del: sinon.spy()
    }
    messageHandler(message)

    t.equal(request.callCount, 1, 'request was called once')

    args = request.args[0]
    t.equal(args.length, 2, 'request was passed two arguments')
    t.equal(Object.keys(args[0]).length, 5, 'data argument had five properties')
    t.equal(args[0].url, config.basket.apiUrl + '/fxa-register/', 'url property was correct')
    t.ok(args[0].strictSSL, 'strictSSL property was correct')
    t.equal(args[0].method, 'POST', 'method property was correct')
    t.equal(Object.keys(args[0].headers).length, 1, 'one header was defined')
    t.equal(args[0].headers['X-API-Key'], config.basket.apiKey, 'X-API-Key header was correct')

    var data = args[0].form
    t.equal(Object.keys(data).length, 3, 'body data had three properties')
    t.equal(data.fxa_id, 'foo', 'fxa_id property was correct')
    t.equal(data.email, 'bar@example.org', 'email property was correct')
    t.equal(data.accept_lang, 'baz', 'accept_lang property was correct')

    t.equal(typeof args[1], 'function', 'callback argument was function')
    t.equal(message.del.callCount, 0, 'message.del was not called')
    args[1](null, { statusCode: 200})
    t.equal(message.del.callCount, 1, 'message.del was called once')
    t.equal(message.del.args[0].length, 0, 'message.del was passed no arguments')

    // verified event with restmail.net email address
    message = {
      event: 'verified',
      uid: 'foo',
      email: 'bar@restmail.net',
      locale: 'baz',
      del: sinon.spy()
    }
    messageHandler(message)

    t.equal(request.callCount, 1, 'request was not called')
    t.equal(message.del.callCount, 1, 'message.del was called once')

    // verified event with restmail.lcip.org email address
    message = {
      event: 'verified',
      uid: 'foo',
      email: 'bar@restmail.lcip.org',
      locale: 'baz',
      del: sinon.spy()
    }
    messageHandler(message)

    t.equal(request.callCount, 1, 'request was not called')
    t.equal(message.del.callCount, 1, 'message.del was called once')

    // verified event with default locale
    message = {
      event: 'verified',
      uid: 'foo',
      email: 'bar',
      del: sinon.spy()
    }
    messageHandler(message)

    t.equal(request.callCount, 2, 'request was called once')
    t.equal(request.args[1][0].form.accept_lang, 'en-US', 'accept_lang property was correct')

    // login event
    message = {
      event: 'login',
      service: 'a',
      uid: 'b',
      email: 'c',
      deviceCount: 1,
      userAgent: 'e',
      del: sinon.spy()
    }
    messageHandler(message)

    t.equal(request.callCount, 3, 'request was called once')

    args = request.args[2]
    t.equal(Object.keys(args[0]).length, 5, 'data argument had five properties')
    t.equal(args[0].url, config.basket.apiUrl + '/fxa-activity/', 'url property was correct')
    t.ok(args[0].strictSSL, 'strictSSL property was correct')
    t.equal(args[0].method, 'POST', 'method property was correct')
    t.equal(args[0].headers['X-API-Key'], config.basket.apiKey, 'X-API-Key header was correct')

    data = args[0].json
    t.equal(Object.keys(data).length, 5, 'body data had five properties')
    t.equal(data.activity, 'account.login', 'activity property was correct')
    t.equal(data.service, 'a', 'service property was correct')
    t.equal(data.fxa_id, 'b', 'fxa_id property was correct')
    t.strictEqual(data.first_device, true, 'first_device property was correct')
    t.equal(data.user_agent, 'e', 'user_agent property was correct')

    t.equal(typeof args[1], 'function', 'callback argument was function')
    t.equal(message.del.callCount, 0, 'message.del was not called')
    args[1](null, { statusCode: 200})
    t.equal(message.del.callCount, 1, 'message.del was called once')

    // login event with restmail.net email address
    message = {
      event: 'login',
      service: 'a',
      uid: 'b',
      email: 'c@restmail.net',
      deviceCount: 1,
      userAgent: 'e',
      del: sinon.spy()
    }
    messageHandler(message)

    t.equal(request.callCount, 3, 'request was not called')
    t.equal(message.del.callCount, 1, 'message.del was called once')

    // login event with restmail.lcip.org email address
    message = {
      event: 'login',
      service: 'a',
      uid: 'b',
      email: 'c@restmail.lcip.org',
      deviceCount: 1,
      userAgent: 'e',
      del: sinon.spy()
    }
    messageHandler(message)

    t.equal(request.callCount, 3, 'request was not called')
    t.equal(message.del.callCount, 1, 'message.del was called once')

    // login event with multiple devices
    message = {
      event: 'login',
      service: 'foo',
      uid: 'bar',
      email: 'baz',
      deviceCount: 2,
      userAgent: 'qux',
      del: sinon.spy()
    }
    messageHandler(message)

    t.equal(request.callCount, 4, 'request was called once')

    data = request.args[3][0].json
    t.equal(Object.keys(data).length, 5, 'body data had five properties')
    t.equal(data.activity, 'account.login', 'activity property was correct')
    t.equal(data.service, 'foo', 'service property was correct')
    t.equal(data.fxa_id, 'bar', 'fxa_id property was correct')
    t.strictEqual(data.first_device, false, 'first_device property was correct')
    t.equal(data.user_agent, 'qux', 'user_agent property was correct')

    t.equal(typeof args[1], 'function', 'callback argument was function')

    t.end()
  }
)

