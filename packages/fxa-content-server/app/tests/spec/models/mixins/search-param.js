/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import Backbone from 'backbone';
import Cocktail from 'cocktail';
import SearchParamMixin from 'models/mixins/search-param';
import TestHelpers from '../../../lib/helpers';
import Vat from 'vat';
import WindowMock from '../../../mocks/window';

describe('models/mixins/search-param', function () {
  var windowMock;
  var model;

  var Model = Backbone.Model.extend({
    initialize (options) {
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

  describe('importSearchParamsUsingSchema', function () {
    var schema = {
      optional: Vat.string().optional(),
      required: Vat.string().valid('value').required()
    };

    describe('passes validation', function () {
      beforeEach(function () {
        windowMock.location.search =
            TestHelpers.toSearchString({ ignored: true, required: 'value' });
        model.importSearchParamsUsingSchema(schema, AuthErrors);
      });

      it('imports fields in the schema that have values', function () {
        assert.equal(model.get('required'), 'value');
      });

      it('does not import optional fields in the schema w/o values', function () {
        assert.isFalse(model.has('optional'));
      });

      it('ignores fields not in the schema', function () {
        assert.isFalse(model.has('ignored'));
      });
    });

    describe('does not pass validation', function () {
      var err;

      describe('missing data', function () {
        beforeEach(function () {
          windowMock.location.search = TestHelpers.toSearchString({});
          try {
            model.importSearchParamsUsingSchema(schema, AuthErrors);
          } catch (e) {
            err = e;
          }
        });

        it('throws a MISSING_PARAMETER error', function () {
          assert.isTrue(AuthErrors.is(err, 'MISSING_PARAMETER'));
          assert.equal(err.param, 'required');
        });
      });

      describe('invalid data', function () {
        beforeEach(function () {
          windowMock.location.search = TestHelpers.toSearchString({
            required: 'invalid'
          });

          try {
            model.importSearchParamsUsingSchema(schema, AuthErrors);
          } catch (e) {
            err = e;
          }
        });

        it('throws a INVALID_PARAMETER', function () {
          assert.isTrue(AuthErrors.is(err, 'INVALID_PARAMETER'));
          assert.equal(err.param, 'required');
        });
      });
    });
  });
});
