/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');

describe('oauth/scopes:', () => {
  let scopes;

  before(() => {
    scopes = require('../../oauth/scopes');
  });

  describe('valid implications', () => {
    const VALID_IMPLICATIONS = [
      // [A, B] => "A contains B"
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
    ];

    VALID_IMPLICATIONS.forEach(([source, target]) => {
      it(`scope "${source}" contains scope "${target}"`, () => {
        source = scopes.fromString(source);
        target = scopes.fromString(target);
        assert.isTrue(source.contains(target));
      });
    });
  });

  describe('invalid implications', () => {
    // [A, B] => "A does not contain B"
    const INVALID_IMPLICATIONS = [
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
    ];

    INVALID_IMPLICATIONS.forEach(([source, target]) => {
      it(`scope "${source}" does not contain scope "${target}"`, () => {
        source = scopes.fromString(source);
        target = scopes.fromString(target);
        assert.isFalse(source.contains(target));
      });
    });
  });

  describe('invalid scope values', () => {
    const INVALID_SCOPE_VALUES = [
      'profile:email!:write',
      ':',
      '::',
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

    INVALID_SCOPE_VALUES.forEach((source) => {
      it(`scope "${source}" is invalid`, () => {
        assert.throws(
          () => scopes.fromString(source),
          Error,
          /^Invalid scope value/
        );
      });
    });

    INVALID_SCOPE_VALUES.forEach((source) => {
      source = encodeURIComponent(source);
      it(`url-encoded scope "${source}" is invalid`, () => {
        assert.throws(
          () => scopes.fromURLEncodedString(source),
          Error,
          /^Invalid scope value/
        );
      });
    });

    const INVALID_SCOPE_VALUES_WHEN_URIENCODED = [
      'profile profile:email:write',
      'profile%20profile:email:write',
      'profile+profile::email',
      'profile+profile:%3Aemail',
      encodeURIComponent('http://identity.mozilla.com/apps/oldsync#read+write'),
    ];

    INVALID_SCOPE_VALUES_WHEN_URIENCODED.forEach((source) => {
      it(`url-encoded scope "${source}" is invalid`, () => {
        assert.throws(
          () => scopes.fromURLEncodedString(source),
          Error,
          /^Invalid scope value/
        );
      });
    });
  });

  describe('scope filtering', () => {
    // [A, B, C] => "A filtered by B gives C"
    const FILTERED_RESULTS = [
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
    ];

    FILTERED_RESULTS.forEach(([s1, s2, result]) => {
      it(`scope "${s1}" filtered by "${s2}" gives correct result`, () => {
        s1 = scopes.fromString(s1);
        s2 = scopes.fromString(s2);
        assert.deepEqual(s1.filtered(s2).toString(), result);
      });
    });
  });

  describe('scope intersection', () => {
    // [A, B] => "A intersects with B"
    const VALID_INTERSECTIONS = [
      ['profile', 'profile'],
      ['profile', 'profile:write'],
      ['profile', 'profile:email', ''],
      ['profile:write', 'profile'],
      ['profile', 'profile:email'],
      ['profile basket', 'profile'],
      ['profile basket', 'profile oauth'],
      ['profile basket', 'basket'],
      ['profile basket', 'basket:write'],
      ['profile:write basket', 'profile:write'],
    ];

    VALID_INTERSECTIONS.forEach(([s1, s2]) => {
      it(`scope "${s1}" intersects with "${s2}"`, () => {
        s1 = scopes.fromString(s1);
        s2 = scopes.fromString(s2);
        assert.ok(s1.intersects(s2));
      });
    });

    // [A, B] => "A does not intersect with B"
    const INVALID_INTERSECTIONS = [
      ['profile', 'basket'],
      ['profile oauth', 'basket'],
    ];

    INVALID_INTERSECTIONS.forEach(([s1, s2]) => {
      it(`scope "${s1}" does not intersect with "${s2}"`, () => {
        s1 = scopes.fromString(s1);
        s2 = scopes.fromString(s2);
        assert.ok(!s1.intersects(s2));
      });
    });
  });

  describe('scope implicant expansion', () => {
    // [A, B] => "A has implicants B"
    const IMPLICANT_RESULTS = [
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
    ];

    IMPLICANT_RESULTS.forEach(([source, result]) => {
      it(`scope "${source}" has correct set of implicants`, () => {
        source = scopes.fromString(source);
        assert.deepEqual(source.getImplicantValues().join(' '), result);
      });
    });
  });

  describe('scope union', () => {
    // [A, B, C] => "A.union(B) is C"
    const UNION_RESULTS = [
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
    ];

    UNION_RESULTS.forEach(([s1, s2, result]) => {
      it(`scopes "${s1}" and "${s2}" union correctly`, () => {
        s1 = scopes.fromString(s1);
        s2 = scopes.fromString(s2);
        assert.deepEqual(s1.union(s2).toString(), result);
      });
    });
  });

  describe('scope difference', () => {
    // [A, B, C] => "A.difference(B) is C"
    const DIFFERENCE_RESULTS = [
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
    ];

    DIFFERENCE_RESULTS.forEach(([s1, s2, result]) => {
      it(`scopes "${s1}" and "${s2}" difference correctly`, () => {
        s1 = scopes.fromString(s1);
        s2 = scopes.fromString(s2);
        assert.deepEqual(s1.difference(s2).toString(), result);
      });
    });
  });

  describe('emptiness checking', () => {
    it('empty string scope is, in fact, empty', () => {
      assert.ok(scopes.fromString('').isEmpty());
    });

    it('non-empty string scope is, in fact, non-empty', () => {
      assert.ok(!scopes.fromString('profile').isEmpty());
    });
  });

  describe('in-place add', () => {
    it('correctly aggregates scopes over multiple calls to .add()', () => {
      const s = scopes.fromString('one');
      assert.deepEqual(s.toString(), 'one');
      s.add('two:too');
      assert.deepEqual(s.toString(), 'one two:too');
      s.add(['one', 'three']);
      assert.deepEqual(s.toString(), 'one two:too three');
      s.add(['one', 'two:too:write']);
      assert.deepEqual(s.toString(), 'one three two:too:write');
      s.add(['three', 'two']);
      assert.deepEqual(s.toString(), 'one three two:too:write two');
      s.add(['three:write', 'two:write']);
      assert.deepEqual(s.toString(), 'one three:write two:write');
    });
  });
});
