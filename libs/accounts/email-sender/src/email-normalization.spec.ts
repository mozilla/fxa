/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { EmailNormalization } from './email-normalization';

describe('EmailNormalization', () => {
  it('trims and lowercases the email before processing', () => {
    const emailNormalization = new EmailNormalization(JSON.stringify([]));

    const result = emailNormalization.normalizeEmailAliases(
      '  Foo.Bar@Example.COM  '
    );

    expect(result).toBe('foo.bar@example.com');
  });

  it('throws on bad json', () => {
    expect(() => new EmailNormalization('{')).toThrow(
      'emailTransforms must be JSON formatted string'
    );
  });

  it('throws on invalid email: missing @', () => {
    const emailNormalization = new EmailNormalization(JSON.stringify([]));

    expect(() =>
      emailNormalization.normalizeEmailAliases('not-an-email')
    ).toThrow('Invalid Email!');
  });

  it('throws on invalid email: too many @', () => {
    const emailNormalization = new EmailNormalization(JSON.stringify([]));

    expect(() => emailNormalization.normalizeEmailAliases('a@b@c')).toThrow(
      'Invalid Email!'
    );
  });

  it('applies transforms only for matching domain', () => {
    const transforms = JSON.stringify([
      { domain: 'example.com', regex: '\\.', replace: '' },
      { domain: 'other.com', regex: 'foo', replace: 'bar' },
    ]);
    const emailNormalization = new EmailNormalization(transforms);

    const result1 = emailNormalization.normalizeEmailAliases(
      'Foo.Bar@Example.com'
    );
    const result2 = emailNormalization.normalizeEmailAliases(
      'foo.bar@allowed.com'
    );

    expect(result1).toBe('foobar@example.com');
    expect(result2).toBe('foo.bar@allowed.com');
  });

  it('applies multiple transforms for the same domain in order', () => {
    const transforms = JSON.stringify([
      { domain: 'example.com', regex: '\\.', replace: '' }, // foo.bar -> foobar
      { domain: 'example.com', regex: '^foo', replace: 'baz' }, // foobar -> bazbar
    ]);
    const emailNormalization = new EmailNormalization(transforms);

    const result = emailNormalization.normalizeEmailAliases(
      'Foo.Bar@Example.com'
    );

    expect(result).toBe('bazbar@example.com');
  });

  it('returns the normalized local-part plus the (lowercased) domain', () => {
    const transforms = JSON.stringify([
      { domain: 'example.com', regex: '\\+.*', replace: '' },
    ]);
    const emailNormalization = new EmailNormalization(transforms);

    const result = emailNormalization.normalizeEmailAliases(
      'User+tag@Example.com'
    );

    expect(result).toBe('user@example.com');
  });

  it('does nothing if there are no matching transforms', () => {
    const transforms = JSON.stringify([
      { domain: 'other.com', regex: '\\.', replace: '' },
    ]);
    const emailNormalization = new EmailNormalization(transforms);

    const result = emailNormalization.normalizeEmailAliases(
      'Foo.Bar@example.com'
    );

    expect(result).toBe('foo.bar@example.com');
  });
});
