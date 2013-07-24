var inherits = require('util').inherits
var crypto = require('crypto')

module.exports = function (Bundle, dbs) {
  var Token = require('./token')(inherits, Bundle)

  var KeyFetchToken = require('./key_fetch_token')(inherits, Token, dbs.store)
  var AccountResetToken = require('./account_reset_token')(inherits, Token, crypto, dbs.store)
  var SessionToken = require('./session_token')(inherits, Token, dbs.store)

  return {
    KeyFetchToken: KeyFetchToken,
    AccountResetToken: AccountResetToken,
    SessionToken: SessionToken
  }
}
