/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import BaseRelier from 'models/reliers/base';
import chai from 'chai';

var assert = chai.assert;

describe('models/reliers/base', function() {
  var relier;

  beforeEach(function() {
    relier = new BaseRelier();
  });

  describe('fetch', function() {
    it('returns a promise', function() {
      return relier.fetch().then(assert.pass);
    });
  });

  describe('isOAuth', function() {
    it('returns `false`', function() {
      assert.isFalse(relier.isOAuth());
    });
  });

  describe('isSync', function() {
    it('returns `false`', function() {
      assert.isFalse(relier.isSync());
    });
  });

  describe('wantsKeys', function() {
    it('returns `false`', function() {
      assert.isFalse(relier.wantsKeys());
    });
  });

  describe('isCustomizeSyncChecked', function() {
    it('returns `false`', function() {
      assert.isFalse(relier.isCustomizeSyncChecked());
    });
  });

  describe('pickResumeTokenInfo', function() {
    it('returns an empty object by default', function() {
      assert.deepEqual(relier.pickResumeTokenInfo(), {});
    });
  });

  describe('isTrusted', function() {
    it('returns `true`', function() {
      assert.isTrue(relier.isTrusted());
    });
  });

  describe('accountNeedsPermissions', function() {
    it('returns `false`', function() {
      assert.isFalse(relier.accountNeedsPermissions());
    });
  });
});
