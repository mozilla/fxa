var test = require('tap').test
var P = require('p-promise')
var srp = require('srp')
var config = require('../../config').root()

var dbs = require('../../kv')(config)

var mailer = {
  sendVerifyCode: function () { return P(null) }
}

var models = require('../../models')(config, dbs, mailer)
var Account = models.Account
var SrpSession = models.SrpSession

var alice = {
  uid: 'xxx',
  email: Buffer('somebödy@example.com').toString('hex'),
  password: 'awesomeSauce',
  srp: {
    verifier: null,
    salt: 'BAD1'
  },
  kA: 'BAD3',
  wrapKb: 'BAD4'
}

alice.srp.verifier = srp.getv(
  Buffer(alice.srp.salt, 'hex'),
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
        SrpSession.create(a)
          .done(
            function (s) {
              t.equal(s.uid, a.uid)
              t.equal(s.s, a.srp.salt)
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
        SrpSession.create(a)
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

    test(
      'teardown',
      function (t) {
        dbs.cache.close()
        dbs.store.close()
        t.end()
      }
    )
  }
)
