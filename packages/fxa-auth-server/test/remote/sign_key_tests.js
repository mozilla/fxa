/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
const P = require('../../lib/promise')
const TestServer = require('../test_server')
const request = P.promisify(require('request'), { multiArgs: true })
const path = require('path')

describe('remote sign key', function() {
  this.timeout(15000)
  let server
  before(() => {
    process.env.OLD_PUBLIC_KEY_FILE = path.resolve(__dirname, '../../config/public-key.json')
    var config = require('../../config').getProperties()
    return TestServer.start(config)
      .then(s => {
        server = s
      })
  })

  it(
    '.well-known/browserid has keys',
    () => {
      return request('http://127.0.0.1:9000/.well-known/browserid')
        .spread((res, body) => {
          assert.equal(res.statusCode, 200)
          var json = JSON.parse(body)
          assert.equal(json.authentication, '/.well-known/browserid/sign_in.html')
          assert.equal(json.keys.length, 2)
        })
    }
  )

  after(() => {
    delete process.env.OLD_PUBLIC_KEY_FILE
    return TestServer.stop(server)
  })
})
