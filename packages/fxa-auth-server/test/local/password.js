/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
const log = {}
const config = {}
const Password = require('../../lib/crypto/password')(log, config)

describe('Password', () => {
  it(
    'password version zero',
    () => {
      var pwd = Buffer('aaaaaaaaaaaaaaaa')
      var salt = Buffer('bbbbbbbbbbbbbbbb')
      var p1 = new Password(pwd, salt, 0)
      assert.equal(p1.version, 0, 'should be using version zero')
      var p2 = new Password(pwd, salt, 0)
      assert.equal(p2.version, 0, 'should be using version zero')
      return p1.verifyHash()
      .then(
        function (hash) {
          return p2.matches(hash)
        }
      )
      .then(
        function (matched) {
          assert.ok(matched, 'identical passwords should match')
        }
      )
    }
  )

  it(
    'password version one',
    () => {
      var pwd = Buffer('aaaaaaaaaaaaaaaa')
      var salt = Buffer('bbbbbbbbbbbbbbbb')
      var p1 = new Password(pwd, salt, 1)
      assert.equal(p1.version, 1, 'should be using version one')
      var p2 = new Password(pwd, salt, 1)
      assert.equal(p2.version, 1, 'should be using version one')
      return p1.verifyHash()
      .then(
        function (hash) {
          return p2.matches(hash)
        }
      )
      .then(
        function (matched) {
          assert.ok(matched, 'identical passwords should match')
        }
      )
    }
  )

  it(
    'passwords of different versions should not match',
    () => {
      var pwd = Buffer('aaaaaaaaaaaaaaaa')
      var salt = Buffer('bbbbbbbbbbbbbbbb')
      var p1 = new Password(pwd, salt, 0)
      var p2 = new Password(pwd, salt, 1)
      return p1.verifyHash()
      .then(
        function (hash) {
          return p2.matches(hash)
        }
      )
      .then(
        function (matched) {
          assert.ok(! matched, 'passwords should not match')
        }
      )
    }
  )

  it(
    'scrypt queue stats can be reported',
    () => {
      var stat = Password.stat()
      assert.equal(stat.stat, 'scrypt')
      assert.ok(stat.hasOwnProperty('numPending'))
      assert.ok(stat.hasOwnProperty('numPendingHWM'))
    }
  )
})
