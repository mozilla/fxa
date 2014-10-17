/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'sinon',
  'lib/storage',
  'lib/null-storage'
],
function (chai, sinon, Storage, NullStorage) {
  var assert = chai.assert;

  describe('lib/storage', function () {
    var storage;
    var nullStorage;

    beforeEach(function () {
      nullStorage = new NullStorage();
      storage = new Storage(nullStorage);
    });
    afterEach(function () {
      storage.clear();
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

      it('can take null values', function () {
        storage.set('key', null);
        assert.isNull(storage.get('key'));
      });

      it('can take falsey values', function () {
        storage.set('key', '');
        assert.equal(storage.get('key'), '');
      });

      it('returns undefined if the backend/parsing fails', function () {
        storage.set('key', 'value');
        sinon.stub(nullStorage, 'getItem', function () {
          return 'not stringified JSON';
        });
        assert.isUndefined(storage.get('key'));
        assert.isTrue(nullStorage.getItem.called);
      });
    });

    describe('remove', function () {
      it('with a key clears item', function () {
        storage.set('key', 'value');
        storage.remove('key');

        assert.isUndefined(storage.get('key'));
      });
    });

    describe('clear', function () {
      it('clears all items', function () {
        storage.set('key', 'value');
        storage.clear();

        assert.isUndefined(storage.get('key'));
      });
    });
  });
});


