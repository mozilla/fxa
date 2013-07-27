var test = require('tap').test
var P = require('p-promise')

var dbs = require('../kv')(
  {
    kvstore: {
      available_backends: ['memory'],
      backend: 'memory',
      cache: 'memory'
    }
  }
)

var mailer = {
  sendCode: function () { return P(null) }
}

var DOMAIN = 'example.com'
var models = require('../models')(DOMAIN, dbs, mailer)
var Account = models.Account
var RecoveryMethod = models.RecoveryMethod
var SessionToken = models.tokens.SessionToken

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
      .then(Account.get.bind(null, a.uid))
      .then(
        function (account) {
          t.equal(account.email, a.email)
        }
      )
      .then(Account.del.bind(null, a.uid))
      .done(
        function () { t.end() },
        function (err) { t.fail(err); t.end() })
  }
)

test(
  'Account.create adds a primary recovery method',
  function (t) {
    Account.create(a)
      .then(Account.get.bind(null, a.uid))
      .then(
        function (account) {
          t.equal(account.recoveryMethodIds[a.email], true)
        }
      )
      .then(RecoveryMethod.get.bind(null, a.email))
      .then(
        function (rm) {
          t.equal(rm.uid, a.uid)
        }
      )
      .then(Account.del.bind(null, a.uid))
      .done(
        function () { t.end() },
        function (err) { t.fail(err); t.end() })
  }
)

test(
  'Account.create returns an error if the account exists',
  function (t) {
    Account.create(a)
      .then(Account.create.bind(null, a))
      .then(
        function () {
          t.fail('should not have created an account')
        },
        function (err) {
          t.equal(err.message, "AccountExists")
        }
      )
      .then(Account.del.bind(null, a.uid))
      .done(
        function () { t.end() },
        function (err) { t.fail(err); t.end() })
  }
)

test(
  'Account.getId returns the uid given an email',
  function (t) {
    Account.create(a)
      .then(Account.getId.bind(null, a.email))
      .then(
        function (id) {
          t.equal(id, a.uid)
        }
      )
      .then(Account.del.bind(null, a.uid))
      .done(
        function () { t.end() },
        function (err) { t.fail(err); t.end() })
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
      function (err) { t.fail(err); t.end() }
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
      .then(Account.del.bind(null, a.uid))
      .done(
        function () { t.end() },
        function (err) { t.fail(err); t.end() }
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
      .then(Account.del.bind(null, a.uid))
      .then(Account.get.bind(null, a.uid))
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
      .then(Account.del.bind(null, a.uid))
      .done(
        function () { t.end() },
        function (err) { t.fail(err); t.end() }
      )
  }
)

test(
  'account.addSessionToken works',
  function (t) {
    var account = null
    var token = null
    Account.create(a)
      .then(
        function (x) {
          account = x
          return SessionToken.create(x.uid)
        }
      )
      .then(
        function (t) {
          token = t
          return account.addSessionToken(t)
        }
      )
      .then(
        function (x) {
          t.equal(x.sessionTokenIds[token.id], true)
        }
      )
      .then(Account.del.bind(null, a.uid))
      .done(
        function () { t.end() },
        function (err) { t.fail(err); t.end() }
      )
  }
)

test(
  'account.recoveryMethods returns an array of RecoveryMethod objects',
  function (t) {
    Account.create(a)
      .then(
        function (account) {
          return account.recoveryMethods()
        }
      )
      .then(
        function (rms) {
          t.equal(rms.length, 1)
          t.equal(rms[0] instanceof RecoveryMethod, true)
        }
      )
      .then(Account.del.bind(null, a.uid))
      .done(
        function () { t.end() },
        function (err) { t.fail(err); t.end() }
      )
  }
)

test(
  'account.reset changes wrapKb and verifier',
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
