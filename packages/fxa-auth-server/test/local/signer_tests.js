/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var path = require('path')
var CC = require('compute-cluster')
var jwcrypto = require('jwcrypto')
var config = require('../../config').root()
var signer = new CC({ module: path.join(__dirname, '../signer-stub.js')})
signer.on('error', function () {}) // don't die

var validKey = {
  algorithm: 'RS',
  n: '4759385967235610503571494339196749614544606692567785790953934768202714280652973091341316862993582789079872007974809511698859885077002492642203267408776123',
  e: '65537'
}

test(
  'returns an error on undefined publicKey',
  function (t) {
    signer.enqueue(
      {
        email: 'test@example.com',
        duration: 100
      },
      function (err, result) {
        t.ok(result.err, 'undefined publicKey')
        t.end()
      }
    )
  }
)

test(
  'returns an error on empty publicKey',
  function (t) {
    signer.enqueue(
      {
        email: 'test@example.com',
        publicKey: {},
        duration: 100
      },
      function (err, result) {
        t.equal(result.err.message, 'no such algorithm: undefined', 'no algorithm')
        t.end()
      }
    )
  }
)

test(
  'returns and error on publicKey with missing parameters',
  function (t) {
    signer.enqueue(
      {
        email: 'test@example.com',
        publicKey: {
          algorithm: 'RS',
          n: '1234'
        },
        duration: 100
      },
      function (err, result) {
        t.equal(result.err.message, 'bad key', 'bad key')
        t.end()
      }
    )
  }
)

test(
  'returns and error on publicKey with bad parameters',
  function (t) {
    signer.enqueue(
      {
        email: 'test@example.com',
        publicKey: {
          algorithm: 'RS',
          n: '7',
          e: '65537'
        },
        duration: 100
      },
      function (err, result) {
        t.equal(result.err.message, 'bad key', 'bad key')
        t.end()
      }
    )
  }
)

test(
  'returns an error with a bad duration',
  function (t) {
    signer.enqueue(
      {
        email: 'test@example.com',
        publicKey: validKey,
        duration: -1
      },
      function (err, result) {
        t.equal(result.err.message, 'bad duration', 'bad duration')
        t.end()
      }
    )
  }
)

test(
  'returns an error with a string duration',
  function (t) {
    signer.enqueue(
      {
        email: 'test@example.com',
        publicKey: validKey,
        duration: '2'
      },
      function (err, result) {
        t.equal(result.err.message, 'bad duration', 'bad duration')
        t.end()
      }
    )
  }
)

test(
  'returns an error with no email',
  function (t) {
    signer.enqueue(
      {
        publicKey: validKey,
        duration: 100
      },
      function (err, result) {
        t.equal(result.err.message, 'bad email', 'bad email')
        t.end()
      }
    )
  }
)

test(
  'returns a cert with a good publicKey',
  function (t) {
    signer.enqueue(
      {
        email: 'test@example.com',
        publicKey: validKey,
        duration: 100
      },
      function (err, result) {
        t.ok(result.cert, 'got cert')
        t.end()
      }
    )
  }
)

test(
  'crash',
  function (t) {
    signer.enqueue(
      {
        crash: true,
        email: 'test@example.com',
        publicKey: validKey,
        duration: 100
      },
      function (err, result) {
        t.ok(err, 'worker crashed')
        t.end()
      }
    )
  }
)

test(
  'returns an error if the worker backlog is full',
  function (t) {
    var count = signer._MAX_BACKLOG * 2
    var failed = 0
    var x = 0
    function done(err, result) {
      if (err) {
        failed++
      }
      if (++x === count) {
        t.ok(failed > 0, failed + ' requests failed')
        t.end()
      }
    }
    for (var i = 0; i < count; i++) {
      signer.enqueue(
        {
          email: 'test@example.com',
          publicKey: validKey,
          duration: 100
        },
        done
      )
    }
  }
)

test(
  'the signed cert is properly formatted',
  function (t) {
    var email = 'test@example.com'
    var duration = 100
    signer.enqueue(
      {
        email: email,
        publicKey: validKey,
        duration: duration
      },
      function (err, result) {
        t.ok(result, 'got cert')
        var payload = jwcrypto.extractComponents(result.cert).payload
        t.deepEqual(payload['public-key'], validKey, 'key, check')
        t.equal(payload.principal.email, email, 'email, check')
        t.equal(payload.iss, config.domain, 'issuer, check')
        t.equal(payload.exp, payload.iat + duration + 10000, 'exp, check')
        t.end()
      }
    )
  }
)

test(
  'the cert includes a generation number if given',
  function (t) {
    var email = 'test@example.com'
    var duration = 100
    var generation = 1234
    signer.enqueue(
      {
        email: email,
        publicKey: validKey,
        duration: duration,
        generation: generation
      },
      function (err, result) {
        t.ok(result, 'got cert')
        var payload = jwcrypto.extractComponents(result.cert).payload
        t.equal(payload['fxa-generation'], generation, 'generation, check')
        t.end()
      }
    )
  }
)

test(
  'teardown',
  function (t) {
    signer.exit(
      function (err) {
        t.equal(err, null, 'clean shutdown')
        t.end()
      }
    )
  }
)
