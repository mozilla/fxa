/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'sinon',
  'views/mixins/migration-mixin',
], function (chai, sinon, MigrationMixin) {
  'use strict';

  var assert = chai.assert;

  describe('views/mixins/migration-mixin', function () {
    it('exports correct interface', function () {
      assert.lengthOf(Object.keys(MigrationMixin), 1);
      assert.isFunction(MigrationMixin.isMigration);
    });

    describe('call isMigration', function () {
      var relier, result;

      beforeEach(function () {
        relier = {
          has: sinon.spy(function () {
            return 'foo';
          })
        };
        result = MigrationMixin.isMigration.call({ relier: relier });
      });

      it('calls this.relier.has correctly', function () {
        assert.equal(relier.has.callCount, 1);

        var args = relier.has.getCall(0).args;
        assert.lengthOf(args, 1);
        assert.equal(args[0], 'migration');
      });

      it('returns this.relier.has result', function () {
        assert.equal(result, 'foo');
      });
    });
  });
});

