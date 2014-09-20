/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'lib/session'
],
function (chai, Session) {
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
          key3: 'value3'
        });

        assert.equal(Session.key2, 'value2');
        assert.equal(Session.key3, 'value3');
      });

      it('will not overwrite items in Session.prototype', function() {
        Session.set('set', 1);
        assert.notEqual(Session.set, 1);
      });
    });

    describe('clear', function () {
      it('with a key clears item', function () {
        Session.set({
          key4: 'value4'
        });
        Session.clear('key4');

        assert.isUndefined(Session.key4);
      });

      it('with no key clears all items', function () {
        Session.set({
          key5: 'value5',
          key6: 'value6'
        });
        Session.clear();

        assert.isUndefined(Session.key5);
        assert.isUndefined(Session.key6);
      });

      it('will not clear items in Session.prototype', function() {
        Session.clear('set');
        assert.isFunction(Session.set);
      });

      it('will not clear items in DO_NOT_CLEAR', function() {
        var config = 'config';
        Session.set('config', config);
        Session.clear('config');
        assert.strictEqual(Session.config, config);
      });
    });

    describe('persist', function () {
      it('will persist keys in PERSIST_TO_LOCAL_STORAGE to localStorage', function () {
        Session.set('sessionToken', 'abc123');

        var localStorageValues = JSON.parse(localStorage.getItem('__fxa_session'));

        assert.equal(Session.sessionToken, localStorageValues.sessionToken);
      });
    });

    describe('load', function () {
      it('loads data from sessionStorage', function () {
        Session.set({
          key7: 'value7',
          key8: 'value8'
        });

        Session.testRemove('key7');
        Session.testRemove('key8');

        assert.isUndefined(Session.key7);
        assert.isUndefined(Session.key8);

        Session.load();
        assert.equal(Session.key7, 'value7');
        assert.equal(Session.key8, 'value8');
      });

      it('does not load up items in DO_NOT_PERSIST', function() {
        var prefillPassword = 'password';
        Session.set('prefillPassword', prefillPassword);
        Session.persist();
        Session.clear();
        Session.load();
        assert.isUndefined(Session.prefillPassword);
      });
    });
  });
});


