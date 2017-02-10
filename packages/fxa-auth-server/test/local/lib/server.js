/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
const server = require('../../../lib/server')

describe('lib/server', () => {
  describe('trimLocale', () => {
    it('trims given locale', () => {
      assert.equal(server._trimLocale('   fr-CH, fr;q=0.9    '), 'fr-CH, fr;q=0.9')
    })
  })

  describe('logEndpointErrors', () => {
    const msg = 'Timeout'
    const reason = 'Socket fail'
    const response = {
      __proto__: {
        name: 'EndpointError'
      },
      message: msg,
      reason: reason
    }

    it('logs an endpoint error', (done) => {
      const mockLog = {
        error: (err) => {
          assert.equal(err.op, 'server.EndpointError')
          assert.equal(err.message, msg)
          assert.equal(err.reason, reason)
          done()
        }
      }
      assert.equal(server._logEndpointErrors(response, mockLog))
    })

    it('logs an endpoint error with a method', (done) => {
      response.attempt = {
        method: 'PUT'
      }

      const mockLog = {
        error: (err) => {
          assert.equal(err.op, 'server.EndpointError')
          assert.equal(err.message, msg)
          assert.equal(err.reason, reason)
          assert.equal(err.method, 'PUT')
          done()
        }
      }
      assert.equal(server._logEndpointErrors(response, mockLog))
    })
  })
})
