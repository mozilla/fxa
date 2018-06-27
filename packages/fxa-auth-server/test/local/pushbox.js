/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const ROOT_DIR = '../..'

const assert = require('insist')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const {mockLog} = require('../mocks')
const mockConfig = {
  publicUrl: 'https://accounts.example.com',
  pushbox: {
    enabled: true,
    url: 'https://foo.bar',
    key: 'foo',
    maxTTL: 123456000
  }
}
const mockDeviceIds = ['bogusid1', 'bogusid2', 'bogusid3']
const mockData = 'eyJmb28iOiAiYmFyIn0'
const mockUid = 'myuid'
const pushboxModulePath = `${ROOT_DIR}/lib/pushbox`

describe('pushbox', () => {
  it(
    'retrieve',
    () => {
      const FakePool = function() {}
      const getSpy = sinon.spy(() => Promise.resolve({
        status: 200,
        last: true,
        index: '15',
        messages: [{
          index: '15',
          // This is { foo: "bar", bar: "bar" }, encoded.
          data: 'eyJmb28iOiJiYXIiLCAiYmFyIjogImJhciJ9'
        }]
      }))
      FakePool.prototype.get = getSpy
      const mocks = {
        './pool': FakePool
      }
      const pushbox = proxyquire(pushboxModulePath, mocks)(mockLog(), mockConfig)

      return pushbox.retrieve(mockUid, mockDeviceIds[0], 50, 10)
        .then(resp => {
          assert.equal(getSpy.callCount, 1, 'get request was made')
          const args = getSpy.args[0]
          assert.equal(args.length, 3)
          assert.equal(args[0]._template.toString(), '/v1/store/:uid/:deviceId')
          assert.deepEqual(args[1], {uid: mockUid, deviceId: mockDeviceIds[0]})
          assert.deepEqual(args[2], {query: {limit:50, index:10}, headers: {Authorization: `FxA-Server-Key ${mockConfig.pushbox.key}`}})

          assert.deepEqual(resp, {
            last: true,
            index: '15',
            messages: [{
              index: '15',
              data: { foo: 'bar', bar: 'bar' }
            }]
          })
        })
    }
  )

  it(
    'retrieve validates the pushbox server response',
    () => {
      const FakePool = function() {}
      const getSpy = sinon.spy(() => Promise.resolve({
        'bogus':'object'
      }))
      FakePool.prototype.get = getSpy
      const mocks = {
        './pool': FakePool
      }
      const log = mockLog()
      const pushbox = proxyquire(pushboxModulePath, mocks)(log, mockConfig)

      return pushbox.retrieve(mockUid, mockDeviceIds[0], 50, 10)
        .then(() => assert.ok(false, 'should not happen'), (err) => {
          assert.ok(err)
          assert.equal(err.errno, 999)
          assert.equal(log.error.callCount, 1, 'an error was logged')
          assert.equal(log.error.getCall(0).args[0].op, 'pushbox.retrieve')
          assert.equal(log.error.getCall(0).args[0].error, 'response schema validation failed')
        })
    }
  )

  it(
    'retrieve throws on error response',
    () => {
      const FakePool = function() {}
      const getSpy = sinon.spy(() => Promise.resolve({
        'error': 'lamentably, an error hath occurred',
        status: 1234
      }))
      FakePool.prototype.get = getSpy
      const mocks = {
        './pool': FakePool
      }
      const log = mockLog()
      const pushbox = proxyquire(pushboxModulePath, mocks)(log, mockConfig)

      return pushbox.retrieve(mockUid, mockDeviceIds[0], 50, 10)
        .then(() => assert.ok(false, 'should not happen'), (err) => {
          assert.ok(err)
          assert.equal(err.errno, 999)
          assert.equal(log.error.callCount, 1, 'an error was logged')
          assert.equal(log.error.getCall(0).args[0].op, 'pushbox.retrieve')
          assert.equal(log.error.getCall(0).args[0].error, 'lamentably, an error hath occurred')
          assert.equal(log.error.getCall(0).args[0].status, 1234)
        })
    }
  )

  it(
    'store',
    () => {
      const FakePool = function() {}
      const postSpy = sinon.spy(() => Promise.resolve({
        status: 200,
        index: '12'
      }))
      FakePool.prototype.post = postSpy
      const mocks = {
        './pool': FakePool
      }
      const pushbox = proxyquire(pushboxModulePath, mocks)(mockLog(), mockConfig)

      return pushbox.store(mockUid, mockDeviceIds[0], { test: 'data' })
        .then(({index}) => {
          assert.equal(postSpy.callCount, 1, 'post request was made')
          const args = postSpy.args[0]
          assert.equal(args.length, 4)
          assert.equal(args[0]._template.toString(), '/v1/store/:uid/:deviceId')
          assert.deepEqual(args[1], {uid: mockUid, deviceId: mockDeviceIds[0]})
          assert.deepEqual(args[2], {data: 'eyJ0ZXN0IjoiZGF0YSJ9', ttl: 123456})
          assert.deepEqual(args[3], {headers: {Authorization: `FxA-Server-Key ${mockConfig.pushbox.key}`}})

          assert.equal(index, '12')
        })
    }
  )

  it(
    'store with custom ttl',
    () => {
      const FakePool = function() {}
      const postSpy = sinon.spy(() => Promise.resolve({
        status: 200,
        index: '12'
      }))
      FakePool.prototype.post = postSpy
      const mocks = {
        './pool': FakePool
      }
      const pushbox = proxyquire(pushboxModulePath, mocks)(mockLog(), mockConfig)

      return pushbox.store(mockUid, mockDeviceIds[0], { test: 'data' }, 42)
        .then(({index}) => {
          assert.equal(postSpy.callCount, 1, 'post request was made')
          const args = postSpy.args[0]
          assert.deepEqual(args[2], {data: 'eyJ0ZXN0IjoiZGF0YSJ9', ttl: 42})

          assert.equal(index, '12')
        })
    }
  )

  it(
    'store caps ttl at configured maximum',
    () => {
      const FakePool = function() {}
      const postSpy = sinon.spy(() => Promise.resolve({
        status: 200,
        index: '12'
      }))
      FakePool.prototype.post = postSpy
      const mocks = {
        './pool': FakePool
      }
      const pushbox = proxyquire(pushboxModulePath, mocks)(mockLog(), mockConfig)

      return pushbox.store(mockUid, mockDeviceIds[0], { test: 'data' }, 999999999)
        .then(({index}) => {
          assert.equal(postSpy.callCount, 1, 'post request was made')
          const args = postSpy.args[0]
          assert.deepEqual(args[2], {data: 'eyJ0ZXN0IjoiZGF0YSJ9', ttl: 123456})

          assert.equal(index, '12')
        })
    }
  )

  it(
    'store validates the pushbox server response',
    () => {
      const FakePool = function() {}
      const postSpy = sinon.spy(() => Promise.resolve({
        'bogus':'object'
      }))
      FakePool.prototype.post = postSpy
      const mocks = {
        './pool': FakePool
      }
      const log = mockLog()
      const pushbox = proxyquire(pushboxModulePath, mocks)(log, mockConfig)

      return pushbox.store(mockUid, mockDeviceIds[0], { test: 'data' })
        .then(() => assert.ok(false, 'should not happen'), (err) => {
          assert.ok(err)
          assert.equal(err.errno, 999)
          assert.equal(log.error.callCount, 1, 'an error was logged')
          assert.equal(log.error.getCall(0).args[0].op, 'pushbox.store')
          assert.equal(log.error.getCall(0).args[0].error, 'response schema validation failed')
        })
    }
  )

  it(
    'retrieve throws on error response',
    () => {
      const FakePool = function() {}
      const postSpy = sinon.spy(() => Promise.resolve({
        'error': 'Alas, an error! I knew it, Horatio.',
        'status': 789
      }))
      FakePool.prototype.post = postSpy
      const mocks = {
        './pool': FakePool
      }
      const log = mockLog()
      const pushbox = proxyquire(pushboxModulePath, mocks)(log, mockConfig)

      return pushbox.store(mockUid, mockDeviceIds[0], { test: 'data' })
        .then(() => assert.ok(false, 'should not happen'), (err) => {
          assert.ok(err)
          assert.equal(err.errno, 999)
          assert.equal(log.error.callCount, 1, 'an error was logged')
          assert.equal(log.error.getCall(0).args[0].op, 'pushbox.store')
          assert.equal(log.error.getCall(0).args[0].error, 'Alas, an error! I knew it, Horatio.')
          assert.equal(log.error.getCall(0).args[0].status, 789)
        })
    }
  )

  it(
    'feature disabled',
    () => {
      const FakePool = function() {}
      const postSpy = sinon.spy()
      const getSpy = sinon.spy()
      FakePool.prototype.post = postSpy
      FakePool.prototype.get = getSpy
      const mocks = {
        './pool': FakePool
      }
      const config = Object.assign({}, mockConfig, {
        pushbox: {enabled: false}
      })
      const pushbox = proxyquire(pushboxModulePath, mocks)(mockLog(), config)

      return pushbox.store(mockUid, mockDeviceIds[0], 'sendtab', mockData)
        .then(() => assert.ok(false, 'should not happen'), (err) => {
          assert.ok(err)
          assert.equal(err.message, 'Feature not enabled')
        })
        .then(() => pushbox.retrieve(mockUid, mockDeviceIds[0], 50, 10))
        .then(() => assert.ok(false, 'should not happen'), (err) => {
          assert.ok(err)
          assert.equal(err.message, 'Feature not enabled')
        })
    }
  )

})
