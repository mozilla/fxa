/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var chai = require('chai');
  var NullStorage = require('lib/null-storage');
  var sinon = require('sinon');
  var Storage = require('lib/storage');
  var WindowMock = require('../../mocks/window');

  var assert = chai.assert;

  describe('lib/storage', function () {
    var storage;
    var nullStorage;
    var windowMock;

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

    describe('factory', function () {
      beforeEach(function () {
        windowMock = new WindowMock();
      });

      it('creates localStorage instance', function () {
        sinon.stub(windowMock.localStorage, 'setItem', function () { });

        var store = Storage.factory('localStorage', windowMock);
        store.set('foo', 'bar');
        assert.isTrue(windowMock.localStorage.setItem.called);
      });

      it('creates sessionStorage instance', function () {
        sinon.stub(windowMock.sessionStorage, 'setItem', function () { });

        var store = Storage.factory('sessionStorage', windowMock);
        store.set('foo', 'bar');
        assert.isTrue(windowMock.sessionStorage.setItem.called);
      });

      it('creates null storage instance otherwise', function () {
        var store = Storage.factory(null, windowMock);
        store.set('foo', 'bar');

        assert.isTrue(store.isNull());
        assert.equal(store.get('foo'), 'bar');
      });

      it('does not blow up if cookies are disabled', function () {
        var local;
        Object.defineProperty(windowMock, 'localStorage', {
          get: function () {
            throw new Error('The operation is insecure.');
          }
        });

        try {
          local = Storage.factory('localStorage', windowMock);
        } finally {
          assert.isTrue(local.isNull());
        }
      });
    });
  });
});
