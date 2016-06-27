/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

var test = require('../ptaptest')
var mocks = require('../mocks')
var proxyquire = require('proxyquire')
var sinon = require('sinon')

var ELLIPSIS = '\u2026'
var parserResult

var uaParser = {
  parse: sinon.spy(function () {
    return parserResult
  })
}

var userAgent = proxyquire('../../lib/userAgent', {
  'node-uap': uaParser
})

var log = mocks.spyLog()

test(
  'exports function',
  function (t) {
    t.equal(typeof userAgent, 'function')
    t.equal(userAgent.length, 2)
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
    var result = userAgent.call(context, 'qux', log)

    t.equal(uaParser.parse.callCount, 1)
    t.ok(uaParser.parse.calledWithExactly('qux'))

    t.equal(result, context)
    t.equal(Object.keys(result).length, 5)
    t.equal(result.uaBrowser, 'foo')
    t.equal(result.uaBrowserVersion, '1')
    t.equal(result.uaOS, 'bar')
    t.equal(result.uaOSVersion, '2')
    t.equal(result.uaDeviceType, 'mobile')

    t.equal(log.info.callCount, 0)

    t.end()
    uaParser.parse.reset()
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
    var result = userAgent.call(context, 'wibble', log)

    t.equal(uaParser.parse.callCount, 1)
    t.ok(uaParser.parse.calledWithExactly('wibble'))

    t.equal(result, context)
    t.equal(Object.keys(result).length, 5)
    t.equal(result.uaBrowser, 'wibble')
    t.equal(result.uaOS, null)
    t.equal(result.uaDeviceType, null)

    t.equal(log.info.callCount, 1)
    var args = log.info.args[0]
    t.equal(args.length, 1)
    t.deepEqual(args[0], {
      op: 'userAgent:truncate',
      userAgent: 'wibble'
    })

    t.end()
    uaParser.parse.reset()
    log.info.reset()
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
    var result = userAgent.call(context, log)

    t.equal(result.uaBrowserVersion, '1.1')
    t.equal(result.uaOSVersion, '2.34567')

    t.equal(log.info.callCount, 0)

    t.end()
    uaParser.parse.reset()
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
    var result = userAgent.call(context, log)

    t.equal(result.uaDeviceType, 'mobile')

    t.equal(log.info.callCount, 0)

    t.end()
    uaParser.parse.reset()
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
    var result = userAgent.call(context, log)

    t.equal(result.uaDeviceType, 'mobile')

    t.equal(log.info.callCount, 0)

    t.end()
    uaParser.parse.reset()
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
    var result = userAgent.call(context, log)

    t.equal(result.uaDeviceType, 'mobile')

    t.equal(log.info.callCount, 0)

    t.end()
    uaParser.parse.reset()
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
    var result = userAgent.call(context, log)

    t.equal(result.uaDeviceType, 'mobile')

    t.equal(log.info.callCount, 0)

    t.end()
    uaParser.parse.reset()
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
    var result = userAgent.call(context, log)

    t.equal(result.uaDeviceType, 'mobile')

    t.equal(log.info.callCount, 0)

    t.end()
    uaParser.parse.reset()
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
    var result = userAgent.call(context, log)

    t.equal(result.uaDeviceType, null)

    t.equal(log.info.callCount, 0)

    t.end()
    uaParser.parse.reset()
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
    var result = userAgent.call(context, log)

    t.equal(result.uaDeviceType, null)

    t.equal(log.info.callCount, 0)

    t.end()
    uaParser.parse.reset()
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
    var result = userAgent.call(context, log)

    t.equal(result.uaDeviceType, null)

    t.equal(log.info.callCount, 0)

    t.end()
    uaParser.parse.reset()
  }
)

test(
  'uaBrowser falls back to truncated user agent string',
  function (t) {
    parserResult = {
      ua: {
        family: 'Other'
      },
      os: {
        family: 'Other'
      },
      device: {
        family: 'Other'
      }
    }
    var context = {}
    var userAgentString = new Array(201).join('x')
    var result = userAgent.call(context, userAgentString, log)

    t.equal(result.uaBrowser, new Array(61).join('x') + ELLIPSIS)

    t.equal(log.info.callCount, 1)
    var args = log.info.args[0]
    t.equal(args.length, 1)
    t.deepEqual(args[0], {
      op: 'userAgent:truncate',
      userAgent: userAgentString
    })

    t.end()
    uaParser.parse.reset()
    log.info.reset()
  }
)

test(
  'truncated fallback is relaxed for parentheses',
  function (t) {
    parserResult = {
      ua: {
        family: 'Other'
      },
      os: {
        family: 'Other'
      },
      device: {
        family: 'Other'
      }
    }
    var context = {}
    var expected = new Array(11).join('x') + ' (' + new Array(61).join('y') + ')'
    var userAgentString = expected + new Array(101).join('z')
    var result = userAgent.call(context, userAgentString, log)

    t.equal(result.uaBrowser, expected + ELLIPSIS)

    t.equal(log.info.callCount, 1)
    var args = log.info.args[0]
    t.equal(args.length, 1)
    t.deepEqual(args[0], {
      op: 'userAgent:truncate',
      userAgent: userAgentString
    })

    t.end()
    uaParser.parse.reset()
    log.info.reset()
  }
)

