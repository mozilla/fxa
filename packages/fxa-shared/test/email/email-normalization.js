/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { assert } = require('chai');
const { EmailNormalization } = require('../../email/email-normalization');

describe('EmailNormalization', () => {
  it('trims and lowercases the email before processing', () => {
    const emailNormalization = new EmailNormalization(JSON.stringify([]));

    const result = emailNormalization.normalizeEmailAliases(
      '  Foo.Bar@Example.COM  '
    );

    assert.equal(result, 'foo.bar@example.com');
  });

  it('thows on bad json', () => {
    try {
      const emailNormalization = new EmailNormalization('{');
      emailNormalization.normalizeEmailAliases('foo@mozilla.com');
      assert.fail('Should have failed');
    } catch (err) {
      assert.equal(
        err?.message,
        'emailTransforms must be JSON formatted string'
      );
    }
  });

  it('throws on invalid email: missing @', () => {
    const emailNormalization = new EmailNormalization(JSON.stringify([]));
    try {
      (emailNormalization.normalizeEmailAliases('not-an-email'),
        assert.fail('Should have thrown.'));
    } catch (err) {
      assert.equal(err?.message, 'Invalid Email!');
    }
  });

  it('throws on invalid email: too many @', () => {
    const emailNormalization = new EmailNormalization(JSON.stringify([]));
    try {
      (emailNormalization.normalizeEmailAliases('a@b@c'),
        assert.fail('Should have thrown.'));
    } catch (err) {
      assert.equal(err?.message, 'Invalid Email!');
    }
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

    assert.equal(result1, 'foobar@example.com');
    assert.equal(result2, 'foo.bar@allowed.com');
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

    assert.equal(result, 'bazbar@example.com');
  });

  it('returns the normalized local-part plus the (lowercased) domain', () => {
    const transforms = JSON.stringify([
      { domain: 'example.com', regex: '\\+.*', replace: '' },
    ]);
    const emailNormalization = new EmailNormalization(transforms);

    const result = emailNormalization.normalizeEmailAliases(
      'User+tag@Example.com'
    );

    assert.equal(result, 'user@example.com');
  });

  it('does nothing if there are no matching transforms', () => {
    const transforms = JSON.stringify([
      { domain: 'other.com', regex: '\\.', replace: '' },
    ]);
    const emailNormalization = new EmailNormalization(transforms);

    const result = emailNormalization.normalizeEmailAliases(
      'Foo.Bar@example.com'
    );

    assert.equal(result, 'foo.bar@example.com');
  });
});
