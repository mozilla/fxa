/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { scopeSetHelpers as scopes } from './scopes';

describe('oauth/scopes', () => {
  describe('valid implications', () => {
    // [A, B] => "A contains B"
    it.each([
      ['profile:write', 'profile'],
      ['profile', 'profile:email'],
      ['profile:write', 'profile:email'],
      ['profile:write', 'profile:email:write'],
      ['profile:email:write', 'profile:email'],
      ['profile profile:email:write', 'profile:email'],
      ['profile profile:email:write', 'profile:display_name'],
      ['profile https://identity.mozilla.com/apps/oldsync', 'profile'],
      ['foo bar:baz', 'foo:dee'],
      ['foo bar:baz', 'bar:baz'],
      ['foo bar:baz', 'foo:mah:pa bar:baz:quux'],
      [
        'profile https://identity.mozilla.com/apps/oldsync',
        'https://identity.mozilla.com/apps/oldsync',
      ],
      [
        'https://identity.mozilla.com/apps/oldsync',
        'https://identity.mozilla.com/apps/oldsync#read',
      ],
      [
        'https://identity.mozilla.com/apps/oldsync',
        'https://identity.mozilla.com/apps/oldsync/bookmarks',
      ],
      [
        'https://identity.mozilla.com/apps/oldsync',
        'https://identity.mozilla.com/apps/oldsync/bookmarks#read',
      ],
      [
        'https://identity.mozilla.com/apps/oldsync#read',
        'https://identity.mozilla.com/apps/oldsync/bookmarks#read',
      ],
      [
        'https://identity.mozilla.com/apps/oldsync#read profile',
        'https://identity.mozilla.com/apps/oldsync/bookmarks#read',
      ],
    ])('scope "%s" contains scope "%s"', (source, target) => {
      expect(
        scopes.fromString(source).contains(scopes.fromString(target))
      ).toBe(true);
    });
  });

  describe('invalid implications', () => {
    // [A, B] => "A does not contain B"
    it.each([
      ['profile:email:write', 'profile'],
      ['profile:email:write', 'profile:write'],
      ['profile:email', 'profile:display_name'],
      ['profilebogey', 'profile'],
      ['foo bar:baz', 'bar'],
      ['profile:write', 'https://identity.mozilla.com/apps/oldsync'],
      ['profile profile:email:write', 'profile:write'],
      ['https', 'https://identity.mozilla.com/apps/oldsync'],
      ['https://identity.mozilla.com/apps/oldsync', 'profile'],
      [
        'https://identity.mozilla.com/apps/oldsync#read',
        'https://identity.mozila.com/apps/oldsync/bookmarks',
      ],
      [
        'https://identity.mozilla.com/apps/oldsync#write',
        'https://identity.mozila.com/apps/oldsync/bookmarks#read',
      ],
      [
        'https://identity.mozilla.com/apps/oldsync/bookmarks',
        'https://identity.mozila.com/apps/oldsync',
      ],
      [
        'https://identity.mozilla.com/apps/oldsync/bookmarks',
        'https://identity.mozila.com/apps/oldsync/passwords',
      ],
      [
        'https://identity.mozilla.com/apps/oldsyncer',
        'https://identity.mozila.com/apps/oldsync',
      ],
      [
        'https://identity.mozilla.com/apps/oldsync',
        'https://identity.mozila.com/apps/oldsyncer',
      ],
      [
        'https://identity.mozilla.org/apps/oldsync',
        'https://identity.mozila.com/apps/oldsync',
      ],
    ])('scope "%s" does not contain scope "%s"', (source, target) => {
      expect(
        scopes.fromString(source).contains(scopes.fromString(target))
      ).toBe(false);
    });
  });

  describe('invalid scope values', () => {
    const INVALID_SCOPE_VALUES = [
      'profile:email!:write',
      ':',
      '::',
      'profile+https://identity.mozilla.com/account/subscriptions',
      ':profile',
      'profile::email',
      'profile profile\0:email',
      'http://identity.mozilla.com/apps/oldsync',
      'file:///etc/passwd',
      'https://identity.mozilla.com/apps/oldsync/../notes',
      'https://identity.mozilla.com/apps/oldsync/',
      'https://identity.mozilla.com/apps/oldsync/#write',
      'http://identity.mozilla.com/apps/oldsync#read!',
      'http://identity.mozilla.com/apps/oldsync#read+write',
      'http://identity.mozilla.com/apps/oldsync#read:write',
      'http://identity.mozilla.com/apps/old:sync',
    ];

    // A raw \0 in a test name breaks test result ingestion in CI.
    it.each(INVALID_SCOPE_VALUES.map((s) => [s.replace(/\0/g, '\\0'), s]))(
      'scope "%s" is invalid',
      (_name, source) => {
        expect(() => scopes.fromString(source)).toThrow(/^Invalid scope value/);
      }
    );

    it.each([
      ...INVALID_SCOPE_VALUES.map(encodeURIComponent),
      'profile profile:email:write',
      'profile%20profile:email:write',
      'profile+profile::email',
      'profile+profile:%3Aemail',
      encodeURIComponent('http://identity.mozilla.com/apps/oldsync#read+write'),
    ])('url-encoded scope "%s" is invalid', (source) => {
      expect(() => scopes.fromURLEncodedString(source)).toThrow(
        /^Invalid scope value/
      );
    });

    it('rejects short-name scopes with too many colon components', () => {
      const source = new Array(64).fill('a').join(':');
      expect(() => scopes.fromString(source)).toThrow(/^Invalid scope value/);
    });

    it('accepts short-name scopes at the component-count limit', () => {
      const source = new Array(32).fill('a').join(':');
      expect(() => scopes.fromString(source)).not.toThrow();
    });
  });

  describe('scope filtering', () => {
    // [A, B, C] => "A filtered by B gives C"
    it.each([
      ['profile', 'profile', 'profile'],
      ['profile', 'profile:write', 'profile'],
      ['profile', 'profile:email', ''],
      ['profile basket', 'profile', 'profile'],
      ['basket profile:email', 'profile', 'profile:email'],
      [
        'basket profile:email:write',
        'profile:write basket',
        'basket profile:email:write',
      ],
      [
        'https://identity.mozilla.com/apps/oldsync#read',
        'profile https://identity.mozilla.com/apps/oldsync',
        'https://identity.mozilla.com/apps/oldsync#read',
      ],
      [
        'https://identity.mozilla.com/apps/oldsync/bookmarks#read https://identity.mozilla.com/apps/oldsync/passwords#write',
        'profile https://identity.mozilla.com/apps/oldsync',
        'https://identity.mozilla.com/apps/oldsync/bookmarks#read https://identity.mozilla.com/apps/oldsync/passwords#write',
      ],
      [
        'https://identity.mozilla.com/apps/oldsync/bookmarks#read https://identity.mozilla.com/apps/oldsync/passwords#write',
        'profile https://identity.mozilla.com/apps/oldsync#write',
        'https://identity.mozilla.com/apps/oldsync/passwords#write',
      ],
    ])('scope "%s" filtered by "%s" gives "%s"', (s1, s2, result) => {
      expect(
        scopes.fromString(s1).filtered(scopes.fromString(s2)).toString()
      ).toEqual(result);
    });
  });

  describe('scope intersection', () => {
    // [A, B] => "A intersects with B"
    it.each([
      ['profile', 'profile'],
      ['profile', 'profile:write'],
      ['profile:write', 'profile'],
      ['profile', 'profile:email'],
      ['profile basket', 'profile'],
      ['profile basket', 'profile oauth'],
      ['profile basket', 'basket'],
      ['profile basket', 'basket:write'],
      ['profile:write basket', 'profile:write'],
    ])('scope "%s" intersects with "%s"', (s1, s2) => {
      expect(scopes.fromString(s1).intersects(scopes.fromString(s2))).toBe(
        true
      );
    });

    // [A, B] => "A does not intersect with B"
    it.each([
      ['profile', 'basket'],
      ['profile oauth', 'basket'],
    ])('scope "%s" does not intersect with "%s"', (s1, s2) => {
      expect(scopes.fromString(s1).intersects(scopes.fromString(s2))).toBe(
        false
      );
    });
  });

  describe('scope implicant expansion', () => {
    // [A, B] => "A has implicants B"
    it.each([
      ['profile', 'profile:write profile'],
      ['profile:write', 'profile:write'],
      [
        'profile:email:write profile:amr',
        [
          'profile:email:write',
          'profile:write',
          'profile:amr:write',
          'profile:amr',
          'profile',
        ].join(' '),
      ],
      [
        'profile:email https://identity.mozilla.com/apps/oldsync',
        [
          'profile:email:write',
          'profile:email',
          'profile:write',
          'profile',
          'https://identity.mozilla.com/apps/oldsync',
          'https://identity.mozilla.com/apps',
        ].join(' '),
      ],
      [
        'https://identity.mozilla.com/apps/oldsync/bookmarks#read',
        [
          'https://identity.mozilla.com/apps/oldsync/bookmarks',
          'https://identity.mozilla.com/apps/oldsync/bookmarks#read',
          'https://identity.mozilla.com/apps/oldsync',
          'https://identity.mozilla.com/apps/oldsync#read',
          'https://identity.mozilla.com/apps',
          'https://identity.mozilla.com/apps#read',
        ].join(' '),
      ],
    ])('scope "%s" has implicants "%s"', (source, result) => {
      expect(scopes.fromString(source).getImplicantValues().join(' ')).toEqual(
        result
      );
    });
  });

  describe('scope union', () => {
    // [A, B, C] => "A.union(B) is C"
    it.each([
      ['profile', 'profile:email', 'profile'],
      [
        'profile:write https://identity.mozilla.com/apps/oldsync',
        'profile:write',
        'profile:write https://identity.mozilla.com/apps/oldsync',
      ],
      ['one two three', 'two three four', 'one two three four'],
      [
        'one two:too three:won',
        'two:write three:to four',
        'one three:won two:write three:to four',
      ],
    ])('scopes "%s" and "%s" union to "%s"', (s1, s2, result) => {
      expect(
        scopes.fromString(s1).union(scopes.fromString(s2)).toString()
      ).toEqual(result);
    });
  });

  describe('scope difference', () => {
    // [A, B, C] => "A.difference(B) is C"
    it.each([
      ['profile', 'profile', ''],
      ['profile:email', 'profile', ''],
      ['profile', 'profile:email', 'profile'],
      [
        'profile:email clients:abcd',
        'profile:email profile:display_name clients',
        '',
      ],
      [
        'profile:email profile:display_name clients',
        'profile:email clients:abcd',
        'profile:display_name clients',
      ],
      [
        'profile:email profile:display_name',
        'profile:email',
        'profile:display_name',
      ],
      [
        'profile:write https://identity.mozilla.com/apps/oldsync',
        'profile:write',
        'https://identity.mozilla.com/apps/oldsync',
      ],
      [
        'profile:write https://identity.mozilla.com/apps/oldsync',
        'https://identity.mozilla.com/apps/oldsync',
        'profile:write',
      ],
      ['one two three', 'two three four', 'one'],
    ])('scopes "%s" and "%s" difference to "%s"', (s1, s2, result) => {
      expect(
        scopes.fromString(s1).difference(scopes.fromString(s2)).toString()
      ).toEqual(result);
    });
  });

  describe('emptiness checking', () => {
    it('empty string scope is empty', () => {
      expect(scopes.fromString('').isEmpty()).toBe(true);
    });

    it('non-empty string scope is not empty', () => {
      expect(scopes.fromString('profile').isEmpty()).toBe(false);
    });
  });

  describe('in-place add', () => {
    it('aggregates scopes over multiple calls to .add()', () => {
      const s = scopes.fromString('one');
      expect(s.toString()).toEqual('one');
      s.add('two:too');
      expect(s.toString()).toEqual('one two:too');
      s.add(['one', 'three']);
      expect(s.toString()).toEqual('one two:too three');
      s.add(['one', 'two:too:write']);
      expect(s.toString()).toEqual('one three two:too:write');
      s.add(['three', 'two']);
      expect(s.toString()).toEqual('one three two:too:write two');
      s.add(['three:write', 'two:write']);
      expect(s.toString()).toEqual('one three:write two:write');
    });
  });

  describe('a ScopeSet from a second copy of this module', () => {
    let other!: typeof scopes;
    jest.isolateModules(() => {
      other = require('./scopes').scopeSetHelpers;
    });

    it('comes from a different class', () => {
      expect(other.fromString('profile')).not.toBeInstanceOf(
        scopes.fromString('profile').constructor
      );
    });

    describe.each([
      ['main copy with a second-copy argument', () => [scopes, other]],
      ['second copy with a main-copy argument', () => [other, scopes]],
    ])('%s', (_name, copies) => {
      const [a, b] = copies();

      it('coerce() returns the argument unchanged', () => {
        const arg = b.fromString('profile');
        const iterScopes = jest.spyOn(arg, '_iterScopes');
        a.fromString('basket').add(arg);
        expect(iterScopes.mock.contexts).toEqual([arg]);
      });

      it('add', () => {
        const s = a.fromString('basket');
        s.add(b.fromString('profile'));
        expect(s.toString()).toEqual('basket profile');
      });

      it('contains', () => {
        expect(
          a.fromString('profile').contains(b.fromString('profile:email'))
        ).toBe(true);
      });

      it('intersects', () => {
        expect(
          a.fromString('profile basket').intersects(b.fromString('basket'))
        ).toBe(true);
      });

      it('difference', () => {
        expect(
          a
            .fromString('profile basket')
            .difference(b.fromString('basket'))
            .toString()
        ).toEqual('profile');
      });

      it('filtered', () => {
        expect(
          a
            .fromString('basket profile:email')
            .filtered(b.fromString('profile'))
            .toString()
        ).toEqual('profile:email');
      });

      it('union', () => {
        expect(
          a.fromString('one').union(b.fromString('two')).toString()
        ).toEqual('one two');
      });
    });
  });
});
