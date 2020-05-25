/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import chai from 'chai';
import Session from 'lib/session';

var assert = chai.assert;

describe('lib/session', function () {
  describe('set', function () {
    it('can take a key value pair', function () {
      Session.set('key', 'value');
      assert.equal(Session.key, 'value');
    });

    it('can take an object', function () {
      Session.set({
        key2: 'value2',
        key3: 'value3',
      });

      assert.equal(Session.key2, 'value2');
      assert.equal(Session.key3, 'value3');
    });

    it('will not overwrite items in Session.prototype', function () {
      Session.set('set', 1);
      assert.notEqual(Session.set, 1);
    });
  });

  describe('get', function () {
    it('gets an item', function () {
      Session.set('key', 'value');
      assert.equal(Session.get('key'), 'value');
      assert.isUndefined(Session.get('notSet'));
    });
  });

  describe('clear', function () {
    it('with a key clears item', function () {
      Session.set({
        key4: 'value4',
      });
      Session.clear('key4');

      assert.isUndefined(Session.key4);
    });

    it('with no key clears all items', function () {
      Session.set({
        key5: 'value5',
        key6: 'value6',
      });
      Session.clear();

      assert.isUndefined(Session.key5);
      assert.isUndefined(Session.key6);
    });

    it('will not clear items in Session.prototype', function () {
      Session.clear('set');
      assert.isFunction(Session.set);
    });
  });

  describe('persist', function () {
    it('will persist keys in PERSIST_TO_LOCAL_STORAGE to localStorage', function () {
      Session.set('oauth', 'abc123');

      var localStorageValues = JSON.parse(
        localStorage.getItem('__fxa_session')
      );

      assert.equal(Session.oauth, localStorageValues.oauth);
    });
  });

  describe('load', function () {
    it('loads data from sessionStorage', function () {
      Session.set({
        key7: 'value7',
        key8: 'value8',
      });

      Session.testRemove('key7');
      Session.testRemove('key8');

      assert.isUndefined(Session.key7);
      assert.isUndefined(Session.key8);

      Session.load();
      assert.equal(Session.key7, 'value7');
      assert.equal(Session.key8, 'value8');
    });
  });

  describe('reload', function () {
    it('reloads new, modified, and cleared keys from storage', function () {
      Session.set({
        key10: 'value10',
        key11: 'value11',
        key9: 'value9',
      });

      sessionStorage.setItem(
        '__fxa_session',
        JSON.stringify({
          key10: 'newValue10',
          key11: 'value11',
          key12: 'value12',
        })
      );

      assert.equal(Session.key9, 'value9');
      assert.equal(Session.key10, 'value10');
      assert.equal(Session.key11, 'value11');
      assert.isUndefined(Session.key12);

      Session.reload();

      assert.isUndefined(Session.key9);
      assert.equal(Session.key10, 'newValue10');
      assert.equal(Session.key11, 'value11');
      assert.equal(Session.key12, 'value12');
    });
  });
});
