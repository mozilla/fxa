import { assert } from 'chai';
import { normalizeEmail, emailsMatch, isEmailValid, isEmailMask } from '../../email/helpers';

describe('email/helpers', () => {
  describe('normalizeEmail', () => {
    it('normalizes ASCII emails correctly', () => {
      assert.equal(normalizeEmail('USER@EXAMPLE.COM'), 'user@example.com');
    });

    it('normalizes Unicode domains to punycode', () => {
      assert.equal(normalizeEmail('user@exämple.com'), 'user@xn--exmple-cua.com');
    });

    it('handles already punycoded domains', () => {
      assert.equal(normalizeEmail('user@xn--exmple-cua.com'), 'user@xn--exmple-cua.com');
    });

    it('handles mixed case Unicode emails', () => {
      assert.equal(normalizeEmail('USER@ExÄmple.COM'), 'user@xn--exmple-cua.com');
    });

    it('handles invalid input gracefully', () => {
      assert.equal(normalizeEmail(''), '');
      assert.equal(normalizeEmail(null as any), null);
      assert.equal(normalizeEmail(undefined as any), undefined);
    });
  });

  describe('emailsMatch', () => {
    it('matches identical emails', () => {
      assert.isTrue(emailsMatch('user@example.com', 'user@example.com'));
    });

    it('matches emails with different case', () => {
      assert.isTrue(emailsMatch('USER@EXAMPLE.COM', 'user@example.com'));
    });

    it('does not match ASCII and Unicode domains that look similar', () => {
      assert.isFalse(emailsMatch('user@example.com', 'user@exämple.com'));
    });

    it('matches emails with same Unicode domain', () => {
      assert.isTrue(emailsMatch('user@exämple.com', 'user@exämple.com'));
    });

    it('matches emails with same punycode domain', () => {
      assert.isTrue(emailsMatch('user@xn--exmple-cua.com', 'user@xn--exmple-cua.com'));
    });

    it('matches Unicode and punycode representations of same domain', () => {
      assert.isTrue(emailsMatch('user@exämple.com', 'user@xn--exmple-cua.com'));
    });
  });

  describe('isEmailValid', () => {
    it('returns true for valid emails', () => {
      assert.isTrue(isEmailValid('user@example.com'));
      assert.isTrue(isEmailValid('a+b@test.co.uk'));
      assert.isTrue(isEmailValid('user.name@example.com'));
    });

    it('returns false for emails without local part', () => {
      assert.isFalse(isEmailValid('@example.com'));
    });

    it('returns false for emails without domain', () => {
      assert.isFalse(isEmailValid('user@'));
    });

    it('returns false for single-part domains', () => {
      assert.isFalse(isEmailValid('user@example'));
    });

    it('returns false for emails over 256 characters', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      assert.isFalse(isEmailValid(longEmail));
    });

    it('returns false for invalid characters', () => {
      assert.isFalse(isEmailValid('user\n@example.com'));
      assert.isFalse(isEmailValid('user @example.com'));
    });
  });

  describe('isEmailMask', () => {
    it('returns true for mozmail.com addresses', () => {
      assert.isTrue(isEmailMask('user@mozmail.com'));
      assert.isTrue(isEmailMask('user@subdomain.mozmail.com'));
    });

    it('returns true for relay.firefox.com addresses', () => {
      assert.isTrue(isEmailMask('user@relay.firefox.com'));
    });

    it('returns false for regular email addresses', () => {
      assert.isFalse(isEmailMask('user@example.com'));
      assert.isFalse(isEmailMask('user@gmail.com'));
    });
  });

  describe('IDN Homograph Attack Prevention', () => {
    const ASCII_EMAIL = 'user@example.com';
    const UNICODE_EMAIL = 'user@exämple.com';
    const PUNYCODE_EMAIL = 'user@xn--exmple-cua.com';

    it('prevents ASCII vs Unicode domain confusion', () => {
      assert.notEqual(normalizeEmail(ASCII_EMAIL), normalizeEmail(UNICODE_EMAIL));
      assert.isFalse(emailsMatch(ASCII_EMAIL, UNICODE_EMAIL));
    });

    it('prevents ASCII vs punycode domain confusion', () => {
      assert.notEqual(normalizeEmail(ASCII_EMAIL), normalizeEmail(PUNYCODE_EMAIL));
      assert.isFalse(emailsMatch(ASCII_EMAIL, PUNYCODE_EMAIL));
    });

    it('allows legitimate Unicode emails', () => {
      const legitimate = 'user@münchen.de';
      assert.isTrue(emailsMatch(legitimate, legitimate));
    });

    it('prevents bidirectional homograph attacks', () => {
      const testCases = [
        { ascii: 'user@example.com', unicode: 'user@еxample.com' },
        { ascii: 'user@google.com', unicode: 'user@gооgle.com' },
        { ascii: 'user@microsoft.com', unicode: 'user@micrоsoft.com' },
      ];

      testCases.forEach(({ ascii, unicode }) => {
        assert.notEqual(normalizeEmail(ascii), normalizeEmail(unicode));
        assert.isFalse(emailsMatch(ascii, unicode));
      });
    });
  });
});
