/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var test = require('tap').test
var restify = require('restify')
var TestServer = require('../test_server')
var mcHelper = require('../memcache-helper')

var TEST_EMAIL = 'test@example.com'
var TEST_IP = '192.0.2.1'

var config = {
  listen: {
    port: 7000
  },
  limits: {
    rateLimitIntervalSeconds: 1
  }
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

var client = restify.createJsonClient({
  url: 'http://127.0.0.1:' + config.listen.port
});

test(
  'too many failed logins from the same IP',
  function (t) {
    client.post('/failedLoginAttempt', { email: TEST_EMAIL, ip: TEST_IP },
      function (err, req, res, obj) {
        t.equal(res.statusCode, 200, 'first login attempt noted')
        t.equal(obj.lockout, false, 'not locked out')

        client.post('/failedLoginAttempt', { email: TEST_EMAIL, ip: TEST_IP },
          function (err, req, res, obj) {
            t.equal(res.statusCode, 200, 'second login attempt noted')
            t.equal(obj.lockout, false, 'not locked out')

            mcHelper.badLoginCheck(
              function (isOverBadLogins, isWayOverBadLogins) {
                t.equal(isOverBadLogins, false, 'is not yet over bad logins')
                t.equal(isWayOverBadLogins, false, 'is not locked out')

                client.post('/failedLoginAttempt', { email: TEST_EMAIL, ip: TEST_IP },
                  function (err, req, res, obj) {
                    t.equal(res.statusCode, 200, 'third login attempt noted')
                    t.equal(obj.lockout, false, 'not locked out')

                    mcHelper.badLoginCheck(
                      function (isOverBadLogins, isWayOverBadLogins) {
                        t.equal(isOverBadLogins, true, 'is now over bad logins')
                        t.equal(isWayOverBadLogins, false, 'is still not locked out')
                        t.end()
                      }
                    )
                  }
                )
              }
            )
          }
        )
      }
    )
  }
)

test(
  'failed logins expire',
  function (t) {
    setTimeout(
      function () {
        mcHelper.badLoginCheck(
          function (isOverBadLogins) {
            t.equal(isOverBadLogins, false, 'is no longer over bad logins')
            t.end()
          }
        )
      },
      config.limits.rateLimitIntervalSeconds * 1000
    )
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
  'too many failed logins from different IPs',
  function (t) {
    client.post('/failedLoginAttempt', { email: TEST_EMAIL, ip: '192.0.2.10' },
      function (err, req, res, obj) {
        t.equal(res.statusCode, 200, 'failed login 1')
        t.equal(obj.lockout, false, 'not locked out')

        client.post('/failedLoginAttempt', { email: TEST_EMAIL, ip: '192.0.2.11' },
          function (err, req, res, obj) {
            t.equal(res.statusCode, 200, 'failed login 2')
            t.equal(obj.lockout, false, 'not locked out')

            client.post('/failedLoginAttempt', { email: TEST_EMAIL, ip: '192.0.2.12' },
              function (err, req, res, obj) {
                t.equal(res.statusCode, 200, 'failed login 3')
                t.equal(obj.lockout, false, 'not locked out')

                client.post('/failedLoginAttempt', { email: TEST_EMAIL, ip: '192.0.2.13' },
                  function (err, req, res, obj) {
                    t.equal(res.statusCode, 200, 'failed login 4')
                    t.equal(obj.lockout, false, 'not locked out')

                    client.post('/failedLoginAttempt', { email: TEST_EMAIL, ip: '192.0.2.14' },
                      function (err, req, res, obj) {
                        t.equal(res.statusCode, 200, 'failed login 5')
                        t.equal(obj.lockout, false, 'locked out')

                        client.post('/failedLoginAttempt', { email: TEST_EMAIL, ip: '192.0.2.15' },
                          function (err, req, res, obj) {
                            t.equal(res.statusCode, 200, 'failed login 6')
                            t.equal(obj.lockout, false, 'locked out')

                            client.post('/failedLoginAttempt', { email: TEST_EMAIL, ip: '192.0.2.16' },
                              function (err, req, res, obj) {
                                t.equal(res.statusCode, 200, 'failed login 7')
                                t.equal(obj.lockout, false, 'not locked out')

                                client.post('/failedLoginAttempt', { email: TEST_EMAIL, ip: '192.0.2.17' },
                                  function (err, req, res, obj) {
                                    t.equal(res.statusCode, 200, 'failed login 8')
                                    t.equal(obj.lockout, false, 'not locked out')

                                    client.post('/failedLoginAttempt', { email: TEST_EMAIL, ip: '192.0.2.18' },
                                      function (err, req, res, obj) {
                                        t.equal(res.statusCode, 200, 'failed login 9')
                                        t.equal(obj.lockout, false, 'not locked out')

                                        client.post('/failedLoginAttempt', { email: TEST_EMAIL, ip: '192.0.2.19' },
                                          function (err, req, res, obj) {
                                            t.equal(res.statusCode, 200, 'failed login 10')
                                            t.equal(obj.lockout, false, 'not locked out')

                                            client.post('/failedLoginAttempt', { email: TEST_EMAIL, ip: '192.0.2.20' },
                                              function (err, req, res, obj) {
                                                t.equal(res.statusCode, 200, 'failed login 11')
                                                t.equal(obj.lockout, false, 'locked out')

                                                client.post('/failedLoginAttempt', { email: TEST_EMAIL, ip: '192.0.2.21' },
                                                  function (err, req, res, obj) {
                                                    t.equal(res.statusCode, 200, 'failed login 12')
                                                    t.equal(obj.lockout, false, 'locked out')

                                                    client.post('/failedLoginAttempt', { email: TEST_EMAIL, ip: '192.0.2.22' },
                                                      function (err, req, res, obj) {
                                                        t.equal(res.statusCode, 200, 'failed login 13')
                                                        t.equal(obj.lockout, false, 'locked out')

                                                        client.post('/failedLoginAttempt', { email: TEST_EMAIL, ip: '192.0.2.23' },
                                                          function (err, req, res, obj) {
                                                            t.equal(res.statusCode, 200, 'failed login 14')
                                                            t.equal(obj.lockout, false, 'not locked out')

                                                            client.post('/failedLoginAttempt', { email: TEST_EMAIL, ip: '192.0.2.24' },
                                                              function (err, req, res, obj) {
                                                                t.equal(res.statusCode, 200, 'failed login 15')
                                                                t.equal(obj.lockout, false, 'not locked out')

                                                                client.post('/failedLoginAttempt', { email: TEST_EMAIL, ip: '192.0.2.25' },
                                                                  function (err, req, res, obj) {
                                                                    t.equal(res.statusCode, 200, 'failed login 16')
                                                                    t.equal(obj.lockout, false, 'not locked out')

                                                                    client.post('/failedLoginAttempt', { email: TEST_EMAIL, ip: '192.0.2.26' },
                                                                      function (err, req, res, obj) {
                                                                        t.equal(res.statusCode, 200, 'failed login 17')
                                                                        t.equal(obj.lockout, false, 'not locked out')

                                                                        client.post('/failedLoginAttempt', { email: TEST_EMAIL, ip: '192.0.2.27' },
                                                                          function (err, req, res, obj) {
                                                                            t.equal(res.statusCode, 200, 'failed login 18')
                                                                            t.equal(obj.lockout, false, 'locked out')

                                                                            client.post('/failedLoginAttempt', { email: TEST_EMAIL, ip: '192.0.2.28' },
                                                                              function (err, req, res, obj) {
                                                                                t.equal(res.statusCode, 200, 'failed login 19')
                                                                                t.equal(obj.lockout, false, 'locked out')

                                                                                client.post('/failedLoginAttempt', { email: TEST_EMAIL, ip: '192.0.2.27' },
                                                                                  function (err, req, res, obj) {
                                                                                    t.equal(res.statusCode, 200, 'failed login 20')
                                                                                    t.equal(obj.lockout, false, 'locked out')

                                                                                    client.post('/failedLoginAttempt', { email: TEST_EMAIL, ip: '192.0.2.28' },
                                                                                      function (err, req, res, obj) {
                                                                                        t.equal(res.statusCode, 200, 'failed login 21')
                                                                                        t.equal(obj.lockout, true, 'locked out')

                                                                                        mcHelper.badLoginCheck(
                                                                                          function (isOverBadLogins, isWayOverBadLogins) {
                                                                                            t.equal(isOverBadLogins, false, 'is still not over bad logins')
                                                                                            t.equal(isWayOverBadLogins, true, 'is now locked out')
                                                                                            t.end()
                                                                                          }
                                                                                        )
                                                                                      }
                                                                                    )
                                                                                  }
                                                                                )
                                                                              }
                                                                            )
                                                                          }
                                                                        )
                                                                      }
                                                                    )
                                                                  }
                                                                )
                                                              }
                                                            )
                                                          }
                                                        )
                                                      }
                                                    )
                                                  }
                                                )
                                              }
                                            )
                                          }
                                        )
                                      }
                                    )
                                  }
                                )
                              }
                            )
                          }
                        )
                      }
                    )
                  }
                )
              }
            )
          }
        )
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
