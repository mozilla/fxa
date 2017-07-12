/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
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

describe('userAgent', () => {
  it(
    'exports function',
    () => {
      assert.equal(typeof userAgent, 'function')
      assert.equal(userAgent.length, 1)
    }
  )

  it(
    'sets data correctly',
    () => {
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

      assert.equal(uaParser.parse.callCount, 1)
      assert.ok(uaParser.parse.calledWithExactly('qux'))

      assert.equal(result, context)
      assert.equal(Object.keys(result).length, 5)
      assert.equal(result.uaBrowser, 'foo')
      assert.equal(result.uaBrowserVersion, '1')
      assert.equal(result.uaOS, 'bar')
      assert.equal(result.uaOSVersion, '2')
      assert.equal(result.uaDeviceType, 'mobile')

      uaParser.parse.reset()
    }
  )

  it(
    'ignores family:Other',
    () => {
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

      assert.equal(uaParser.parse.callCount, 1)
      assert.ok(uaParser.parse.calledWithExactly('wibble'))

      assert.equal(result, context)
      assert.equal(Object.keys(result).length, 5)
      assert.equal(result.uaBrowser, null)
      assert.equal(result.uaOS, null)
      assert.equal(result.uaDeviceType, null)

      uaParser.parse.reset()
    }
  )

  it(
    'appends minor version if set',
    () => {
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

      assert.equal(result.uaBrowserVersion, '1.1')
      assert.equal(result.uaOSVersion, '2.34567')

      uaParser.parse.reset()
    }
  )

  it(
    'recognises Android phones as a mobile OS',
    () => {
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

      assert.equal(result.uaDeviceType, 'mobile')

      uaParser.parse.reset()
    }
  )

  it(
    'recognises iOS as a mobile OS',
    () => {
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

      assert.equal(result.uaDeviceType, 'mobile')

      uaParser.parse.reset()
    }
  )

  it(
    'recognises Firefox OS as a mobile OS',
    () => {
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

      assert.equal(result.uaDeviceType, 'mobile')

      uaParser.parse.reset()
    }
  )

  it(
    'recognises Windows Phone as a mobile OS',
    () => {
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

      assert.equal(result.uaDeviceType, 'mobile')

      uaParser.parse.reset()
    }
  )

  it(
    'recognises BlackBerry OS as a mobile OS',
    () => {
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

      assert.equal(result.uaDeviceType, 'mobile')

      uaParser.parse.reset()
    }
  )

  it(
    'does not recognise Mac OS X as a mobile OS',
    () => {
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

      assert.equal(result.uaDeviceType, null)

      uaParser.parse.reset()
    }
  )

  it(
    'does not recognise Linux as a mobile OS',
    () => {
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

      assert.equal(result.uaDeviceType, null)

      uaParser.parse.reset()
    }
  )

  it(
    'does not recognise Windows as a mobile OS',
    () => {
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

      assert.equal(result.uaDeviceType, null)

      uaParser.parse.reset()
    }
  )

  it(
    'recognises iPads as tablets',
    () => {
      parserResult = {
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Mobile/11A465',
        ua: {
          family: 'Mobile Safari UI/WKWebView',
          major: '7',
          minor: '0'
        },
        os: {
          family: 'iOS',
          major: '7',
          minor: '0'
        },
        device: {
          family: 'iPad'
        }
      }
      var context = {}
      var result = userAgent.call(context)

      assert.equal(result.uaDeviceType, 'tablet')

      uaParser.parse.reset()
    }
  )


  it(
    'recognises Android tablets as tablets',
    () => {
      parserResult = {
        userAgent: 'Mozilla/5.0 (Linux; Android 4.4.2; Nexus 7 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.59 Safari/537.36',
        ua: {
          family: 'Chrome Mobile',
          major: '31',
          minor: '0'
        },
        os: {
          family: 'Android',
          major: '4',
          minor: '4'
        },
        device: {
          family: 'Nexus 7'
        }
      }
      var context = {}
      var result = userAgent.call(context)

      assert.equal(result.uaDeviceType, 'tablet')

      uaParser.parse.reset()
    }
  )

  it(
    'recognises old Firefox-iOS user agents',
    () => {
      parserResult = null
      const context = {}
      const userAgentString = 'Firefox-iOS-FxA/5.3 (Firefox)'
      const result = userAgent.call(context, userAgentString)

      assert.equal(result.uaBrowser, 'Firefox')
      assert.equal(result.uaBrowserVersion, '5.3')
      assert.equal(result.uaOS, 'iOS')
      assert.equal(result.uaDeviceType, 'mobile')

      uaParser.parse.reset()
    }
  )

  it(
    'recognises new Firefox-iOS user agents',
    () => {
      parserResult = null
      const context = {}
      const userAgentString = 'Firefox-iOS-FxA/6.0b42 (iPhone 6S; iPhone OS 10.3) (Nightly)'
      const result = userAgent.call(context, userAgentString)

      assert.equal(result.uaBrowser, 'Nightly')
      assert.equal(result.uaBrowserVersion, '6.0')
      assert.equal(result.uaOS, 'iOS')
      assert.equal(result.uaOSVersion, '10.3')
      assert.equal(result.uaDeviceType, 'mobile')

      uaParser.parse.reset()
    }
  )

  it(
    'recognises new Firefox-iOS user agent on iPads',
    () => {
      parserResult = null
      const context = {}
      const userAgentString = 'Firefox-iOS-FxA/6.0b42 (iPad Mini; iPhone OS 10.3) (Nightly)'
      const result = userAgent.call(context, userAgentString)

      assert.equal(result.uaBrowser, 'Nightly')
      assert.equal(result.uaBrowserVersion, '6.0')
      assert.equal(result.uaOS, 'iOS')
      assert.equal(result.uaOSVersion, '10.3')
      assert.equal(result.uaDeviceType, 'tablet')

      uaParser.parse.reset()
    }
  )

  it(
    'recognises Firefox-Android user agents',
    () => {
      parserResult = null
      const context = {}
      const userAgentString = 'Firefox-Android-FxAccounts/49.0.2 (Firefox)'
      const result = userAgent.call(context, userAgentString)

      assert.equal(result.uaBrowser, 'Firefox')
      assert.equal(result.uaBrowserVersion, '49.0.2')
      assert.equal(result.uaOS, 'Android')
      assert.equal(result.uaDeviceType, 'mobile')

      uaParser.parse.reset()
    }
  )

  it('recognises new mobile Sync library user agents on Android', () => {
    parserResult = null
    const context = {}
    const userAgentString = 'Mobile-Android-Sync/(Mobile; Android 6.0) (foo() bar)'
    const result = userAgent.call(context, userAgentString)

    assert.equal(result.uaBrowser, 'foo() bar')
    assert.equal(result.uaBrowserVersion, null)
    assert.equal(result.uaOS, 'Android')
    assert.equal(result.uaOSVersion, '6.0')
    assert.equal(result.uaDeviceType, 'mobile')

    uaParser.parse.reset()
  })

  it('recognises new mobile Sync library user agents on iOS', () => {
    parserResult = null
    const context = {}
    const userAgentString = 'Mobile-iOS-Sync/(iPad Mini; iOS 10.3) (wibble)'
    const result = userAgent.call(context, userAgentString)

    assert.equal(result.uaBrowser, 'wibble')
    assert.equal(result.uaBrowserVersion, null)
    assert.equal(result.uaOS, 'iOS')
    assert.equal(result.uaOSVersion, '10.3')
    assert.equal(result.uaDeviceType, 'tablet')

    uaParser.parse.reset()
  })
})

