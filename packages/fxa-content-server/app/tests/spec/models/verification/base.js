/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import BaseModel from 'models/verification/base';
import chai from 'chai';

var assert = chai.assert;

var Model = BaseModel.extend({
  defaults: {
    code: null,
    uid: null,
  },

  validate(attributes) {
    if (attributes.uid === null || attributes.code === null) {
      throw new Error('invalid');
    }
  },
});

describe('models/verification/base', function() {
  describe('initialization cleanup', function() {
    it('removes whitespace in values', function() {
      var model = new Model({
        code: ' fad fade',
        uid: 'dead beef ',
      });

      assert.equal(model.get('uid'), 'deadbeef');
      assert.equal(model.get('code'), 'fadfade');
    });

    it('removes empty values', function() {
      var model = new Model({
        code: '',
        uid: '  ',
      });

      assert.isFalse(model.has('uid'));
      assert.isFalse(model.has('code'));
    });
  });

  describe('isValid', function() {
    it('returns false if model is marked as damaged', function() {
      var model = new Model({
        code: 'a-code',
        uid: 'a-uid',
      });
      model.markDamaged();
      assert.isFalse(model.isValid());
    });

    it('returns false if `validate` explodes', function() {
      var model = new Model({
        code: null,
        uid: 'a-uid',
      });
      assert.isFalse(model.isValid());
    });

    it('returns true otherwise', function() {
      var model = new Model({
        code: 'a-code',
        uid: 'a-uid',
      });
      assert.isTrue(model.isValid());
    });
  });

  describe('markExpired/isExpired', function() {
    it('marks the link as expired', function() {
      var model = new Model({
        code: 'a-code',
        uid: 'a-uid',
      });

      assert.isFalse(model.isExpired());
      model.markExpired();
      assert.isTrue(model.isExpired());
    });
  });

  describe('markUsed/isUsed', function() {
    it('marks the link as used', function() {
      var model = new Model({
        code: 'a-code',
        uid: 'a-uid',
      });

      assert.isFalse(model.isUsed());
      model.markUsed();
      assert.isTrue(model.isUsed());
    });
  });

  describe('markDamaged/isDamaged', function() {
    it('marks the link as damaged', function() {
      var model = new Model({
        code: 'a-code',
        uid: 'a-uid',
      });

      assert.isFalse(model.isDamaged());
      model.markDamaged();
      assert.isTrue(model.isDamaged());
    });
  });
});
