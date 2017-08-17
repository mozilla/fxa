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
  afterEach(() => uaParser.parse.reset())

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
      const result = userAgent('qux')

      assert.equal(uaParser.parse.callCount, 1)
      assert.ok(uaParser.parse.calledWithExactly('qux'))

      assert.equal(Object.keys(result).length, 6)
      assert.equal(result.browser, 'foo')
      assert.equal(result.browserVersion, '1')
      assert.equal(result.os, 'bar')
      assert.equal(result.osVersion, '2')
      assert.equal(result.deviceType, 'mobile')
      assert.equal(result.formFactor, 'baz')
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
      const result = userAgent('wibble')

      assert.equal(uaParser.parse.callCount, 1)
      assert.ok(uaParser.parse.calledWithExactly('wibble'))

      assert.equal(Object.keys(result).length, 6)
      assert.equal(result.browser, null)
      assert.equal(result.os, null)
      assert.equal(result.deviceType, null)
      assert.equal(result.formFactor, null)
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
      const result = userAgent()

      assert.equal(result.browserVersion, '1.1')
      assert.equal(result.osVersion, '2.34567')
    }
  )

  it(
    'recognises Android phones as a mobile OS',
    () => {
      parserResult = {
        userAgent: 'Mozilla/5.0 (Android 7.1.2; Mobile; rv:56.0) Gecko/56.0 Firefox/56.0',
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
      const result = userAgent()

      assert.equal(result.deviceType, 'mobile')
      assert.equal(result.formFactor, null)
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
          family: 'iPhone 7'
        }
      }
      const result = userAgent()

      assert.equal(result.deviceType, 'mobile')
      assert.equal(result.formFactor, 'iPhone 7')
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
      const result = userAgent()

      assert.equal(result.deviceType, 'mobile')
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
      const result = userAgent()

      assert.equal(result.deviceType, 'mobile')
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
      const result = userAgent()

      assert.equal(result.deviceType, 'mobile')
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
      const result = userAgent()

      assert.equal(result.deviceType, null)
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
      const result = userAgent()

      assert.equal(result.deviceType, null)
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
      const result = userAgent()

      assert.equal(result.deviceType, null)
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
          family: 'iPad Pro'
        }
      }
      const result = userAgent()

      assert.equal(result.deviceType, 'tablet')
      assert.equal(result.formFactor, 'iPad Pro')
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
      const result = userAgent()

      assert.equal(result.deviceType, 'tablet')
      assert.equal(result.formFactor, 'Nexus 7')
    }
  )

  it('recognises FirefoxOS mobiles as mobiles', () => {
    parserResult = {
      userAgent: 'Mozilla/5.0 (Mobile; rv:26.0) Gecko/26.0 Firefox/26.0',
      ua: {
        family: 'Firefox Mobile',
        major: '26',
        minor: '0'
      },
      os: {
        family: 'Firefox OS',
        major: '1',
        minor: '2'
      },
      device: {
        family: 'Generic Smartphone',
        brand: 'Generic',
        model: 'Smartphone'
      }
    }
    const result = userAgent()

    assert.equal(result.deviceType, 'mobile')
  })

  it('recognises FirefoxOS tablets as tablets', () => {
    parserResult = {
      userAgent: 'Mozilla/5.0 (Tablet; rv:26.0) Gecko/26.0 Firefox/26.0',
      ua: {
        family: 'Firefox Mobile',
        major: '26',
        minor: '0'
      },
      os: {
        family: 'Firefox OS',
        major: '1',
        minor: '2'
      },
      device: {
        family: 'Generic Tablet',
        brand: 'Generic',
        model: 'Tablet'
      }
    }
    const result = userAgent()

    assert.equal(result.deviceType, 'tablet')
  })

  it('ignores form factor for generic devices', () => {
    parserResult = {
      userAgent: 'Mozilla/5.0 (Android 4.4; Mobile; rv:41.0) Gecko/41.0 Firefox/41.0',
      ua: {
        family: 'Firefox Mobile',
        major: '41',
        minor: '0'
      },
      os: {
        family: 'Android',
        major: '4',
        minor: '4'
      },
      device: {
        family: 'Generic Smartphone',
        brand: 'Generic'
      }
    }
    const result = userAgent()

    assert.equal(result.deviceType, 'mobile')
    assert.equal(result.formFactor, null)
  })

  it(
    'recognises old Firefox-iOS user agents',
    () => {
      parserResult = null
      const result = userAgent('Firefox-iOS-FxA/5.3 (Firefox)')

      assert.equal(result.browser, 'Firefox')
      assert.equal(result.browserVersion, '5.3')
      assert.equal(result.os, 'iOS')
      assert.equal(result.deviceType, 'mobile')
      assert.equal(result.formFactor, null)
    }
  )

  it(
    'recognises new Firefox-iOS user agents',
    () => {
      parserResult = null
      const result = userAgent('Firefox-iOS-FxA/6.0b42 (iPhone 6S; iPhone OS 10.3) (Nightly)')

      assert.equal(result.browser, 'Nightly')
      assert.equal(result.browserVersion, '6.0')
      assert.equal(result.os, 'iOS')
      assert.equal(result.osVersion, '10.3')
      assert.equal(result.deviceType, 'mobile')
      assert.equal(result.formFactor, 'iPhone 6S')
    }
  )

  it(
    'recognises new Firefox-iOS user agent on iPads',
    () => {
      parserResult = null
      const result = userAgent('Firefox-iOS-FxA/6.0b42 (iPad Mini; iPhone OS 10.3) (Nightly)')

      assert.equal(result.browser, 'Nightly')
      assert.equal(result.browserVersion, '6.0')
      assert.equal(result.os, 'iOS')
      assert.equal(result.osVersion, '10.3')
      assert.equal(result.deviceType, 'tablet')
      assert.equal(result.formFactor, 'iPad Mini')
    }
  )

  it(
    'recognises Firefox-Android user agents',
    () => {
      parserResult = null
      const result = userAgent('Firefox-Android-FxAccounts/49.0.2 (Firefox)')

      assert.equal(result.browser, 'Firefox')
      assert.equal(result.browserVersion, '49.0.2')
      assert.equal(result.os, 'Android')
      assert.equal(result.deviceType, 'mobile')
      assert.equal(result.formFactor, null)
    }
  )

  it('recognises old Android Sync user agents', () => {
    parserResult = {
      userAgent: 'Firefox AndroidSync 1.51.0.0 (Firefox)',
      ua: {
        family: 'Other'
      },
      os: {
        family: 'Android'
      },
      device: {
        family: 'Generic Smartphone',
        brand: 'Generic',
        model: 'Smartphone'
      }
    }
    const result = userAgent('Firefox AndroidSync 1.51.0.0 (Firefox)')

    assert.equal(result.browser, null)
    assert.equal(result.browserVersion, null)
    assert.equal(result.os, 'Android')
    assert.equal(result.deviceType, 'mobile')
    assert.equal(result.formFactor, null)
  })

  it('recognises new mobile Sync library user agents on Android', () => {
    parserResult = null
    const result = userAgent('Mobile-Android-Sync/(Mobile; Android 6.0) (foo() bar)')

    assert.equal(result.browser, 'foo() bar')
    assert.equal(result.browserVersion, null)
    assert.equal(result.os, 'Android')
    assert.equal(result.osVersion, '6.0')
    assert.equal(result.deviceType, 'mobile')
    assert.equal(result.formFactor, 'Mobile')
  })

  it('recognises new mobile Sync library user agents on iOS', () => {
    parserResult = null
    const result = userAgent('Mobile-iOS-Sync/(iPad Mini; iOS 10.3) (wibble)')

    assert.equal(result.browser, 'wibble')
    assert.equal(result.browserVersion, null)
    assert.equal(result.os, 'iOS')
    assert.equal(result.osVersion, '10.3')
    assert.equal(result.deviceType, 'tablet')
    assert.equal(result.formFactor, 'iPad Mini')
  })

  it('recognises old Kindle user agents', () => {
    parserResult = {
      userAgent: 'Mozilla/5.0 (Linux; U; en-US) AppleWebKit/528.5+ (KHTML, like Gecko, Safari/528.5+) Version/4.0 Kindle/3.0 (screen 600×800; rotate)',
      ua: {
        family: 'Kindle'
      },
      os: {
        family: 'Kindle'
      },
      device: {
        family: 'Kindle',
        brand: 'Amazon',
        model: 'Kindle 3.0'
      }
    }
    const result = userAgent()

    assert.equal(result.browser, 'Kindle')
    assert.equal(result.browserVersion, null)
    assert.equal(result.os, 'Kindle')
    assert.equal(result.deviceType, 'tablet')
    assert.equal(result.formFactor, 'Kindle')
  })

  it('recognises Kindle Fire user agents', () => {
    parserResult = {
      userAgent: 'Mozilla/5.0 (Linux; U; Android 2.3.4; en-us; Kindle Fire Build/GINGERBREAD) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
      ua: {
        family: 'Android',
        major: '2',
        minor: '3',
        patch: '4'
      },
      os: {
        family: 'Android',
        major: '2',
        minor: '3',
        patch: '4'
      },
      device: {
        family: 'Kindle',
        brand: 'Amazon',
        model: 'Kindle Fire'
      }
    }
    const result = userAgent()

    assert.equal(result.browser, 'Android')
    assert.equal(result.browserVersion, '2.3')
    assert.equal(result.os, 'Android')
    assert.equal(result.deviceType, 'tablet')
    assert.equal(result.formFactor, 'Kindle')
  })
})

