var test = require('tap').test
var crypto = require('crypto')
var log = { trace: function() {} }

var tokens = require('../../tokens')(log)
var AuthToken = tokens.AuthToken

test(
  'bundle / unbundle works',
  function (t) {
    function end() { t.end() }
    AuthToken.create('xxx')
      .then(
        function (x) {
          var keyFetchTokenHex = crypto.randomBytes(32).toString('hex')
          var sessionTokenHex = crypto.randomBytes(32).toString('hex')
          var b = x.bundle(keyFetchTokenHex, sessionTokenHex)
          var ub = x.unbundle(b)
          t.equal(ub.keyFetchTokenHex, keyFetchTokenHex)
          t.equal(ub.sessionTokenHex, sessionTokenHex)
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
