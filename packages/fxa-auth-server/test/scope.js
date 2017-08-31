/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*global describe,it*/

const assert = require('insist');

const Scope = require('../lib/scope');

describe('Scope', function() {

  describe('constructor', function() {

    it('should accept a space-separated string', function() {
      var s1 = Scope('a b  c');
      assert.deepEqual(s1.values(), ['a', 'b', 'c']);
    });

    it('should accept an array', function() {
      var s1 = Scope(['a', 'b', 'c']);
      assert.deepEqual(s1.values(), ['a', 'b', 'c']);
    });

    it('should accept a Scope instance', function() {
      var s1 = Scope(['a', 'b', 'c']);
      var s2 = Scope(s1);
      assert.equal(s1, s2);
    });

  });

  describe('has', function() {

    it('should work with a single value', function() {
      var s1 = Scope('foo bar');
      assert(s1.has('foo'));
      assert(s1.has('bar'));
      assert(! s1.has('baz'));
    });

    it('should work with another Scope object', function() {
      var s1 = Scope('foo bar');
      var s2 = Scope('bar');
      assert(s1.has(s2));
      assert(! s2.has(s1));
    });

    it('should allow sub-scopes', function() {
      var s1 = Scope('foo bar:baz');
      assert(s1.has('foo:dee'));
      assert(s1.has('bar:baz'));
      assert(s1.has('foo:mah:pa bar:baz:quux'));
      assert(! s1.has('bar'));

      assert(! s1.has('foo:write'));
      assert(! s1.has('foo:dee:write'));

      var s2 = Scope('foo bar baz:quux:write');
      assert(s2.has('foo bar baz:quux'));

      assert(! s2.has('baz:write'));
      assert(! s2.has('foo bar baz'));

      var s3 = Scope('foo:write');
      assert(s3.has('foo:bar'));
      assert(s3.has('foo:bar:write'));

      assert(! s3.has('foo::write'));
      assert(! s3.has('foo:write:::'));

    });

  });

});
