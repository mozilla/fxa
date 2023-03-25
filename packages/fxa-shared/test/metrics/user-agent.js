/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const assert = require('chai').assert;

describe('metrics/user-agent:', () => {
  let userAgent;

  before(() => {
    userAgent = require('../../metrics/user-agent');
  });

  it('interface is correct', () => {
    assert.isFunction(userAgent.parse);
    assert.lengthOf(userAgent.parse, 1);
    assert.isFunction(userAgent.isToVersionStringSupported);
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
});
