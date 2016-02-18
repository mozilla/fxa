/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

var test = require('../ptaptest')
var proxyquire = require('proxyquire')
var sinon = require('sinon')

var parserResult

var uaParser = {
  parse: sinon.spy(function () {
    return parserResult
  })
}

var userAgent = proxyquire('../../lib/userAgent', {
  'node-uap': uaParser
})

test(
  'exports function',
  function (t) {
    t.equal(typeof userAgent, 'function')
    t.equal(userAgent.length, 1)
    t.end()
  }
)

test(
  'sets data correctly',
  function (t) {
    parserResult = {
      ua: {
        family: 'foo',
        major: '1',
        minor: '0'
      },
      os: {
        family: 'bar',
        major: '2',
        minor: '0'
      },
      device: {
        family: 'baz'
      }
    }
    var context = {}
    var result = userAgent.call(context, 'qux')
    t.equal(uaParser.parse.callCount, 1)
    t.ok(uaParser.parse.calledWithExactly('qux'))
    t.equal(result, context)
    t.equal(Object.keys(result).length, 5)
    t.equal(result.uaBrowser, 'foo')
    t.equal(result.uaBrowserVersion, '1')
    t.equal(result.uaOS, 'bar')
    t.equal(result.uaOSVersion, '2')
    t.equal(result.uaDeviceType, 'mobile')
    uaParser.parse.reset()
    t.end()
  }
)

test(
  'ignores family:Other',
  function (t) {
    parserResult = {
      ua: {
        family: 'Other',
        major: '1',
        minor: '0'
      },
      os: {
        family: 'Other',
        major: '2',
        minor: '0'
      },
      device: {
        family: 'Other'
      }
    }
    var context = {}
    var result = userAgent.call(context, 'wibble')
    t.equal(uaParser.parse.callCount, 1)
    t.ok(uaParser.parse.calledWithExactly('wibble'))
    t.equal(result, context)
    t.equal(Object.keys(result).length, 5)
    t.equal(result.uaBrowser, null)
    t.equal(result.uaOS, null)
    t.equal(result.uaDeviceType, null)
    uaParser.parse.reset()
    t.end()
  }
)

test(
  'appends minor version if set',
  function (t) {
    parserResult = {
      ua: {
        family: 'foo',
        major: '1',
        minor: '1'
      },
      os: {
        family: 'bar',
        major: '2',
        minor: '34567'
      },
      device: {
        family: 'baz'
      }
    }
    var context = {}
    var result = userAgent.call(context)
    t.equal(result.uaBrowserVersion, '1.1')
    t.equal(result.uaOSVersion, '2.34567')
    uaParser.parse.reset()
    t.end()
  }
)

test(
  'recognises Android as a mobile OS',
  function (t) {
    parserResult = {
      ua: {
        family: 'foo',
        major: '1',
        minor: '0'
      },
      os: {
        family: 'Android',
        major: '2',
        minor: '0'
      },
      device: {
        family: 'Other'
      }
    }
    var context = {}
    var result = userAgent.call(context)
    t.equal(result.uaDeviceType, 'mobile')
    uaParser.parse.reset()
    t.end()
  }
)

test(
  'recognises iOS as a mobile OS',
  function (t) {
    parserResult = {
      ua: {
        family: 'foo',
        major: '1',
        minor: '0'
      },
      os: {
        family: 'iOS',
        major: '2',
        minor: '0'
      },
      device: {
        family: 'Other'
      }
    }
    var context = {}
    var result = userAgent.call(context)
    t.equal(result.uaDeviceType, 'mobile')
    uaParser.parse.reset()
    t.end()
  }
)

test(
  'recognises Firefox OS as a mobile OS',
  function (t) {
    parserResult = {
      ua: {
        family: 'foo',
        major: '1',
        minor: '0'
      },
      os: {
        family: 'Firefox OS',
        major: '2',
        minor: '0'
      },
      device: {
        family: 'Other'
      }
    }
    var context = {}
    var result = userAgent.call(context)
    t.equal(result.uaDeviceType, 'mobile')
    uaParser.parse.reset()
    t.end()
  }
)

test(
  'recognises Windows Phone as a mobile OS',
  function (t) {
    parserResult = {
      ua: {
        family: 'foo',
        major: '1',
        minor: '0'
      },
      os: {
        family: 'Windows Phone',
        major: '2',
        minor: '0'
      },
      device: {
        family: 'Other'
      }
    }
    var context = {}
    var result = userAgent.call(context)
    t.equal(result.uaDeviceType, 'mobile')
    uaParser.parse.reset()
    t.end()
  }
)

test(
  'recognises BlackBerry OS as a mobile OS',
  function (t) {
    parserResult = {
      ua: {
        family: 'foo',
        major: '1',
        minor: '0'
      },
      os: {
        family: 'BlackBerry OS',
        major: '2',
        minor: '0'
      },
      device: {
        family: 'Other'
      }
    }
    var context = {}
    var result = userAgent.call(context)
    t.equal(result.uaDeviceType, 'mobile')
    uaParser.parse.reset()
    t.end()
  }
)

test(
  'does not recognise Mac OS X as a mobile OS',
  function (t) {
    parserResult = {
      ua: {
        family: 'foo',
        major: '1',
        minor: '0'
      },
      os: {
        family: 'Mac OS X',
        major: '2',
        minor: '0'
      },
      device: {
        family: 'Other'
      }
    }
    var context = {}
    var result = userAgent.call(context)
    t.equal(result.uaDeviceType, null)
    uaParser.parse.reset()
    t.end()
  }
)

test(
  'does not recognise Linux as a mobile OS',
  function (t) {
    parserResult = {
      ua: {
        family: 'foo',
        major: '1',
        minor: '0'
      },
      os: {
        family: 'Linux',
        major: '2',
        minor: '0'
      },
      device: {
        family: 'Other'
      }
    }
    var context = {}
    var result = userAgent.call(context)
    t.equal(result.uaDeviceType, null)
    uaParser.parse.reset()
    t.end()
  }
)

test(
  'does not recognise Windows as a mobile OS',
  function (t) {
    parserResult = {
      ua: {
        family: 'foo',
        major: '1',
        minor: '0'
      },
      os: {
        family: 'Windows',
        major: '2',
        minor: '0'
      },
      device: {
        family: 'Other'
      }
    }
    var context = {}
    var result = userAgent.call(context)
    t.equal(result.uaDeviceType, null)
    uaParser.parse.reset()
    t.end()
  }
)

