/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var AuthErrors = require('lib/auth-errors');
  var Backbone = require('backbone');
  var chai = require('chai');
  var Cocktail = require('cocktail');
  var SearchParamMixin = require('models/mixins/search-param');
  var TestHelpers = require('../../../lib/helpers');
  var WindowMock = require('../../../mocks/window');

  var assert = chai.assert;

  describe('models/mixins/search-param', function () {
    var windowMock;
    var model;

    var Model = Backbone.Model.extend({
      initialize: function (options) {
        this.window = options.window;
      }
    });

    Cocktail.mixin(
      Model,
      SearchParamMixin
    );

    beforeEach(function () {
      windowMock = new WindowMock();
      model = new Model({ window: windowMock });
    });

    describe('getSearchParam', function () {
      it('returns the value of a search parameter, if available', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          searchParam: 'value'
        });
        assert.equal(model.getSearchParam('searchParam'), 'value');
        assert.isUndefined(model.getSearchParam('notAvailable'));
      });
    });

    describe('importSearchParam', function () {
      it('imports the value of a search parameter, onto the model', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          searchParam: 'value'
        });

        model.importSearchParam('searchParam');
        assert.equal(model.get('searchParam'), 'value');

        model.importSearchParam('notAvailable');
        assert.isUndefined(model.get('notAvailable'));
      });
    });

    describe('importBooleanSearchParam', function () {
      var err;

      function importExpectFailure(searchParams, sourceName, destName) {
        windowMock.location.search = TestHelpers.toSearchString(searchParams);
        try {
          model.importBooleanSearchParam(sourceName, destName, AuthErrors);
        } catch (e) {
          err = e;
        }
      }

      it('sets value to the boolean `true` if search param is `true`', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          expectBoolean: true
        });

        model.importBooleanSearchParam('expectBoolean');
        assert.isTrue(model.get('expectBoolean'));
      });

      it('sets value to the boolean `false` if search param is `false`', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          expectBoolean: false
        });

        model.importBooleanSearchParam('expectBoolean');
        assert.isFalse(model.get('expectBoolean'));
      });

      describe('value is not boolean', function () {
        beforeEach(function () {
          importExpectFailure({ expectBoolean: 'not a boolean' }, 'expectBoolean');
        });

        it('errors correctly', function () {
          assert.isTrue(AuthErrors.is(err, 'INVALID_PARAMETER'));
        });
      });

      describe('value is empty', function () {
        beforeEach(function () {
          importExpectFailure({ expectBoolean: '' }, 'expectBoolean');
        });

        it('errors correctly', function () {
          assert.isTrue(AuthErrors.is(err, 'INVALID_PARAMETER'));
        });
      });

      describe('value is a space', function () {
        beforeEach(function () {
          importExpectFailure({ expectBoolean: ' ' }, 'expectBoolean');
        });

        it('errors correctly', function () {
          assert.isTrue(AuthErrors.is(err, 'INVALID_PARAMETER'));
        });
      });
    });

    describe('importRequiredSearchParam', function () {
      var err;

      function importExpectFailure(searchParams, sourceName, destName) {
        windowMock.location.search = TestHelpers.toSearchString(searchParams);
        try {
          model.importRequiredSearchParam(sourceName, destName, AuthErrors);
        } catch (e) {
          err = e;
        }
      }

      describe('missing', function () {
        beforeEach(function () {
          importExpectFailure({}, 'searchParam');
        });

        it('errors correctly', function () {
          assert.isTrue(AuthErrors.is(err, 'MISSING_PARAMETER'));
          assert.equal(err.param, 'searchParam');
        });
      });

      describe('empty', function () {
        beforeEach(function () {
          importExpectFailure({searchParam: ''}, 'searchParam');
        });

        it('errors correctly', function () {
          assert.isTrue(AuthErrors.is(err, 'MISSING_PARAMETER'));
          assert.equal(err.param, 'searchParam');
        });
      });

      describe('space', function () {
        beforeEach(function () {
          importExpectFailure({searchParam: ' '}, 'searchParam');
        });

        it('errors correctly', function () {
          assert.isTrue(AuthErrors.is(err, 'MISSING_PARAMETER'));
          assert.equal(err.param, 'searchParam');
        });
      });

      describe('available', function () {
        describe('without destName', function () {
          beforeEach(function () {
            windowMock.location.search = TestHelpers.toSearchString({ searchParam: 'value'});
            model.importRequiredSearchParam('searchParam', 'searchParam', AuthErrors);
          });

          it('imports the value', function () {
            assert.equal(model.get('searchParam'), 'value');
          });
        });

        describe('with destName', function () {
          beforeEach(function () {
            windowMock.location.search = TestHelpers.toSearchString({ searchParam: 'value'});
            model.importRequiredSearchParam('searchParam', 'key2', AuthErrors);
          });

          it('does not import to `sourceName`', function () {
            assert.isFalse(model.has('searchParam'));
          });

          it('imports the value to `destName`', function () {
            assert.equal(model.get('key2'), 'value');
          });
        });
      });
    });
  });
});


