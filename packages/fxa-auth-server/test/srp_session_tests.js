var test = require('tap').test
var crypto = require('crypto')
var bigint = require('bigint')
var P = require('p-promise')
var uuid = require('uuid')
var srp = require('../srp')

function FakeToken() {}

FakeToken.get = function () { return P(new FakeToken())}

FakeToken.prototype.del = function () { return P(null) }

var db = require('../db')({
  kvstore: {
    available_backends: ['memory'],
    backend: 'memory',
    cache: 'memory'
  }
})

var Account = require('../account')(P, FakeToken, db.store, 'example.com')
var SrpSession = require('../srp_session')(P, uuid, srp, bigint, db.cache, Account)

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
).toBuffer().toString('hex')

Account.create(alice)
.then(
  function (a) {

    test(
      'create login session',
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
      'finish login session',
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
