/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var test = require('tap').test
var TestServer = require('../test_server')
var Promise = require('bluebird')
var restify = Promise.promisifyAll(require('restify'))

var TEST_IP = '192.0.2.1'
var TEST_IP2 = '192.0.2.2'
var TEST_IP3 = '192.0.2.3'
var TEST_IP4 = '192.0.2.4'
var TEST_IP5 = '192.0.2.5'
var CONNECT_DEVICE_SMS = 'connectDeviceSms'
var PHONE_NUMBER = '14071234567'

var config = {
  listen: {
    port: 7000
  }
}

// Override limit values for testing
process.env.SMS_RATE_LIMIT_INTERVAL_SECONDS = 1
process.env.MAX_SMS = 2
process.env.IP_RATE_LIMIT_INTERVAL_SECONDS = 1
process.env.IP_RATE_LIMIT_BAN_DURATION_SECONDS = 1

var mcHelper = require('../memcache-helper')

var testServer = new TestServer(config)

var client = restify.createJsonClient({
  url: 'http://127.0.0.1:' + config.listen.port
})

Promise.promisifyAll(client, { multiArgs: true })

test(
  'startup',
  function (t) {
    testServer.start(function (err) {
      t.type(testServer.server, 'object', 'test server was started')
      t.notOk(err, 'no errors were returned')
      t.end()
    })
  }
)

test(
  'clear everything',
  function (t) {
    mcHelper.clearEverything(
      function (err) {
        t.notOk(err, 'no errors were returned')
        t.end()
      }
    )
  }
)

test(
  '/check `connectDeviceSms` by number',
  function (t) {

    // Send requests until throttled
    return client.postAsync('/check', { ip: TEST_IP, email: 'test1@example.com', payload: { phoneNumber: PHONE_NUMBER }, action: CONNECT_DEVICE_SMS })
      .spread(function(req, res, obj){
        t.equal(res.statusCode, 200, 'returns a 200')
        t.equal(obj.block, false, 'not rate limited')
        return client.postAsync('/check', { ip: TEST_IP2, email: 'test2@example.com', payload: { phoneNumber: PHONE_NUMBER }, action: CONNECT_DEVICE_SMS })
      })
      .spread(function(req, res, obj){
        t.equal(res.statusCode, 200, 'returns a 200')
        t.equal(obj.block, false, 'not rate limited')
        return client.postAsync('/check', { ip: TEST_IP3, email: 'test3@example.com', payload: { phoneNumber: PHONE_NUMBER }, action: CONNECT_DEVICE_SMS })
      })
      .spread(function(req, res, obj){
        t.equal(res.statusCode, 200, 'returns a 200')
        t.equal(obj.block, true, 'rate limited')
        t.equal(obj.retryAfter, 1, 'rate limit retry amount')

        // If sms number rate limited, user can still perform other actions
        return client.postAsync('/check', { ip: TEST_IP3, email: 'test3@example.com', action: 'anotherAction' })
      })
      .spread(function(req, res, obj){
        t.equal(res.statusCode, 200, 'returns a 200')
        t.equal(obj.block, false, 'not rate limited')

        // Issuing request for another ip address to the same phone number is still rate limited
        return client.postAsync('/check', { ip: TEST_IP4, email: 'test3@example.com', payload: { phoneNumber: PHONE_NUMBER }, action: CONNECT_DEVICE_SMS })
      })
      // Reissue requests to verify that throttling is disabled
      .spread(function(req, res, obj){
        t.equal(res.statusCode, 200, 'returns a 200')
        t.equal(obj.block, true, 'rate limited')
        t.equal(obj.retryAfter, 1, 'rate limit retry amount')

        // Delay ~1s for rate limit to go away
        return Promise.delay(1010)
      })
      .then(function(){
        // Issuing request for another ip address to the same phone number is still rate limited
        return client.postAsync('/check', { ip: TEST_IP5, email: 'test3@example.com', payload: { phoneNumber: PHONE_NUMBER }, action: CONNECT_DEVICE_SMS })
      })
      .spread(function(req, res, obj){
        t.equal(res.statusCode, 200, 'returns a 200')
        t.equal(obj.block, false, 'not rate limited')
        t.end()
      })
      .catch(function(err){
        t.fail(err)
        t.end()
      })
  }
)

test(
  '/check `connectDeviceSms` by ip',
  function (t) {

    // Send requests until throttled
    return client.postAsync('/check', { ip: TEST_IP4, email: 'test5@example.com', payload: { phoneNumber: '1111111111' }, action: CONNECT_DEVICE_SMS })
      .spread(function(req, res, obj){
        t.equal(res.statusCode, 200, 'returns a 200')
        t.equal(obj.block, false, 'not rate limited')
        return client.postAsync('/check', { ip: TEST_IP4, email: 'test6@example.com', payload: { phoneNumber: '2111111111' }, action: CONNECT_DEVICE_SMS })
      })
      .spread(function(req, res, obj){
        t.equal(res.statusCode, 200, 'returns a 200')
        t.equal(obj.block, false, 'not rate limited')
        return client.postAsync('/check', { ip: TEST_IP4, email: 'test8@example.com', payload: { phoneNumber: '3111111111' }, action: CONNECT_DEVICE_SMS })
      })
      .spread(function(req, res, obj){
        t.equal(res.statusCode, 200, 'returns a 200')
        t.equal(obj.block, true, 'rate limited')
        t.equal(obj.retryAfter, 1, 'rate limit retry amount')

        // Issue request from new ip address to verify that user is not block from performing another action on
        // another ip
        return client.postAsync('/check', { ip: TEST_IP3, email: 'test8@example.com', action: 'anotherAction' })
      })
      .spread(function(req, res, obj){
        t.equal(res.statusCode, 200, 'returns a 200')
        t.equal(obj.block, false, 'rate limited')

        // Verify that user is still block at the ip level from issuing any more sms requests
        return client.postAsync('/check', { ip: TEST_IP4, email: 'test8@example.com', payload: { phoneNumber: '4111111111' }, action: CONNECT_DEVICE_SMS })
      })
      .spread(function(req, res, obj){
        t.equal(res.statusCode, 200, 'returns a 200')
        t.equal(obj.block, true, 'rate limited')
        t.equal(obj.retryAfter, 1, 'rate limit retry amount')

        // Delay ~1s for rate limit to go away
        return Promise.delay(1010)
      })

      // Reissue requests to verify that throttling is disabled
      .then(function(){
        return client.postAsync('/check', { ip: TEST_IP4, email: 'test9@example.com', payload: { phoneNumber: '5111111111' }, action: CONNECT_DEVICE_SMS })
      })
      .spread(function(req, res, obj){
        t.equal(res.statusCode, 200, 'returns a 200')
        t.equal(obj.block, false, 'not rate limited')
        t.end()
      })
      .catch(function(err){
        t.fail(err)
        t.end()
      })
  }
)

test(
  'clear everything',
  function (t) {
    mcHelper.clearEverything(
      function (err) {
        t.notOk(err, 'no errors were returned')
        t.end()
      }
    )
  }
)

test(
  'teardown',
  function (t) {
    testServer.stop()
    t.equal(testServer.server.killed, true, 'test server has been killed')
    t.end()
  }
)
