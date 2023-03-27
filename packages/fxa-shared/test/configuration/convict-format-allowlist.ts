/* eslint-disable no-prototype-builtins */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { expect, assert } from 'chai';
import {
  isAllowed,
  format,
} from '../../configuration/convict-format-allow-list';

describe('allow list url validation', () => {
  // Wrapper for is allowed, converts string to URL.
  function isUrlAllowed(url: string, allowlist: string[]) {
    return isAllowed(url, 'http://accounts.firefox.com', allowlist);
  }

  it('handles empty allow list', () => {
    const isValid = isUrlAllowed('http://foo.bar', []);
    assert.isTrue(isValid);
  });

  it('allows exact domain', () => {
    const result = isUrlAllowed('http://foo.bar', ['foo.bar']);
    assert.isTrue(result);
  });

  it('ignores case', () => {
    const result = isUrlAllowed('http://fOo.bAr', ['foo.bar']);
    assert.isTrue(result);
  });

  it('allows exact domain', () => {
    const result = isUrlAllowed('http://foo.bar', ['foo.bar']);
    assert.isTrue(result);
  });

  it('denies invalid domain', () => {
    const result = isUrlAllowed('http://foo.baz', ['foo.bar']);
    assert.isFalse(result);
  });

  it('enforces dot notation', () => {
    const result = isUrlAllowed('http://foo_baz', ['foo.bar']);
    assert.isFalse(result);
  });

  it('ignores ports', () => {
    const result = isUrlAllowed('http://foo.bar:1234', ['foo.bar']);
    assert.isTrue(result);
  });

  it('prevents xss', () => {
    /* eslint-disable */
    const result = isUrlAllowed('javascript:alert(1)', ['foo.bar']);
    /* eslint-enable */
    assert.isFalse(result);
  });

  it('prevents xss 2', () => {
    const result = isUrlAllowed('*', ['foo.bar']);
    assert.isFalse(result);
  });

  describe('wildcard pattern', () => {
    it('allows all domains', () => {
      const result = isUrlAllowed('http://sub.foo.bar', ['*']);
      assert.isTrue(result);
    });

    it('allows partial match domains', () => {
      const result = isUrlAllowed('http://sub.foo.bar', ['s*.f*o.b*r']);
      assert.isTrue(result);
    });

    it('allows multiple wildcards match domains', () => {
      const result = isUrlAllowed('http://foosbars.baz', ['foo*bar*.baz']);
      assert.isTrue(result);
    });

    it('denies bad multiple wild card match', () => {
      const result = isUrlAllowed('http://foosbazs.baz', ['foo*bar*.baz']);
      assert.isFalse(result);
    });

    it('allows sub domains', () => {
      const result = isUrlAllowed('http://sub.foo.bar', ['*.foo.bar']);
      assert.isTrue(result);
    });

    it('allows multiple sub domains', () => {
      const result = isUrlAllowed('http://sub.sub.foo.bar', ['*.foo.bar']);
      assert.isTrue(result);
    });

    it('allows sandwiched sub domains', () => {
      const result = isUrlAllowed('http://foo.bar.baz', ['foo.*.baz']);
      assert.isTrue(result);
    });

    it('prevents greedy sandwiched sub domains', () => {
      const result = isUrlAllowed('http://foo.bar.baz.biz', ['foo.*.biz']);
      assert.isFalse(result);
    });

    it('prevents sandwiched sub domains from false positive', () => {
      const result = isUrlAllowed('http://foo.bar.baz.biz', ['bar.*.biz']);
      assert.isFalse(result);
    });

    it('allows base domain', () => {
      const result = isUrlAllowed('http://sub.foo.bar', ['*.foo.bar']);
      assert.isTrue(result);
    });

    it('allows missing subdomain domains', () => {
      const result = isUrlAllowed('http://foo.bar', ['*.foo.bar']);
      assert.isTrue(result);
    });

    it('tolerates slop', () => {
      const result = isUrlAllowed('http://.foo.bar', ['*.foo.bar']);
      assert.isTrue(result);
    });

    it('ensures postfix domain check', () => {
      const result = isUrlAllowed('http://foo.bar.baz.com', ['*.foo.bar']);
      assert.isFalse(result);
    });

    it('denies invalid domains', () => {
      const result = isUrlAllowed('http://notfoo.bar', ['*.foo.bar']);
      assert.isFalse(result);
    });

    it('denies partial domain match 1', () => {
      const result = isUrlAllowed('http://bar', ['*.foo.bar']);
      assert.isFalse(result);
    });

    it('denies partial domain match 2s', () => {
      const result = isUrlAllowed('http://foo', ['*.foo.bar']);
      assert.isFalse(result);
    });
  });
});

describe('convict allow list format', () => {
  const check = format.allowlist.validate;
  const coerce = format.allowlist.coerce;

  it('it handles slop in allow list', () => {
    expect(() => {
      check('');
    }).to.not.throw();
    expect(() => {
      check(',');
    }).to.not.throw();
    expect(() => {
      check(',foo');
    }).to.not.throw();
    expect(() => {
      check('foo,');
    }).to.not.throw();
    expect(() => {
      check('foo,,bar');
    }).to.not.throw();
  });

  it('prevents post fixed wild card rule', () => {
    expect(() => {
      check('foo.*');
    }).to.throw();
    expect(() => {
      check('.*');
    }).to.throw();
    expect(() => {
      check('*');
    }).to.not.throw();
  });

  it('prevents empty fragments in rule', () => {
    expect(() => {
      check('.');
    }).to.throw();
    expect(() => {
      check('foo.');
    }).to.throw();
    expect(() => {
      check('.foo');
    }).to.throw();
    expect(() => {
      check('foo. .bar');
    }).to.throw();
  });

  it('coerces csv string', () => {
    expect(coerce('*.foo,*.bar')).to.deep.equal(['*.foo', '*.bar']);
  });
});
