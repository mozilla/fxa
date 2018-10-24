/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const ROOT_DIR = '../../..'

const { assert } = require('chai')
const proxyquire = require('proxyquire')
const sinon = require('sinon')

const FIREFOX_CLIENT = {
  name: 'Firefox'
}
const OAUTH_CLIENT = {
  name: 'FxA OAuth Console'
}

describe('lib/senders/oauth_client_info:', () => {

  describe('fetch:', () => {
    let clientInfo
    let fetch
    let mockLog
    const mockConfig = {
      oauth: {
        url: 'http://localhost:9010',
        clientInfoCacheTTL: 5
      }
    }

    beforeEach(() => {
      mockLog = {
        fatal: sinon.spy(),
        trace: sinon.spy(),
        critical: sinon.spy(),
        warn: sinon.spy()
      }
      clientInfo = require(`${ROOT_DIR}/lib/senders/oauth_client_info`)(mockLog, mockConfig)
      fetch = clientInfo.fetch
    })

    afterEach(() => {
      return clientInfo.__clientCache.clear()
    })

    it('returns Firefox if no client id', () => {
      return fetch().then((res) => {
        assert.deepEqual(res, FIREFOX_CLIENT)
      })
    })

    it('returns Firefox if service=sync', () => {
      return fetch('sync').then((res) => {
        assert.deepEqual(res, FIREFOX_CLIENT)
      })
    })

    it('falls back to Firefox if error', () => {
      const mocks = {
        'request': function (options, cb) {
          cb(new Error('Request failed'))
        }
      }

      fetch = proxyquire(`${ROOT_DIR}/lib/senders/oauth_client_info`, mocks)(mockLog, mockConfig).fetch

      return fetch('24bdbfa45cd300c5').then((res) => {
        assert.deepEqual(res, FIREFOX_CLIENT)
        assert.ok(mockLog.critical.calledOnce, 'called critical log')
      })
    })

    it('falls back to Firefox if non-200 response', () => {
      const mocks = {
        'request': function (options, cb) {
          cb(null, {
            statusCode: 400
          }, {
            code: 400,
            errno: 109
          })
        }
      }

      fetch = proxyquire(`${ROOT_DIR}/lib/senders/oauth_client_info`, mocks)(mockLog, mockConfig).fetch

      return fetch('f00bdbfa45cd300c5').then((res) => {
        assert.deepEqual(res, FIREFOX_CLIENT)
        assert.ok(mockLog.warn.calledOnce, 'called warn log')
      })
    })

    it('fetches and memory caches client information', () => {
      const requestMock = sinon.spy(function (options, cb) {
        assert.equal(options.url, 'http://localhost:9010/v1/client/24bdbfa45cd300c5')
        assert.equal(options.method, 'GET')
        assert.equal(options.json, true)
        cb(null, {
          statusCode: 200
        }, OAUTH_CLIENT)
      })
      const mocks = {
        'request': requestMock
      }

      fetch = proxyquire(`${ROOT_DIR}/lib/senders/oauth_client_info`, mocks)(mockLog, mockConfig).fetch

      return fetch('24bdbfa45cd300c5').then((res) => {
        assert.deepEqual(res, OAUTH_CLIENT)
        assert.equal(mockLog.trace.getCall(0).args[0].op, 'fetch.start')
        assert.equal(mockLog.trace.getCall(1).args[0].op, 'fetch.usedServer')
        assert.equal(mockLog.trace.getCall(2), null)
        assert.ok(requestMock.calledOnce)

        // second call is cached
        return fetch('24bdbfa45cd300c5')
      }).then((res) => {
        assert.equal(mockLog.trace.getCall(2).args[0].op, 'fetch.start')
        assert.equal(mockLog.trace.getCall(3).args[0].op, 'fetch.usedCache')
        assert.ok(requestMock.calledOnce)
        assert.deepEqual(res, OAUTH_CLIENT)
      })

    })


    it('memory cache expires', () => {
      const requestMock = sinon.spy(function (options, cb) {
        cb(null, {
          statusCode: 200
        }, OAUTH_CLIENT)
      })
      const mocks = {
        'request': requestMock
      }

      fetch = proxyquire(`${ROOT_DIR}/lib/senders/oauth_client_info`, mocks)(mockLog, mockConfig).fetch

      return fetch('24bdbfa45cd300c5').delay(15).then((res) => {
        assert.deepEqual(res, OAUTH_CLIENT)
        assert.equal(mockLog.trace.getCall(1).args[0].op, 'fetch.usedServer')
        assert.ok(requestMock.calledOnce)

        // second call uses server, cache expired
        return fetch('24bdbfa45cd300c5')
      }).then((res) => {
        assert.equal(mockLog.trace.getCall(3).args[0].op, 'fetch.usedServer')
        assert.ok(requestMock.calledTwice)
        assert.deepEqual(res, OAUTH_CLIENT)
      })
    })

    it('rejects invalid client names', () => {
      const requestMock = sinon.spy(function (options, cb) {
        cb(null, {
          statusCode: 200
        }, {
          name: Array(512).fill('a').join('')
        })
      })
      const mocks = {
        'request': requestMock
      }

      fetch = proxyquire(`${ROOT_DIR}/lib/senders/oauth_client_info`, mocks)(mockLog, mockConfig).fetch

      return fetch('24bdbfa45cd300c5').then((res) => {
        assert.deepEqual(res, FIREFOX_CLIENT)
        assert.ok(requestMock.calledOnce)
      })

    })
  })
})

