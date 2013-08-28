var test = require('tap').test
var crypto = require('crypto')
var P = require('p-promise')
var config = require('../../config').root()
var log = { trace: function() {} }
var dbs = require('../../kv')(config, log)

var sends = 0
var mailer = {
  sendRecoveryCode: function () { sends++; return P(null) }
}

var models = require('../../models')(log, config, dbs, mailer)
var ForgotPasswordToken = models.tokens.ForgotPasswordToken

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
  'sendRecoveryCode calls the mailer',
  function (t) {
    ForgotPasswordToken.create('xxx', email)
      .then(
        function (x) {
          return x.sendRecoveryCode()
        }
      )
      .done(
        function () {
          t.equal(sends, 1, 'mail sent')
          t.end()
        }
      )
  }
)

test(
  'failAttempt decrements `tries`',
  function (t) {
    ForgotPasswordToken.create('xxx', email)
      .then(
        function (x) {
          t.equal(x.tries, 3)
          return x.failAttempt()
        }
      )
      .done(
        function (x) {
          t.equal(x.tries, 2)
          t.end()
        }
      )
  }
)

test(
  'failAttempt deletes the token if out of tries',
  function (t) {
    var tokenId = null
    ForgotPasswordToken.create('xxx', email)
      .then(
        function (x) {
          tokenId = x.id
          x.tries = 1
          return x.failAttempt()
        }
      )
      .then(
        function () {
          return ForgotPasswordToken.get(tokenId)
        }
      )
      .done(
        function (x) {
          t.equal(x, null)
          t.end()
        }
      )
  }
)

test(
  'teardown',
  function (t) {
    dbs.cache.close()
    dbs.store.close()
    t.end()
  }
)
