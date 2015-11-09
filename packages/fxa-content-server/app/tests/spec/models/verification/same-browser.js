/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var chai = require('chai');
  var SameBrowserVerificationModel = require('models/verification/same-browser');
  var sinon = require('sinon');
  var Storage = require('lib/storage');

  var assert = chai.assert;

  describe('models/verification/same-browser', function () {
    describe('_getUsersStorageId', function () {
      var model;

      describe('with a model that has a `uid', function () {
        beforeEach(function () {
          model = new SameBrowserVerificationModel({}, {
            code: 'a-code',
            namespace: 'context',
            uid: 'a-uid'
          });
        });

        it('returns the `uid`', function () {
          assert.equal(model._getUsersStorageId(), 'a-uid');
        });
      });

      describe('with a model that has an `email`', function () {
        beforeEach(function () {
          model = new SameBrowserVerificationModel({}, {
            code: 'a-code',
            email: 'testuser@testuser.com',
            namespace: 'context'
          });
        });

        it('returns the `email`', function () {
          assert.equal(model._getUsersStorageId(), 'testuser@testuser.com');
        });
      });
    });

    describe('model persistence', function () {
      var model;
      var storage;

      beforeEach(function () {
        storage = new Storage();

        model = new SameBrowserVerificationModel({
          context: 'fx_desktop_v1'
        }, {
          code: 'a-code',
          namespace: 'context',
          storage: storage,
          uid: 'a-uid',
        });

        sinon.spy(storage, 'get');
        sinon.spy(storage, 'set');
      });

      describe('persist', function () {
        beforeEach(function () {
          model.persist();
        });

        it('persists the verification info to loca lStorage', function () {
          assert.isTrue(storage.set.calledWith(model._STORAGE_KEY));
        });
      });

      describe('load', function () {
        beforeEach(function () {
          model.persist();

          model.unset('context');
          sinon.spy(model, 'set');
          model.load();
        });

        it('loads verification info from localStorage', function () {
          assert.isTrue(storage.get.calledWith(model._STORAGE_KEY));
          assert.equal(model.get('context'), 'fx_desktop_v1');
        });
      });

      describe('clear', function () {
        beforeEach(function () {
          model.persist();
          model.unset('context');
          model.clear();
          model.load();
        });

        it('clears the verification info for the user/context combination from localStorage', function () {
          assert.isTrue(storage.get.calledWith(model._STORAGE_KEY));
          assert.isTrue(storage.set.calledWith(model._STORAGE_KEY));
        });

        it('does not reload erased data', function () {
          assert.isFalse(model.has('context'));
        });
      });
    });
  });
});
