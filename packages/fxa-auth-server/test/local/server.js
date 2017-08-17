/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const ROOT_DIR = '../..'

const assert = require('insist')
const EndpointError = require('poolee/lib/error')(require('util').inherits)
const error = require(`${ROOT_DIR}/lib/error`)
const hapi = require('hapi')
const mocks = require('../mocks')
const server = require(`${ROOT_DIR}/lib/server`)
const sinon = require('sinon')

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

  describe('create:', () => {
    let log, config, routes, db, instance, response, translator

    beforeEach(() => {
      log = mocks.spyLog()
      config = getConfig()
      routes = getRoutes()
      db = mocks.mockDB()
      translator = {
        getTranslator: sinon.spy(() => ({ en: { format: () => {}, language: 'en' } })),
        getLocale: sinon.spy(() => 'en')
      }
      instance = server.create(log, error, config, routes, db, translator)
    })

    it('returned a hapi Server instance', () => {
      assert.ok(instance instanceof hapi.Server)
    })

    describe('server.start:', () => {
      beforeEach(() => instance.start())
      afterEach(() => instance.stop())

      it('did not call log.begin', () => {
        assert.equal(log.begin.callCount, 0)
      })

      it('did not call log.summary', () => {
        assert.equal(log.summary.callCount, 0)
      })

      describe('successful request, acceptable locale, signinCodes feature enabled:', () => {
        let request

        beforeEach(() => {
          response = 'ok'
          return instance.inject({
            headers: {
              'accept-language': 'fr-CH, fr;q=0.9, en-GB, en;q=0.5',
              'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:57.0) Gecko/20100101 Firefox/57.0'
            },
            method: 'POST',
            url: '/account/create',
            payload: {
              features: [ 'signinCodes' ]
            }
          }).then(response => request = response.request)
        })

        it('called log.begin correctly', () => {
          assert.equal(log.begin.callCount, 1)
          const args = log.begin.args[0]
          assert.equal(args.length, 2)
          assert.equal(args[0], 'server.onRequest')
          assert.ok(args[1])
          assert.equal(args[1].path, '/account/create')
          assert.equal(args[1].app.locale, 'en')
        })

        it('called log.summary correctly', () => {
          assert.equal(log.summary.callCount, 1)
          const args = log.summary.args[0]
          assert.equal(args.length, 2)
          assert.equal(args[0], log.begin.args[0][1])
          assert.ok(args[1])
          assert.equal(args[1].isBoom, undefined)
          assert.equal(args[1].message, undefined)
          assert.equal(args[1].errno, undefined)
          assert.equal(args[1].statusCode, 200)
          assert.equal(args[1].source, 'ok')
        })

        it('did not call log.error', () => {
          assert.equal(log.error.callCount, 0)
        })

        it('parsed features correctly', () => {
          assert.ok(request.app.features)
          assert.equal(typeof request.app.features.has, 'function')
          assert.equal(request.app.features.has('signinCodes'), true)
        })

        it('parsed user agent correctly', () => {
          assert.ok(request.app.ua)
          assert.equal(request.app.ua.browser, 'Firefox')
          assert.equal(request.app.ua.browserVersion, '57')
          assert.equal(request.app.ua.os, 'Mac OS X')
          assert.equal(request.app.ua.osVersion, '10.11')
          assert.equal(request.app.ua.deviceType, null)
          assert.equal(request.app.ua.formFactor, null)
        })

        describe('another request:', () => {
          let secondRequest

          beforeEach(() => {
            response = 'ok'
            return instance.inject({
              headers: {
                'accept-language': 'fr-CH, fr;q=0.9, en-GB, en;q=0.5',
                'user-agent': 'Firefox-Android-FxAccounts/34.0a1 (Nightly)'
              },
              method: 'POST',
              url: '/account/create',
              payload: {
                features: [ 'signinCodes' ]
              }
            }).then(response => secondRequest = response.request)
          })

          it('second request has its own user agent info', () => {
            assert.notEqual(request, secondRequest)
            assert.notEqual(request.app.ua, secondRequest.app.ua)
            assert.equal(secondRequest.app.ua.browser, 'Nightly')
            assert.equal(secondRequest.app.ua.browserVersion, '34.0a1')
            assert.equal(secondRequest.app.ua.os, 'Android')
            assert.equal(secondRequest.app.ua.osVersion, null)
            assert.equal(secondRequest.app.ua.deviceType, 'mobile')
            assert.equal(secondRequest.app.ua.formFactor, null)
          })
        })
      })

      describe('successful request, unacceptable locale, no features enabled:', () => {
        let request

        beforeEach(() => {
          response = 'ok'
          return instance.inject({
            headers: {
              'accept-language': 'fr-CH, fr;q=0.9',
              'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75 Mobile/14E5239e Safari/602.1'
            },
            method: 'POST',
            url: '/account/create',
            payload: {}
          }).then(response => request = response.request)
        })

        it('called log.begin correctly', () => {
          assert.equal(log.begin.callCount, 1)
          const args = log.begin.args[0]
          assert.equal(args[1].app.locale, 'en')
          assert.equal(args[1].app.ua.browser, 'Chrome Mobile iOS')
          assert.equal(args[1].app.ua.browserVersion, '56')
          assert.equal(args[1].app.ua.os, 'iOS')
          assert.equal(args[1].app.ua.osVersion, '10.3')
          assert.equal(args[1].app.ua.deviceType, 'mobile')
          assert.equal(args[1].app.ua.formFactor, 'iPhone')
        })

        it('called log.summary once', () => {
          assert.equal(log.summary.callCount, 1)
        })

        it('did not call log.error', () => {
          assert.equal(log.error.callCount, 0)
        })

        it('parsed features correctly', () => {
          assert.ok(request.app.features)
          assert.equal(request.app.features.has('signinCodes'), false)
        })
      })

      describe('unsuccessful request:', () => {
        beforeEach(() => {
          response = error.requestBlocked()
          return instance.inject({
            method: 'POST',
            url: '/account/create',
            payload: {}
          }).catch(() => {})
        })

        it('called log.begin', () => {
          assert.equal(log.begin.callCount, 1)
        })

        it('called log.summary correctly', () => {
          assert.equal(log.summary.callCount, 1)
          const args = log.summary.args[0]
          assert.equal(args.length, 2)
          assert.equal(args[0], log.begin.args[0][1])
          assert.ok(args[1])
          assert.equal(args[1].statusCode, undefined)
          assert.equal(args[1].source, undefined)
          assert.equal(args[1].isBoom, true)
          assert.equal(args[1].message, 'The request was blocked for security reasons')
          assert.equal(args[1].errno, 125)
        })

        it('did not call log.error', () => {
          assert.equal(log.error.callCount, 0)
        })
      })

      describe('unsuccessful request, db error:', () => {
        beforeEach(() => {
          response = new EndpointError('request failed', { reason: 'because i said so' })
          return instance.inject({
            method: 'POST',
            url: '/account/create',
            payload: {}
          }).catch(() => {})
        })

        it('called log.begin', () => {
          assert.equal(log.begin.callCount, 1)
        })

        it('called log.summary', () => {
          assert.equal(log.summary.callCount, 1)
        })

        it('called log.error correctly', () => {
          assert.equal(log.error.callCount, 1)
          const args = log.error.args[0]
          assert.equal(args.length, 1)
          assert.deepEqual(args[0], {
            op: 'server.EndpointError',
            message: 'request failed',
            reason: 'because i said so'
          })
        })
      })
    })

    function getRoutes () {
      return [
        {
          path: '/account/create',
          method: 'POST',
          handler (request, reply) {
            return reply(response)
          }
        }
      ]
    }
  })
})

function getConfig () {
  return {
    publicUrl: 'http://example.org/',
    corsOrigin: [ '*' ],
    maxEventLoopDelay: 0,
    listen: {
      host: '127.0.0.1',
      port: 9000
    },
    useHttps: false,
    hpkpConfig: {
      enabled: false
    },
    oauth: {
      url: 'http://localhost:9010',
      keepAlive: false,
      extra: {
        email: false
      }
    },
    env: 'prod',
    memcached: {
      lifetime: 0,
      address: 'none'
    },
    metrics: {
      flow_id_expiry: 7200000,
      flow_id_key: 'wibble'
    }
  }
}
