/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import chai from 'chai';
import SameBrowserVerificationModel from 'models/verification/same-browser';
import sinon from 'sinon';
import Storage from 'lib/storage';

var assert = chai.assert;

describe('models/verification/same-browser', function() {
  describe('_getUsersStorageId', function() {
    var model;

    describe('with a model that has a `uid', function() {
      beforeEach(function() {
        model = new SameBrowserVerificationModel(
          {},
          {
            code: 'a-code',
            namespace: 'context',
            uid: 'a-uid',
          }
        );
      });

      it('returns the `uid`', function() {
        assert.equal(model._getUsersStorageId(), 'a-uid');
      });
    });

    describe('with a model that has an `email`', function() {
      beforeEach(function() {
        model = new SameBrowserVerificationModel(
          {},
          {
            code: 'a-code',
            email: 'testuser@testuser.com',
            namespace: 'context',
          }
        );
      });

      it('returns the `email`', function() {
        assert.equal(model._getUsersStorageId(), 'testuser@testuser.com');
      });
    });
  });

  describe('model persistence', function() {
    var model;
    var storage;

    beforeEach(function() {
      storage = new Storage();

      model = new SameBrowserVerificationModel(
        {
          context: 'fx_desktop_v3',
        },
        {
          code: 'a-code',
          namespace: 'context',
          storage: storage,
          uid: 'a-uid',
        }
      );

      sinon.spy(storage, 'get');
      sinon.spy(storage, 'set');
    });

    describe('persist', function() {
      beforeEach(function() {
        model.persist();
      });

      it('persists the verification info to loca lStorage', function() {
        assert.isTrue(storage.set.calledWith(model._STORAGE_KEY));
      });
    });

    describe('clear', function() {
      beforeEach(function() {
        model.persist();
        model.unset('context');
        model.clear();
        model.load();
      });

      it('clears the verification info for the user/context combination from localStorage', function() {
        assert.isTrue(storage.get.calledWith(model._STORAGE_KEY));
        assert.isTrue(storage.set.calledWith(model._STORAGE_KEY));
      });

      it('does not reload erased data', function() {
        assert.isFalse(model.has('context'));
      });
    });
  });

  describe('persist/load', function() {
    let storage;

    this.beforeEach(() => {
      storage = new Storage();
    });

    it('signup, stores and loads verification keyed by uid', function() {
      const persistModel = new SameBrowserVerificationModel(
        {
          context: 'fx_desktop_v3',
        },
        {
          namespace: 'context',
          storage: storage,
          uid: 'a-uid',
        }
      );

      persistModel.persist();

      const loadModel = new SameBrowserVerificationModel(
        {},
        {
          namespace: 'context',
          storage: storage,
          uid: 'a-uid',
        }
      );

      loadModel.load();

      assert.equal(loadModel.get('context'), 'fx_desktop_v3');
    });

    it('password reset, stores and loads verification keyed by email (pre-train-117)', function() {
      const persistModel = new SameBrowserVerificationModel(
        {
          context: 'fx_desktop_v3',
        },
        {
          email: 'testuser@testuser.com',
          namespace: 'context',
          storage: storage,
        }
      );

      persistModel.persist();

      const loadModel = new SameBrowserVerificationModel(
        {},
        {
          email: 'testuser@testuser.com',
          namespace: 'context',
          storage: storage,
        }
      );

      loadModel.load();
      assert.equal(loadModel.get('context'), 'fx_desktop_v3');
    });

    it('password reset, stores and loads verification keyed by email, both uid and email specified in load (>= train-117)', function() {
      const persistModel = new SameBrowserVerificationModel(
        {
          context: 'fx_desktop_v3',
        },
        {
          email: 'testuser@testuser.com',
          namespace: 'context',
          storage: storage,
        }
      );

      persistModel.persist();

      const loadModel = new SameBrowserVerificationModel(
        {},
        {
          email: 'testuser@testuser.com',
          namespace: 'context',
          storage: storage,
          uid: 'a-uid',
        }
      );

      loadModel.load();
      assert.equal(loadModel.get('context'), 'fx_desktop_v3');
    });
  });
});
