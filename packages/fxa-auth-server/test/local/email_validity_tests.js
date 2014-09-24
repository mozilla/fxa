/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var TestServer = require('../test_server')
var path = require('path')
var Client = require('../client')
var P = require('../../promise')


process.env.CONFIG_FILES = path.join(__dirname, '../config/scrypt.json')
var config = require('../../config').root()

TestServer.start(config)
.then(function main(server) {

  test(
    '/account/create with a variety of malformed email addresses',
    function (t) {
      var pwd = '123456'

      var emails = [
        'notAnEmailAddress',
        '\n@example.com',
        'me@hello world.com',
        'me@hello+world.com',
        'me@.example',
        'me@example.com-',
        'me@example..com',
        'me@example-.com',
        'me@example.-com'
      ]
      emails.forEach(function(email, i) {
        emails[i] = Client.create(config.publicUrl, email, pwd)
          .then(
            t.fail,
            function (err) {
              t.equal(err.code, 400, 'http 400 : malformed email is rejected')
            }
          )
      })

      return P.all(emails)
    }
  )

  test(
    '/account/create with a variety of unusual but valid email addresses',
    function (t) {
      var pwd = '123456'

      var emails = [
        'tim@tim-example.net',
        'a+b+c@example.com',
        '#!?-@t-e-s-t.c-o-m',
        String.fromCharCode(1234) + '@example.com',
        'test@' + String.fromCharCode(5678) + '.com'
      ]

      emails.forEach(function(email, i) {
        emails[i] = Client.create(config.publicUrl, email, pwd)
          .then(
            function(c) {
              t.pass('Email ' + email + ' is valid')
              return c.destroyAccount()
            },
            function (err) {
              t.fail('Email address ' + email + " should have been allowed, but it wasn't")
            }
          )
      })

      return P.all(emails)
    }
  )

  test(
    'teardown',
    function (t) {
      server.stop()
      t.end()
    }
  )
})
