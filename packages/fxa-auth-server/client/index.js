var crypto = require('crypto')

var request = require('request')
var bigint = require('bigint')
var hawk = require('hawk')

var hkdf = require('../hkdf')

var Bundle = require('../bundle')(crypto, bigint, require('p-promise'), hkdf)
var tokens = require('../tokens')(Bundle, {})


var srp = require('../srp')

var tokenTypes = {
  sign: {
    startPath: '/session/auth/start',
    finishPath: '/session/auth/finish',
    context: 'session/auth'
  },
  reset: {
    startPath: '/password/change/auth/start',
    finishPath: '/password/change/auth/finish',
    context: 'password/change'
  }
}

function Client(server) {
  this.server = server
}

Client.prototype.makeRequest = function (method, path, options, callback) {
  options = options || {}

  request({
    url: this.server + path,
    method: method,
    headers: options.headers,
    json: options.payload || true
  }, function (err, res, body) {
    callback(err, body)
  })
}

Client.prototype.getToken1 = function (tokenType, email, callback) {
  this.makeRequest(
    'POST',
    tokenTypes[tokenType].startPath,
    {
      headers: {
        'Content-Type': 'application/json'
      },
      payload: {
        email: email
      }
    },
    callback
  )
}

Client.prototype.getToken2 = function (tokenType, session, email, password, callback) {
  var json = session
  var a = bigint.fromBuffer(crypto.randomBytes(32))
  var g = srp.params[json.srp.N_bits].g
  var N = srp.params[json.srp.N_bits].N
  var A = srp.getA(g, a, N)
  var B = bigint(json.srp.B, 16)
  var S = srp.client_getS(
    Buffer(json.srp.s, 'hex'),
    Buffer(email),
    Buffer(password),
    N,
    g,
    a,
    B,
    json.srp.alg
  )

  var M = srp.getM(A, B, S)
  var K = srp.getK(S, N, json.srp.alg).toBuffer()
  this.makeRequest(
    'POST',
    tokenTypes[tokenType].finishPath,
    {
      payload: {
        srpToken: json.srpToken,
        A: A.toBuffer().toString('hex'),
        M: M.toBuffer().toString('hex')
      }
    },
    function (err, res) {
      if (err) return callback(err)
      var json = res
      hkdf(K, tokenTypes[tokenType].context, null, 3 * 32)
        .done(
            function (key) {
              var respHMACkey = key.slice(0, 32)
              var respXORkey = key.slice(32, 96)
              var blob = Buffer(json.bundle, 'hex')
              var cyphertext = blob.slice(0, blob.length - 32)
              var hmac = blob.slice(blob.length - 32, blob.length)

              var check = crypto.createHmac('sha256', respHMACkey)
              check.update(cyphertext)
              if (hmac.toString('hex') !== check.digest('hex')) {
                return callback(new Error("Corrupted Message"))
              }
              var cleartext = bigint.fromBuffer(cyphertext)
                .xor(bigint.fromBuffer(respXORkey))
                .toBuffer()
              var result = {
                keyFetchToken: cleartext.slice(0, 32).toString('hex')
              }
              if (tokenType === 'sign') {
                result.sessionToken = cleartext.slice(32, 64).toString('hex')
              }
              else {
                result.accountResetToken = cleartext.slice(32, 64).toString('hex')
              }

              callback(null, result)
            }
          )
    }
  )
}

Client.prototype.create = function (email, password, callback) {
  var alg = 'sha256'
  var salt = crypto.randomBytes(32)
  var verifier = srp.getv(
    Buffer(salt, 'hex'),
    Buffer(email),
    Buffer(password),
    srp.params['2048'].N,
    srp.params['2048'].g,
    alg
  )

  this.makeRequest(
    'POST',
    '/account/create',
    {
      payload: {
        email: email,
        verifier: verifier.toBuffer().toString('hex'),
        salt: salt.toString('hex'),
        params: {
          srp: {
            alg: alg,
            N_bits: 2048
          },
          stretch: {
            salt: 'DEAD',
            rounds: 0
          }
        }
      }
    },
    callback
  )
}

Client.prototype.startLogin = function (email, callback) {
  return this.getToken1('sign', email, callback)
}

Client.prototype.finishLogin = function (session, email, password, callback) {
  return this.getToken2('sign', session, email, password, callback)
}

Client.prototype.sign = function (publicKey, duration, sessionToken, callback) {
  hkdf(Buffer(sessionToken, 'hex'), 'session', null, 2 * 32)
    .done(
      function (key) {
        var keys = {
          id: key.slice(0, 32),
          key: key.slice(32, 64)
        }
        var credentials = {
          id: keys.id.toString('hex'),
          key: keys.key.toString('hex'),
          algorithm: 'sha256'
        }
        var payload = {
          publicKey: publicKey,
          duration: duration
        }
        var verify = {
          credentials: credentials,
          contentType: 'application/json',
          payload: JSON.stringify(payload)
        }
        var header = hawk.client.header('http://localhost/certificate/sign', 'POST', verify)
        this.makeRequest(
          'POST',
          '/certificate/sign',
          {
            headers: {
              Authorization: header.field,
              Host: 'localhost',
              'Content-Type': 'application/json'
            },
            payload: payload
          },
          callback
        )
      }.bind(this)
    )
}

Client.prototype.passwordChangeStart = function (sessionToken, callback) {
  tokens.SessionToken.fromHex(sessionToken)
    .done(
      function (token) {
        var credentials = {
          id: token.id,
          key: token.key,
          algorithm: 'sha256'
        }
        var verify = {
          credentials: credentials,
          contentType: 'application/json'
        }

        var header = hawk.client.header('http://localhost/password/change/auth/start', 'POST', verify)

        this.makeRequest(
          'POST',
          '/password/change/auth/start',
          {
            headers: {
              Authorization: header.field,
              Host: 'localhost',
              'Content-Type': 'application/json'
            }
          },
          callback
        )

      }.bind(this)
    )
}

Client.prototype.passwordChangeFinish = function (session, email, password, callback) {
  return this.getToken2('reset', session, email, password, callback)
}

Client.prototype.resetAccount = function (resetToken, email, password, salt, wrapKb, callback) {
  tokens.AccountResetToken.fromHex(resetToken)
    .done(
      function (token) {
        var verifier = srp.getv(
          Buffer(salt, 'hex'),
          Buffer(email),
          Buffer(password),
          srp.params['2048'].N,
          srp.params['2048'].g,
          'sha256'
        ).toBuffer().toString('hex')

        var credentials = {
          id: token.id,
          key: token.key,
          algorithm: 'sha256'
        }

        var payload = {
          bundle: token.bundle(wrapKb, verifier),
          params: {
            srp: {
              alg: 'sha256',
              N_bits: 2048
            },
            stretch: {
              salt: salt,
              rounds: 1000000
            }
          }
        }

        var verify = {
          credentials: credentials,
          contentType: 'application/json',
          payload: JSON.stringify(payload)
        }

        var header = hawk.client.header('http://localhost/account/reset', 'POST', verify)
        this.makeRequest(
          'POST',
          '/account/reset',
          {
            headers: {
              Authorization: header.field,
              Host: 'localhost',
              'Content-Type': 'application/json'
            },
            payload: payload
          },
          callback
        )
      }.bind(this)
    )
}

module.exports = Client
