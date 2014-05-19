/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var test = require('tap').test
var restify = require('restify')
var TestServer = require('../test_server')

var TEST_EMAIL = 'test@example.com'
var TEST_IP = '192.0.2.1'
var TEST_AGENT = 'Mozilla/5.0'

var config = {
  port: 7000
}
var testServer = new TestServer(config)

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

var client = restify.createJsonClient({
  url: 'http://127.0.0.1:' + config.port
});

['accountCreate', 'accountLogin', 'passwordChange'].forEach(function (action) {
  test(
    'normal ' + action,
    function (t) {
      client.post('/check', { email: TEST_EMAIL, ip: TEST_IP, agent: TEST_AGENT, action: action },
        function (err, req, res, obj) {
          t.notOk(err, 'good request is successful')
          t.equal(res.statusCode, 200, 'good request returns a 200')
          t.end()
        }
      )
    }
  )
})

test(
  'missing agent and action',
  function (t) {
    client.post('/check', { email: TEST_EMAIL, ip: TEST_IP },
      function (err, req, res, obj) {
        t.equal(res.statusCode, 500, 'bad request returns a 500')
        t.type(obj.code, 'string', 'bad request returns an error code')
        t.type(obj.message, 'string', 'bad request returns an error message')
        t.end()
      }
    )
  }
)

test(
  'missing email, ip, agent and action',
  function (t) {
    client.post('/check', {},
      function (err, req, res, obj) {
        t.equal(res.statusCode, 500, 'bad request returns a 500')
        t.type(obj.code, 'string', 'bad request returns an error code')
        t.type(obj.message, 'string', 'bad request returns an error message')
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
