/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var keyStretch = require('../../client/keystretch')

test(
  'basic key stretching, test vectors',
  function (t) {
    var emailBuf = Buffer('andré@example.org')
    var password = Buffer('pässwörd')
    var salt = '00f000000000000000000000000000000000000000000000000000000000034d'
    return keyStretch.derive(emailBuf, password, salt)
      .then(
        function (result) {
          t.equal(result.srpPw.toString('hex'), '00f9b71800ab5337d51177d8fbc682a3653fa6dae5b87628eeec43a18af59a9d')
          t.equal(result.unwrapBKey.toString('hex'), '6ea660be9c89ec355397f89afb282ea0bf21095760c8c5009bbcc894155bbe2a')
        }
      )
  }
)

test(
  'basic key stretching, longer credentials',
  function (t) {
    var salt = '00f000000000000000000000000000000000000000000000000000000000034d'
    var email = 'ijqmkkafer3xsj5rzoq+msnxsacvkmqxabtsvxvj@some-test-domain-with-a-long-name-example.org'
    var emailBuf = Buffer(email)
    var password = Buffer('mSnxsacVkMQxAbtSVxVjCCoWArNUsFhiJqmkkafER3XSJ5rzoQ')
    return keyStretch.derive(emailBuf, password, salt)
      .then(
        function (result) {
          t.equal(result.srpPw.toString('hex'), '261559a74f7b7199fef846c8138db08333bbcc7f5177194da5c965ba953a346b')
          t.equal(result.unwrapBKey.toString('hex'), 'cf48fbc1613a46c794d37c2fe5423c7813b70e5b6c525d5c4463056f267959ff')
        }
      )
  }
)

test(
  'false input both',
  function (t) {
    return keyStretch.derive('', '', '')
      .then(
        function (stretchedPassword) {
          t.fail('Got a stretchedPassword from false input')
        },
        function (err) {
          t.equal(err, 'Bad password, salt or email input')
        }
      )
  }
)

test(
  'false input email',
  function (t) {
    var email = 'me@example.org'
    return keyStretch.derive(email, '', '')
      .then(
      function (stretchedPassword) {
        t.fail('Got a stretchedPassword from false input')
      },
      function (err) {
        t.equal(err, 'Bad password, salt or email input')
      }
    )
  }
)

test(
  'false input password',
  function (t) {
    var email = ''
    var password = 'password'
    var salt = ''
    return keyStretch.derive(email, password, salt)
      .then(
      function (stretchedPassword) {
        t.fail('Got a stretchedPassword from false input')
      },
      function (err) {
        t.equal(err, 'Bad password, salt or email input')
      }
    )
  }
)

test(
  'undefined input',
  function (t) {
    var email
    var password
    var salt
    return keyStretch.derive(email, password, salt)
      .then(
      function (stretchedPassword) {
        t.fail('Got a stretchedPassword from false input')
      },
      function (err) {
        t.equal(err, 'Bad password, salt or email input')
      }
    )
  }
)

test(
  'not enough arguments',
  function (t) {
    return keyStretch.derive()
      .then(
      function (stretchedPassword) {
        t.fail('Got a stretchedPassword from false input')
      },
      function (err) {
        t.equal(err, 'Bad password, salt or email input')
      }
    )
  }
)

test(
  'one argument',
  function (t) {
    return keyStretch.derive(Buffer('andré@example.org'))
      .then(
      function (stretchedPassword) {
        t.fail('Got a stretchedPassword from false input')
      },
      function (err) {
        t.equal(err, 'Bad password, salt or email input')
      }
    )
  }
)

test(
  'null input',
  function (t) {
    return keyStretch.derive(null, null, null)
      .then(
      function (stretchedPassword) {
        t.fail('Got a stretchedPassword from false input')
      },
      function (err) {
        t.equal(err, 'Bad password, salt or email input')
      }
    )
  }
)

test(
  'wrapkB xor string and buffer test',
  function (t) {
    var wrapkB = '404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f'
    var unwrapBKey = '6ea660be9c89ec355397f89afb282ea0bf21095760c8c5009bbcc894155bbe2a'
    var kBgood = '2ee722fdd8ccaa721bdeb2d1b76560efef705b04349d9357c3e592cf4906e075'
    var kBResult = keyStretch.xor(wrapkB, unwrapBKey)
    var kBResultBuffer = keyStretch.xor(Buffer(wrapkB, 'hex'), Buffer(unwrapBKey, 'hex'))

    t.equal(kBResult.toString('hex'), kBgood)
    t.equal(kBResultBuffer.toString('hex'), kBgood)
    t.end()
  }
)
