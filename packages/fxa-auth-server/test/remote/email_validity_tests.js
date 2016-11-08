/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
var TestServer = require('../test_server')
const Client = require('../client')()
var P = require('../../lib/promise')

var config = require('../../config').getProperties()

describe('remote email validity', function() {
  this.timeout(15000)
  let server
  before(() => {
    return TestServer.start(config)
      .then(s => {
        server = s
      })
  })

  it(
    '/account/create with a variety of malformed email addresses',
    () => {
      var pwd = '123456'

      var emails = [
        'notAnEmailAddress',
        '\n@example.com',
        'me@hello world.com',
        'me@hello+world.com',
        'me@.example',
        'me@example',
        'me@example.com-',
        'me@example..com',
        'me@example-.com',
        'me@example.-com',
        '\uD83D\uDCA9@unicodepooforyou.com'
      ]
      emails.forEach(function(email, i) {
        emails[i] = Client.create(config.publicUrl, email, pwd)
          .then(
            assert.fail,
            function (err) {
              assert.equal(err.code, 400, 'http 400 : malformed email is rejected')
            }
          )
      })

      return P.all(emails)
    }
  )

  it(
    '/account/create with a variety of unusual but valid email addresses',
    () => {
      var pwd = '123456'

      var emails = [
        'tim@tim-example.net',
        'a+b+c@example.com',
        '#!?-@t-e-s-assert.c-o-m',
        String.fromCharCode(1234) + '@example.com',
        'test@' + String.fromCharCode(5678) + '.com'
      ]

      emails.forEach(function(email, i) {
        emails[i] = Client.create(config.publicUrl, email, pwd)
          .then(
            function(c) {
              return c.destroyAccount()
            },
            function (err) {
              assert(false, 'Email address ' + email + " should have been allowed, but it wasn't")
            }
          )
      })

      return P.all(emails)
    }
  )

  after(() => {
    return TestServer.stop(server)
  })
})
