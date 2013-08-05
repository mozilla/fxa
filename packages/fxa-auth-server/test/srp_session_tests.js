var test = require('tap').test
var P = require('p-promise')
var srp = require('srp')
var config = require('../config').root()

var dbs = require('../kv')(config)

var mailer = {
  sendCode: function () { return P(null) }
}

var models = require('../models')(config, dbs, mailer)
var Account = models.Account
var SrpSession = models.SrpSession

var alice = {
  uid: 'xxx',
  email: 'somebody@example.com',
  password: 'awesomeSauce',
  verifier: null,
  salt: 'BAD1',
  kA: 'BAD3',
  wrapKb: 'BAD4'
}

alice.verifier = srp.getv(
  Buffer(alice.salt, 'hex'),
  Buffer(alice.email),
  Buffer(alice.password),
  srp.params[2048].N,
  srp.params[2048].g,
  'sha256'
).toString('hex')

Account.create(alice)
.done(
  function (a) {

    test(
      'create login session works',
      function (t) {
        SrpSession
          .create('login', a)
          .done(
            function (s) {
              t.equal(s.uid, a.uid)
              t.equal(s.s, a.salt)
              t.equal(s.type, 'login')

              t.end()
            }
          )
      }
    )

    test(
      'finish login session works',
      function (t) {
        var session = null
        var K = null
        SrpSession
          .create('login', a)
          .then(
            function (s) {
              session = s
              return SrpSession.client2(s.clientData(), alice.email, alice.password)
            }
          )
          .then(
            function (x) {
              K = x.K
              return SrpSession.finish(session.id, x.A, x.M)
            }
          )
          .done(
            function (s) {
              t.equal(s.K.toString('hex'), K)
              t.end()
            }
          )
      }
    )
  }
)
