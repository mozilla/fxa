/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const chai = require('chai');
  const MigrationMixin = require('views/mixins/migration-mixin');
  const sinon = require('sinon');

  var assert = chai.assert;

  describe('views/mixins/migration-mixin', function () {
    it('exports correct interface', function () {
      assert.lengthOf(Object.keys(MigrationMixin), 2);
      assert.isFunction(MigrationMixin.isSyncMigration);
      assert.isFunction(MigrationMixin.isAmoMigration);
    });

    describe('call isSyncMigration', function () {
      var relier, result;

      beforeEach(function () {
        relier = {
          get: sinon.spy(function () {
            return 'sync11';
          }),
          has: sinon.spy(function () {
            return 'foo';
          })
        };
        result = MigrationMixin.isSyncMigration.call({ relier: relier });
      });

      it('calls isSyncMigration correctly', function () {
        assert.equal(relier.get.callCount, 1);
        var args = relier.get.getCall(0).args;
        assert.lengthOf(args, 1);
        assert.equal(args[0], 'migration');
      });

      it('returns this.isSyncMigration result', function () {
        assert.equal(result, true);
      });
    });

    describe('call isAmoMigration', function () {
      var relier, result;

      beforeEach(function () {
        relier = {
          get: sinon.spy(function () {
            return 'amo';
          }),
          has: sinon.spy(function () {
            return 'foo';

          })
        };
        result = MigrationMixin.isAmoMigration.call({ relier: relier });
      });

      it('calls isAmoMigration correctly', function () {
        assert.equal(relier.get.callCount, 1);
        var args = relier.get.getCall(0).args;
        assert.lengthOf(args, 1);
        assert.equal(args[0], 'migration');
      });

      it('returns this.isAmoMigration result', function () {
        assert.equal(result, true);
      });
    });
  });
});

