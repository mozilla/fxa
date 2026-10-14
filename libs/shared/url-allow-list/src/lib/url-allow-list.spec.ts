/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { isAllowed, format } from './url-allow-list';

describe('allow list url validation', () => {
  // Wrapper for is allowed, converts string to URL.
  function isUrlAllowed(url: string, allowlist: string[]) {
    return isAllowed(url, 'http://accounts.firefox.com', allowlist);
  }

  it('handles empty allow list', () => {
    const isValid = isUrlAllowed('http://foo.bar', []);
    expect(isValid).toBe(true);
  });

  it('allows exact domain', () => {
    const result = isUrlAllowed('http://foo.bar', ['foo.bar']);
    expect(result).toBe(true);
  });

  it('ignores case', () => {
    const result = isUrlAllowed('http://fOo.bAr', ['foo.bar']);
    expect(result).toBe(true);
  });

  it('allows exact domain', () => {
    const result = isUrlAllowed('http://foo.bar', ['foo.bar']);
    expect(result).toBe(true);
  });

  it('denies invalid domain', () => {
    const result = isUrlAllowed('http://foo.baz', ['foo.bar']);
    expect(result).toBe(false);
  });

  it('enforces dot notation', () => {
    const result = isUrlAllowed('http://foo_baz', ['foo.bar']);
    expect(result).toBe(false);
  });

  it('ignores ports', () => {
    const result = isUrlAllowed('http://foo.bar:1234', ['foo.bar']);
    expect(result).toBe(true);
  });

  it('prevents xss', () => {
    /* eslint-disable */
    const result = isUrlAllowed('javascript:alert(1)', ['foo.bar']);
    /* eslint-enable */
    expect(result).toBe(false);
  });

  it('prevents xss 2', () => {
    const result = isUrlAllowed('*', ['foo.bar']);
    expect(result).toBe(false);
  });

  describe('wildcard pattern', () => {
    it('allows all domains', () => {
      const result = isUrlAllowed('http://sub.foo.bar', ['*']);
      expect(result).toBe(true);
    });

    it('allows partial match domains', () => {
      const result = isUrlAllowed('http://sub.foo.bar', ['s*.f*o.b*r']);
      expect(result).toBe(true);
    });

    it('allows multiple wildcards match domains', () => {
      const result = isUrlAllowed('http://foosbars.baz', ['foo*bar*.baz']);
      expect(result).toBe(true);
    });

    it('denies bad multiple wild card match', () => {
      const result = isUrlAllowed('http://foosbazs.baz', ['foo*bar*.baz']);
      expect(result).toBe(false);
    });

    it('allows sub domains', () => {
      const result = isUrlAllowed('http://sub.foo.bar', ['*.foo.bar']);
      expect(result).toBe(true);
    });

    it('allows multiple sub domains', () => {
      const result = isUrlAllowed('http://sub.sub.foo.bar', ['*.foo.bar']);
      expect(result).toBe(true);
    });

    it('allows sandwiched sub domains', () => {
      const result = isUrlAllowed('http://foo.bar.baz', ['foo.*.baz']);
      expect(result).toBe(true);
    });

    it('prevents greedy sandwiched sub domains', () => {
      const result = isUrlAllowed('http://foo.bar.baz.biz', ['foo.*.biz']);
      expect(result).toBe(false);
    });

    it('prevents sandwiched sub domains from false positive', () => {
      const result = isUrlAllowed('http://foo.bar.baz.biz', ['bar.*.biz']);
      expect(result).toBe(false);
    });

    it('allows base domain', () => {
      const result = isUrlAllowed('http://sub.foo.bar', ['*.foo.bar']);
      expect(result).toBe(true);
    });

    it('allows missing subdomain domains', () => {
      const result = isUrlAllowed('http://foo.bar', ['*.foo.bar']);
      expect(result).toBe(true);
    });

    it('tolerates slop', () => {
      const result = isUrlAllowed('http://.foo.bar', ['*.foo.bar']);
      expect(result).toBe(true);
    });

    it('ensures postfix domain check', () => {
      const result = isUrlAllowed('http://foo.bar.baz.com', ['*.foo.bar']);
      expect(result).toBe(false);
    });

    it('denies invalid domains', () => {
      const result = isUrlAllowed('http://notfoo.bar', ['*.foo.bar']);
      expect(result).toBe(false);
    });

    it('denies partial domain match 1', () => {
      const result = isUrlAllowed('http://bar', ['*.foo.bar']);
      expect(result).toBe(false);
    });

    it('denies partial domain match 2s', () => {
      const result = isUrlAllowed('http://foo', ['*.foo.bar']);
      expect(result).toBe(false);
    });
  });
});

describe('convict allow list format', () => {
  const check = format.allowlist.validate;
  const coerce = format.allowlist.coerce;

  it('it handles slop in allow list', () => {
    expect(() => {
      check('');
    }).not.toThrow();
    expect(() => {
      check(',');
    }).not.toThrow();
    expect(() => {
      check(',foo');
    }).not.toThrow();
    expect(() => {
      check('foo,');
    }).not.toThrow();
    expect(() => {
      check('foo,,bar');
    }).not.toThrow();
  });

  it('prevents post fixed wild card rule', () => {
    expect(() => {
      check('foo.*');
    }).toThrow();
    expect(() => {
      check('.*');
    }).toThrow();
    expect(() => {
      check('*');
    }).not.toThrow();
  });

  it('prevents empty fragments in rule', () => {
    expect(() => {
      check('.');
    }).toThrow();
    expect(() => {
      check('foo.');
    }).toThrow();
    expect(() => {
      check('.foo');
    }).toThrow();
    expect(() => {
      check('foo. .bar');
    }).toThrow();
  });

  it('coerces csv string', () => {
    expect(coerce('*.foo,*.bar')).toEqual(['*.foo', '*.bar']);
  });
});
