/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const assert = require('chai').assert;
const proxyquire = require('proxyquire');
const sinon = require('sinon');

describe('lib/user-agent:', () => {
  let userAgent;

  before(() => {
    userAgent = require('../../lib/user-agent');
  });

  it('interface is correct', () => {
    assert.isFunction(userAgent.parse);
    assert.lengthOf(userAgent.parse, 1);
    assert.isFunction(userAgent.isToVersionStringSupported);
    assert.isFunction(userAgent.parseToScalars);
  });

  it('isToVersionStringSupported returns false if os.toVersionString is not available', () => {
    assert.isFalse(
      userAgent.isToVersionStringSupported({
        os: {
          major: 1,
          minor: 0,
        },
        ua: {
          major: 1,
          minor: 0,
          toVersionString: function () {},
        },
      })
    );
  });

  it('isToVersionStringSupported returns false if ua.toVersionString is not available', () => {
    assert.isFalse(
      userAgent.isToVersionStringSupported({
        os: {
          major: 1,
          minor: 0,
          toVersionString: function () {},
        },
        ua: {
          major: 1,
          minor: 0,
        },
      })
    );
  });

  it('isToVersionStringSupported returns true if toVersionString is available', () => {
    assert.isTrue(
      userAgent.isToVersionStringSupported({
        os: {
          major: 1,
          minor: 0,
          toVersionString: function () {},
        },
        ua: {
          major: 1,
          minor: 0,
          toVersionString: function () {},
        },
      })
    );
  });

  it('parses a valid user-agent string', () => {
    const result = userAgent.parse(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:61.0) Gecko/20100101 Firefox/65.0'
    );
    assert.equal(result.ua.family, 'Firefox');
    assert.equal(result.ua.toVersionString(), '65.0');
    assert.equal(result.ua.major, '65');
    assert.equal(result.ua.minor, '0');
    assert.isNull(result.ua.patch);
    assert.equal(result.os.family, 'Mac OS X');
    assert.equal(result.os.toVersionString(), '10.11');
    assert.isNull(result.os.patch);
  });

  it('returns the correct scalars', () => {
    const result = userAgent.parseToScalars(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:61.0) Gecko/20100101 Firefox/65.0'
    );
    assert.equal(result.browser, 'Firefox');
    assert.equal(result.browserVersion, '65.0');
    assert.equal(result.os, 'Mac OS X');
    assert.equal(result.osVersion, '10.11');
    assert.equal(result.deviceType, null);
    assert.equal(result.formFactor, null);
  });

  it('parses a valid vulnerable-but-safe user-agent string', () => {
    const result = userAgent.parse('wibble-iPad/1.0 CFNetwork');
    assert.equal(result.ua.family, 'wibble');
    assert.equal(result.ua.toVersionString(), '1.0');
  });

  it('excludes unsafe input from the result', () => {
    const result = userAgent.parse('<a>wibble</a>-iPad/1.0 CFNetwork');
    assert.isNull(result.ua.family);
    assert.equal(result.ua.toVersionString(), '1.0');
  });

  it('drops dodgy-looking fields from vulnerable node-uap regexes', () => {
    assert.deepEqual(
      userAgent.parseToScalars('http://example.com-iPad/1.0 CFNetwork'),
      {
        browser: null,
        browserVersion: '1.0',
        os: 'iOS',
        osVersion: '1.0',
        deviceType: 'mobile',
        formFactor: null,
      }
    );
    assert.deepEqual(
      userAgent.parseToScalars('<a>foo</a>-iPhone/2 CFNetwork'),
      {
        browser: null,
        browserVersion: '2',
        os: 'iOS',
        osVersion: null,
        deviceType: 'mobile',
        formFactor: 'iPhone',
      }
    );
    assert.deepEqual(userAgent.parseToScalars('wibble\t/7 CFNetwork'), {
      browser: null,
      browserVersion: '7',
      os: null,
      osVersion: null,
      deviceType: null,
      formFactor: null,
    });
  });

  it('correctly parses iPad user agents requesting a desktop site', () => {
    // Note: the iOS version is not included in this type of user agent
    // and `osVersion` is therefore not accurate
    assert.deepEqual(
      userAgent.parseToScalars(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/20.2 Safari/605.1.15'
      ),
      {
        browser: 'Firefox iOS',
        browserVersion: '20.2',
        os: 'Mac OS X',
        osVersion: '10.15',
        deviceType: 'tablet',
        formFactor: 'iPad',
      }
    );
  });

  describe('scalar results with mocked parser dependency', () => {
    let uaParser, userAgent, parserResult;

    beforeEach(() => {
      uaParser = {
        parse: sinon.spy(() => parserResult),
      };

      userAgent = proxyquire('../../lib/user-agent', {
        'node-uap': uaParser,
      }).parseToScalars;
    });

    it('sets data correctly', () => {
      parserResult = {
        ua: {
          family: 'foo',
          toVersionString: () => '1',
        },
        os: {
          family: 'bar',
          toVersionString: () => '2',
        },
        device: {
          family: 'baz',
        },
      };
      const result = userAgent('qux');

      assert.equal(uaParser.parse.callCount, 1);
      assert.ok(uaParser.parse.calledWithExactly('qux'));

      assert.equal(Object.keys(result).length, 6);
      assert.equal(result.browser, 'foo');
      assert.equal(result.browserVersion, '1');
      assert.equal(result.os, 'bar');
      assert.equal(result.osVersion, '2');
      assert.equal(result.deviceType, 'mobile');
      assert.equal(result.formFactor, 'baz');
    });

    it('ignores family:Other', () => {
      parserResult = {
        ua: {
          family: 'Other',
          toVersionString: () => '1.0',
        },
        os: {
          family: 'Other',
          toVersionString: () => '2.0',
        },
        device: {
          family: 'Other',
        },
      };
      const result = userAgent('wibble');

      assert.equal(uaParser.parse.callCount, 1);
      assert.ok(uaParser.parse.calledWithExactly('wibble'));

      assert.equal(Object.keys(result).length, 6);
      assert.equal(result.browser, null);
      assert.equal(result.browserVersion, '1.0');
      assert.equal(result.os, null);
      assert.equal(result.osVersion, '2.0');
      assert.equal(result.deviceType, null);
      assert.equal(result.formFactor, null);
    });

    it('recognises Android phones as a mobile OS', () => {
      parserResult = {
        userAgent:
          'Mozilla/5.0 (Android 7.1.2; Mobile; rv:56.0) Gecko/56.0 Firefox/56.0',
        ua: {
          family: 'foo',
          toVersionString: () => '1.0',
        },
        os: {
          family: 'Android',
          toVersionString: () => '2.0',
        },
        device: {
          family: 'Other',
        },
      };
      const result = userAgent();

      assert.equal(result.deviceType, 'mobile');
      assert.equal(result.formFactor, null);
    });

    it('recognises iOS as a mobile OS', () => {
      parserResult = {
        ua: {
          family: 'foo',
          toVersionString: () => '1.0',
        },
        os: {
          family: 'iOS',
          toVersionString: () => '2.0',
        },
        device: {
          family: 'iPhone 7',
        },
      };
      const result = userAgent();

      assert.equal(result.deviceType, 'mobile');
      assert.equal(result.formFactor, 'iPhone 7');
    });

    it('does not recognise Mac OS X as a mobile OS', () => {
      parserResult = {
        ua: {
          family: 'foo',
          toVersionString: () => '1.0',
        },
        os: {
          family: 'Mac OS X',
          toVersionString: () => '2.0',
        },
        device: {
          family: 'Other',
        },
      };
      const result = userAgent();

      assert.equal(result.deviceType, null);
    });

    it('does not recognise Linux as a mobile OS', () => {
      parserResult = {
        ua: {
          family: 'foo',
          toVersionString: () => '1.0',
        },
        os: {
          family: 'Linux',
          toVersionString: () => '2.0',
        },
        device: {
          family: 'Other',
        },
      };
      const result = userAgent();

      assert.equal(result.deviceType, null);
    });

    it('does not recognise Windows as a mobile OS', () => {
      parserResult = {
        ua: {
          family: 'foo',
          toVersionString: () => '1.0',
        },
        os: {
          family: 'Windows',
          toVersionString: () => '2.0',
        },
        device: {
          family: 'Other',
        },
      };
      const result = userAgent();

      assert.equal(result.deviceType, null);
    });

    it('recognises iPads as tablets', () => {
      parserResult = {
        userAgent:
          'Mozilla/5.0 (iPad; CPU OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Mobile/11A465',
        ua: {
          family: 'Mobile Safari UI/WKWebView',
          toVersionString: () => '7.0',
        },
        os: {
          family: 'iOS',
          toVersionString: () => '7.0',
        },
        device: {
          family: 'iPad Pro',
        },
      };
      const result = userAgent();

      assert.equal(result.deviceType, 'tablet');
      assert.equal(result.formFactor, 'iPad Pro');
    });

    it('recognises Android tablets as tablets', () => {
      parserResult = {
        userAgent:
          'Mozilla/5.0 (Linux; Android 4.4.2; Nexus 7 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.59 Safari/537.36',
        ua: {
          family: 'Chrome Mobile',
          toVersionString: () => '31.0',
        },
        os: {
          family: 'Android',
          toVersionString: () => '4.4',
        },
        device: {
          family: 'Nexus 7',
        },
      };
      const result = userAgent();

      assert.equal(result.deviceType, 'tablet');
      assert.equal(result.formFactor, 'Nexus 7');
    });

    it('ignores form factor for generic devices', () => {
      parserResult = {
        userAgent:
          'Mozilla/5.0 (Android 4.4; Mobile; rv:41.0) Gecko/41.0 Firefox/41.0',
        ua: {
          family: 'Firefox Mobile',
          toVersionString: () => '41.0',
        },
        os: {
          family: 'Android',
          toVersionString: () => '4.4',
        },
        device: {
          family: 'Generic Smartphone',
          brand: 'Generic',
        },
      };
      const result = userAgent();

      assert.equal(result.deviceType, 'mobile');
      assert.equal(result.formFactor, null);
    });

    it('recognises old Firefox-iOS user agents', () => {
      parserResult = null;
      const result = userAgent('Firefox-iOS-FxA/5.3 (Firefox)');

      assert.equal(result.browser, 'Firefox');
      assert.equal(result.browserVersion, '5.3');
      assert.equal(result.os, 'iOS');
      assert.equal(result.deviceType, 'mobile');
      assert.equal(result.formFactor, null);
    });

    it('recognises new Firefox-iOS user agents', () => {
      parserResult = null;
      const result = userAgent(
        'Firefox-iOS-FxA/6.0b42 (iPhone 6S; iPhone OS 10.3) (Nightly)'
      );

      assert.equal(result.browser, 'Nightly');
      assert.equal(result.browserVersion, '6.0');
      assert.equal(result.os, 'iOS');
      assert.equal(result.osVersion, '10.3');
      assert.equal(result.deviceType, 'mobile');
      assert.equal(result.formFactor, 'iPhone 6S');
    });

    it('recognises new Firefox-iOS user agent on iPads', () => {
      parserResult = null;
      const result = userAgent(
        'Firefox-iOS-FxA/6.0b42 (iPad Mini; iPhone OS 10.3) (Nightly)'
      );

      assert.equal(result.browser, 'Nightly');
      assert.equal(result.browserVersion, '6.0');
      assert.equal(result.os, 'iOS');
      assert.equal(result.osVersion, '10.3');
      assert.equal(result.deviceType, 'tablet');
      assert.equal(result.formFactor, 'iPad Mini');
    });

    it('recognises Firefox-Android user agents', () => {
      parserResult = null;
      const result = userAgent('Firefox-Android-FxAccounts/49.0.2 (Firefox)');

      assert.equal(result.browser, 'Firefox');
      assert.equal(result.browserVersion, '49.0.2');
      assert.equal(result.os, 'Android');
      assert.equal(result.deviceType, 'mobile');
      assert.equal(result.formFactor, null);
    });

    it('recognises old Android Sync user agents', () => {
      parserResult = {
        userAgent: 'Firefox AndroidSync 1.51.0.0 (Firefox)',
        ua: {
          family: 'Other',
          toVersionString: () => {},
        },
        os: {
          family: 'Android',
          toVersionString: () => {},
        },
        device: {
          family: 'Generic Smartphone',
          brand: 'Generic',
          model: 'Smartphone',
        },
      };
      const result = userAgent('Firefox AndroidSync 1.51.0.0 (Firefox)');

      assert.equal(result.browser, null);
      assert.equal(result.browserVersion, null);
      assert.equal(result.os, 'Android');
      assert.equal(result.deviceType, 'mobile');
      assert.equal(result.formFactor, null);
    });

    it('recognises new mobile Sync library user agents on Android', () => {
      parserResult = null;
      const result = userAgent(
        'Mobile-Android-Sync/(Mobile; Android 6.0) (foo bar)'
      );

      assert.equal(result.browser, 'foo bar');
      assert.equal(result.browserVersion, null);
      assert.equal(result.os, 'Android');
      assert.equal(result.osVersion, '6.0');
      assert.equal(result.deviceType, 'mobile');
      assert.equal(result.formFactor, 'Mobile');
    });

    it('recognises new mobile Sync library user agents on iOS', () => {
      parserResult = null;
      const result = userAgent(
        'Mobile-iOS-Sync/(iPad Mini; iOS 10.3) (wibble)'
      );

      assert.equal(result.browser, 'wibble');
      assert.equal(result.browserVersion, null);
      assert.equal(result.os, 'iOS');
      assert.equal(result.osVersion, '10.3');
      assert.equal(result.deviceType, 'tablet');
      assert.equal(result.formFactor, 'iPad Mini');
    });
  });
});
