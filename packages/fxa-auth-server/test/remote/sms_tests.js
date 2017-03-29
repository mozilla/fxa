/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
const TestServer = require('../test_server')
const Client = require('../client')()
const config = require('../../config').getProperties()

describe('remote sms', () => {
  let server

  before(() => {
    config.sms.enabled = true
    config.sms.isStatusGeoEnabled = true

    return TestServer.start(config)
      .then(result => {
        server = result
      })
  })

  it('GET /sms/status', () => {
    return Client.create(config.publicUrl, server.uniqueEmail(), 'wibble')
      .then(client => {
        return client.smsStatus()
          .then(status => {
            assert.ok(status)
            assert.equal(typeof status.ok, 'boolean')
            assert.equal(status.country, 'US')
          })
      })
  })

  after(() => {
    return TestServer.stop(server)
  })
})
