/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as userAgent from './user-agent';

type ParseToScalars = (
  userAgentString?: string
) => userAgent.UAScalarProperties;

// The fixtures leave out fields on purpose to test the toVersionString checks.
const asParsed = (result: unknown) =>
  result as userAgent.ParsedUserAgentProperties;

describe('lib/user-agent:', () => {
  it('interface is correct', () => {
    expect(typeof userAgent.parse).toBe('function');
    expect(userAgent.parse).toHaveLength(1);
    expect(typeof userAgent.isToVersionStringSupported).toBe('function');
    expect(typeof userAgent.parseToScalars).toBe('function');
  });

  it('isToVersionStringSupported returns false if os.toVersionString is not available', () => {
    expect(
      userAgent.isToVersionStringSupported(
        asParsed({
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
      )
    ).toBe(false);
  });

  it('isToVersionStringSupported returns false if ua.toVersionString is not available', () => {
    expect(
      userAgent.isToVersionStringSupported(
        asParsed({
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
      )
    ).toBe(false);
  });

  it('isToVersionStringSupported returns true if toVersionString is available', () => {
    expect(
      userAgent.isToVersionStringSupported(
        asParsed({
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
      )
    ).toBe(true);
  });

  it('parses a valid user-agent string', () => {
    const result = userAgent.parse(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:61.0) Gecko/20100101 Firefox/65.0'
    );
    expect(result.ua.family).toBe('Firefox');
    expect(result.ua.toVersionString()).toBe('65.0');
    expect(result.ua.major).toBe('65');
    expect(result.ua.minor).toBe('0');
    expect(result.ua.patch).toBeNull();
    expect(result.os.family).toBe('Mac OS X');
    expect(result.os.toVersionString()).toBe('10.11');
    expect(result.os.patch).toBeNull();
  });

  it('returns the correct scalars', () => {
    const result = userAgent.parseToScalars(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:61.0) Gecko/20100101 Firefox/65.0'
    );
    expect(result.browser).toBe('Firefox');
    expect(result.browserVersion).toBe('65.0');
    expect(result.os).toBe('Mac OS X');
    expect(result.osVersion).toBe('10.11');
    expect(result.deviceType).toBeNull();
    expect(result.formFactor).toBeNull();
  });

  it('parses a valid vulnerable-but-safe user-agent string', () => {
    const result = userAgent.parse('wibble-iPad/1.0 CFNetwork');
    expect(result.ua.family).toBe('wibble');
    expect(result.ua.toVersionString()).toBe('1.0');
  });

  it('excludes unsafe input from the result', () => {
    const result = userAgent.parse('<a>wibble</a>-iPad/1.0 CFNetwork');
    expect(result.ua.family).toBeNull();
    expect(result.ua.toVersionString()).toBe('1.0');
  });

  it('drops dodgy-looking fields from vulnerable node-uap regexes', () => {
    expect(
      userAgent.parseToScalars('http://example.com-iPad/1.0 CFNetwork')
    ).toEqual({
      browser: null,
      browserVersion: '1.0',
      os: 'iOS',
      osVersion: '1.0',
      deviceType: 'mobile',
      formFactor: null,
    });
    expect(userAgent.parseToScalars('<a>foo</a>-iPhone/2 CFNetwork')).toEqual({
      browser: null,
      browserVersion: '2',
      os: 'iOS',
      osVersion: null,
      deviceType: 'mobile',
      formFactor: 'iPhone',
    });
    expect(userAgent.parseToScalars('wibble\t/7 CFNetwork')).toEqual({
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
    expect(
      userAgent.parseToScalars(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/20.2 Safari/605.1.15'
      )
    ).toEqual({
      browser: 'Firefox iOS',
      browserVersion: '20.2',
      os: 'Mac OS X',
      osVersion: '10.15',
      deviceType: 'tablet',
      formFactor: 'iPad',
    });
  });

  describe('scalar results with mocked parser dependency', () => {
    let uaParser: { parse: jest.Mock };
    let userAgent: ParseToScalars;
    let parserResult: any;

    beforeEach(() => {
      uaParser = {
        parse: jest.fn(() => parserResult),
      };

      jest.isolateModules(() => {
        jest.doMock('node-uap', () => uaParser);
        userAgent = require('./user-agent').parseToScalars;
      });
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

      expect(uaParser.parse).toHaveBeenCalledTimes(1);
      expect(uaParser.parse).toHaveBeenCalledWith('qux');

      expect(Object.keys(result)).toHaveLength(6);
      expect(result.browser).toBe('foo');
      expect(result.browserVersion).toBe('1');
      expect(result.os).toBe('bar');
      expect(result.osVersion).toBe('2');
      expect(result.deviceType).toBe('mobile');
      expect(result.formFactor).toBe('baz');
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

      expect(uaParser.parse).toHaveBeenCalledTimes(1);
      expect(uaParser.parse).toHaveBeenCalledWith('wibble');

      expect(Object.keys(result)).toHaveLength(6);
      expect(result.browser).toBeNull();
      expect(result.browserVersion).toBe('1.0');
      expect(result.os).toBeNull();
      expect(result.osVersion).toBe('2.0');
      expect(result.deviceType).toBeNull();
      expect(result.formFactor).toBeNull();
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

      expect(result.deviceType).toBe('mobile');
      expect(result.formFactor).toBeNull();
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

      expect(result.deviceType).toBe('mobile');
      expect(result.formFactor).toBe('iPhone 7');
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

      expect(result.deviceType).toBeNull();
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

      expect(result.deviceType).toBeNull();
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

      expect(result.deviceType).toBeNull();
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

      expect(result.deviceType).toBe('tablet');
      expect(result.formFactor).toBe('iPad Pro');
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

      expect(result.deviceType).toBe('tablet');
      expect(result.formFactor).toBe('Nexus 7');
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

      expect(result.deviceType).toBe('mobile');
      expect(result.formFactor).toBeNull();
    });

    it('recognises old Firefox-iOS user agents', () => {
      parserResult = null;
      const result = userAgent('Firefox-iOS-FxA/5.3 (Firefox)');

      expect(result.browser).toBe('Firefox');
      expect(result.browserVersion).toBe('5.3');
      expect(result.os).toBe('iOS');
      expect(result.deviceType).toBe('mobile');
      // The Sync regex path returns undefined here, though the type says null
      expect(result.formFactor ?? null).toBeNull();
    });

    it('recognises new Firefox-iOS user agents', () => {
      parserResult = null;
      const result = userAgent(
        'Firefox-iOS-FxA/6.0b42 (iPhone 6S; iPhone OS 10.3) (Nightly)'
      );

      expect(result.browser).toBe('Nightly');
      expect(result.browserVersion).toBe('6.0');
      expect(result.os).toBe('iOS');
      expect(result.osVersion).toBe('10.3');
      expect(result.deviceType).toBe('mobile');
      expect(result.formFactor).toBe('iPhone 6S');
    });

    it('recognises new Firefox-iOS user agent on iPads', () => {
      parserResult = null;
      const result = userAgent(
        'Firefox-iOS-FxA/6.0b42 (iPad Mini; iPhone OS 10.3) (Nightly)'
      );

      expect(result.browser).toBe('Nightly');
      expect(result.browserVersion).toBe('6.0');
      expect(result.os).toBe('iOS');
      expect(result.osVersion).toBe('10.3');
      expect(result.deviceType).toBe('tablet');
      expect(result.formFactor).toBe('iPad Mini');
    });

    it('recognises Firefox-Android user agents', () => {
      parserResult = null;
      const result = userAgent('Firefox-Android-FxAccounts/49.0.2 (Firefox)');

      expect(result.browser).toBe('Firefox');
      expect(result.browserVersion).toBe('49.0.2');
      expect(result.os).toBe('Android');
      expect(result.deviceType).toBe('mobile');
      // The Sync regex path returns undefined here, though the type says null
      expect(result.formFactor ?? null).toBeNull();
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

      expect(result.browser).toBeNull();
      // The Sync regex path returns undefined here, though the type says null
      expect(result.browserVersion ?? null).toBeNull();
      expect(result.os).toBe('Android');
      expect(result.deviceType).toBe('mobile');
      expect(result.formFactor).toBeNull();
    });

    it('recognises new mobile Sync library user agents on Android', () => {
      parserResult = null;
      const result = userAgent(
        'Mobile-Android-Sync/(Mobile; Android 6.0) (foo bar)'
      );

      expect(result.browser).toBe('foo bar');
      expect(result.browserVersion).toBeNull();
      expect(result.os).toBe('Android');
      expect(result.osVersion).toBe('6.0');
      expect(result.deviceType).toBe('mobile');
      expect(result.formFactor).toBe('Mobile');
    });

    it('recognises new mobile Sync library user agents on iOS', () => {
      parserResult = null;
      const result = userAgent(
        'Mobile-iOS-Sync/(iPad Mini; iOS 10.3) (wibble)'
      );

      expect(result.browser).toBe('wibble');
      expect(result.browserVersion).toBeNull();
      expect(result.os).toBe('iOS');
      expect(result.osVersion).toBe('10.3');
      expect(result.deviceType).toBe('tablet');
      expect(result.formFactor).toBe('iPad Mini');
    });
  });

  describe('platformFromOS:', () => {
    const { platformFromOS } = userAgent;

    it('maps iOS OS families to ios', () => {
      expect(platformFromOS('iOS')).toBe('ios');
      expect(platformFromOS('iPhone OS')).toBe('ios');
    });

    it('maps Android to android', () => {
      expect(platformFromOS('Android')).toBe('android');
    });

    it('maps desktop OS families to desktop', () => {
      expect(platformFromOS('Windows')).toBe('desktop');
      expect(platformFromOS('Mac OS X')).toBe('desktop');
      expect(platformFromOS('Linux')).toBe('desktop');
    });

    it('returns unknown when the OS is missing', () => {
      expect(platformFromOS('')).toBe('unknown');
      expect(platformFromOS(undefined)).toBe('unknown');
    });

    it('returns unknown for non-desktop or unrecognized OS families', () => {
      expect(platformFromOS('Windows Phone')).toBe('unknown');
      expect(platformFromOS('Windows Mobile')).toBe('unknown');
      expect(platformFromOS('Firefox OS')).toBe('unknown');
      expect(platformFromOS('tvOS')).toBe('unknown');
      expect(platformFromOS('SomeFutureOS')).toBe('unknown');
    });
  });
});
