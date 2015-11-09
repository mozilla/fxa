/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

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

      it('throws if value is neither `true` nor `false`', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          expectBoolean: 'not a boolean'
        });

        assert.throws(function () {
          model.importBooleanSearchParam('expectBoolean');
        }, 'expectBoolean must be `true` or `false`');
      });
    });
  });
});


