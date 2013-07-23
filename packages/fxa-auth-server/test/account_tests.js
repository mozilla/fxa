var test = require('tap').test
var P = require('p-promise')

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
var DOMAIN = 'example.com'
var Account = require('../account')(P, FakeToken, db.store, DOMAIN)
var a = {
  uid: 'xxx',
  email: 'somebody@example.com',
  verifier: 'BAD1',
  salt: 'BAD2',
  kA: 'BAD3',
  wrapKb: 'BAD4'
}

test(
  'Account.principal uses the given uid and adds the domain',
  function (t) {
    t.equal(Account.principal('xyz'), 'xyz@' + DOMAIN)
    t.end()
  }
)

test(
  'Account.create adds a new account',
  function (t) {
    Account.create(a)
      .then(Account.getById.bind(null, a.uid))
      .then(
        function (x) {
          t.equal(x.email, a.email)
        }
      )
      .then(Account.del.bind(null, a.email))
      .done(
        function () { t.end() },
        function () { t.fail(); t.end() })
  }
)

test(
  'Account.getId works',
  function (t) {
    Account.create(a)
      .then(Account.getId.bind(null, a.email))
      .then(
        function (id) {
          t.equal(id, a.uid)
        }
      )
      .then(Account.del.bind(null, a.email))
      .done(
        function () { t.end() },
        function () { t.fail(); t.end() })
  }
)

test(
  'Account.exists returns false if the email is not in use',
  function (t) {
    Account.exists('nobody@example.com').done(
      function (exists) {
        t.equal(exists, false)
        t.end()
      },
      function () { t.fail(); t.end() }
    )
  }
)

test(
  'Account.exists returns true if the email is in use',
  function (t) {
    Account.create(a)
      .then(Account.exists.bind(null, a.email))
      .then(
        function (exists) {
          t.equal(exists, true)
        }
      )
      .then(Account.del.bind(null, a.email))
      .done(
        function () { t.end() },
        function () { t.fail(); t.end() }
      )
  }
)

test(
  'Account.del deletes the account with the given email',
  function (t) {
    Account.create(a)
      .then(Account.exists.bind(null, a.email))
      .then(
        function (exists) {
          t.equal(exists, true)
        }
      )
      .then(Account.del.bind(null, a.email))
      .then(Account.getById.bind(null, a.uid))
      .done(
        function (account) {
          t.equal(account, null)
          t.end()
        },
        function (err) {
          t.fail(err)
          t.end()
        }
      )
  }
)

test(
  'Account.getByEmail works',
  function (t) {
    Account.create(a)
      .then(Account.getByEmail.bind(null, a.email))
      .then(
        function (account) {
          t.equal(account.email, a.email)
        }
      )
      .then(Account.del.bind(null, a.email))
      .done(
        function () { t.end() },
        function () { t.fail(); t.end() }
      )
  }
)

test(
  'account.reset does something',
  function (t) {
    var form = {
      wrapKb: 'DEADBEEF',
      verifier: 'FEEDFACE',
      params: {
        stuff: true
      }
    }
    Account.create(a)
      .then(
        function (account) {
          return account.reset(form)
        }
      )
      .done(
        function (account) {
          t.equal(account.wrapKb, form.wrapKb)
          t.equal(account.verifier, form.verifier)
          t.end()
        },
        function (err) {
          t.fail(err)
          t.end()
        }
      )
  }
)
