/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import chai from 'chai';
import NullStorage from 'lib/null-storage';

var assert = chai.assert;

describe('lib/null-storage', function () {
  var storage;

  beforeEach(function () {
    storage = new NullStorage();
  });

  describe('getItem/setItem', function () {
    it('can take a key value pair', function () {
      storage.setItem('key', 'value');
      assert.equal(storage.getItem('key'), 'value');
    });

    it('can take object values', function () {
      storage.setItem('key', { foo: 'bar' });
      assert.equal(storage.getItem('key').foo, 'bar');
    });

    it('set without a key does nothing', function () {
      assert.isUndefined(storage.setItem());
    });
  });

  describe('get/set', function () {
    it('can take a key value pair', function () {
      storage.set('key', 'value');
      assert.equal(storage.get('key'), 'value');
    });

    it('can take object values', function () {
      storage.set('key', { foo: 'bar' });
      assert.equal(storage.get('key').foo, 'bar');
    });

    it('set without a key does nothing', function () {
      assert.isUndefined(storage.set());
    });
  });

  describe('remove', function () {
    it('with a key clears item', function () {
      storage.setItem('key', 'value');
      storage.removeItem('key');

      assert.isUndefined(storage.getItem('key'));
    });

    it('remove without a key does nothing', function () {
      storage.removeItem();
    });
  });

  describe('clear', function () {
    it('clears all items', function () {
      storage.setItem('key', 'value');
      storage.clear();

      assert.isUndefined(storage.getItem('key'));
    });
  });
});
