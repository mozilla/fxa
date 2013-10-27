var test = require('tap').test
var crypto = require('crypto')
var log = { trace: function() {} }

var sends = 0

var tokens = require('../../tokens')(log)
var ForgotPasswordToken = tokens.ForgotPasswordToken

var email = Buffer('test@example.com').toString('hex')

test(
  'ttl "works"',
  function (t) {
    ForgotPasswordToken.create('xxx', email)
      .done(
        function (x) {
          t.equal(x.ttl(), 900)
          setTimeout(
            function () {
              var ttl = x.ttl()
              t.ok(ttl < 900 && ttl > 898) // allow some wiggle room
              t.end()
            },
            1000
          )
        }
      )
  }
)

test(
  'failAttempt decrements `tries`',
  function (t) {
    ForgotPasswordToken.create('xxx', email)
      .done(
        function (x) {
          t.equal(x.tries, 3)
          t.equal(x.failAttempt(), false)
          t.equal(x.tries, 2)
          t.equal(x.failAttempt(), false)
          t.equal(x.tries, 1)
          t.equal(x.failAttempt(), true)
          t.end()
        }
      )
  }
)
