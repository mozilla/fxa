var test = require('tap').test
var crypto = require('crypto')
var P = require('p-promise')
var config = require('../../config').root()
var log = { trace: function() {} }
var dbs = require('../../kv')(config, log)

const HEX_STRING = /^(?:[a-fA-F0-9]{2})+$/

var sends = 0
var mailer = {
  sendVerifyCode: function () { sends++; return P(null) }
}

var models = require('../../models')(log, config, dbs, mailer)
var RecoveryEmail = models.RecoveryEmail

var email = Buffer('me@example.com').toString('hex')

test(
  'RecoveryEmail.create generates a random 32 byte code as a hex string',
  function (t) {
    function end() { t.end() }
    RecoveryEmail.create('xxx', email, true)
      .then(
        function (x) {
          t.equal(x.code.length, 8)
          t.equal(HEX_STRING.test(x.code), true)
          return x
        }
      )
      .then(
        function (x) {
          return x.del()
        }
      )
      .done(end, end)
  }
)

test(
  'RecoveryEmail.create calls mailer.sendVerifyCode',
  function (t) {
    sends = 0
    function end() { t.end() }
    RecoveryEmail.create('xxx', email, true)
      .then(
        function (x) {
          t.equal(sends, 1)
          sends = 0
          return x.del()
        }
      )
      .done(end, end)
  }
)

test(
  'recoveryEmail.verify sets verified to true if the codes match',
  function (t) {
    function end() { t.end() }
    RecoveryEmail.create('xxx', email, true)
      .then(
        function (x) {
          t.equal(x.verified, false)
          var c = x.code
          return x.verify(c)
        }
      )
      .then(
        function (x) {
          t.equal(x.verified, true)
          return x.del()
        }
      )
      .done(end, end)
  }
)

test(
  'recoveryEmail.verify does not set verified if codes do not match',
  function (t) {
    function end() { t.end() }
    RecoveryEmail.create('xxx', email, true)
      .then(
        function (x) {
          t.equal(x.verified, false)
          var c = crypto.randomBytes(32).toString('hex')
          return x.verify(c)
        }
      )
      .then(
        function (x) {
          t.equal(x.verified, false)
          return x.del()
        }
      )
      .done(end, end)
  }
)

test(
  'recoveryEmail.verify will not unset the verified flag from true to false',
  function (t) {
    function end() { t.end() }
    RecoveryEmail.create('xxx', email, true)
      .then(
        function (x) {
          t.equal(x.verified, false)
          var c = x.code
          return x.verify(c)
        }
      )
      .then(
        function (x) {
          t.equal(x.verified, true)
          return x.verify('bad1')
        }
      )
      .then(
        function (x) {
          t.equal(x.verified, true)
          return x.del()
        }
      )
      .done(end, end)
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
