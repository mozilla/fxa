/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import Backbone from 'backbone';
import Cocktail from 'cocktail';
import UrlMixin from 'models/mixins/url';
import Url from 'lib/url';
import Vat from 'vat';
import WindowMock from '../../../mocks/window';

describe('models/mixins/url', () => {
  let windowMock;
  let model;

  const Model = Backbone.Model.extend({
    initialize(options) {
      this.window = options.window;
    },
  });

  Cocktail.mixin(Model, UrlMixin);

  beforeEach(() => {
    windowMock = new WindowMock();
    model = new Model({ window: windowMock });
  });

  describe('getSearchParam', () => {
    it('returns the value of a search parameter, if available', () => {
      windowMock.location.search = Url.objToSearchString({
        searchParam: 'value',
      });
      assert.equal(model.getSearchParam('searchParam'), 'value');
      assert.isUndefined(model.getSearchParam('notAvailable'));
    });
  });

  describe('importSearchParamsUsingSchema', () => {
    const schema = {
      optional: Vat.string().optional(),
      required: Vat.string().valid('value').required(),
    };

    describe('passes validation', () => {
      beforeEach(() => {
        windowMock.location.search = Url.objToSearchString({
          ignored: true,
          required: 'value',
        });
        model.importSearchParamsUsingSchema(schema, AuthErrors);
      });

      it('imports fields in the schema that have values', () => {
        assert.equal(model.get('required'), 'value');
      });

      it('does not import optional fields in the schema w/o values', () => {
        assert.isFalse(model.has('optional'));
      });

      it('ignores fields not in the schema', () => {
        assert.isFalse(model.has('ignored'));
      });
    });

    describe('does not pass validation', () => {
      let err;

      describe('missing data', () => {
        beforeEach(() => {
          windowMock.location.search = Url.objToSearchString({});
          try {
            model.importSearchParamsUsingSchema(schema, AuthErrors);
          } catch (e) {
            err = e;
          }
        });

        it('throws a MISSING_PARAMETER error', () => {
          assert.isTrue(AuthErrors.is(err, 'MISSING_PARAMETER'));
          assert.equal(err.param, 'required');
        });
      });

      describe('invalid data', () => {
        beforeEach(() => {
          windowMock.location.search = Url.objToSearchString({
            required: 'invalid',
          });

          try {
            model.importSearchParamsUsingSchema(schema, AuthErrors);
          } catch (e) {
            err = e;
          }
        });

        it('throws a INVALID_PARAMETER', () => {
          assert.isTrue(AuthErrors.is(err, 'INVALID_PARAMETER'));
          assert.equal(err.param, 'required');
        });
      });
    });
  });

  describe('importHashParamsUsingSchema', () => {
    const schema = {
      optional: Vat.string().optional(),
      required: Vat.string().valid('value').required(),
    };

    describe('passes validation', () => {
      beforeEach(() => {
        windowMock.location.hash = Url.objToHashString({
          ignored: true,
          required: 'value',
        });
        model.importHashParamsUsingSchema(schema, AuthErrors);
      });

      it('imports fields in the schema that have values', () => {
        assert.equal(model.get('required'), 'value');
      });

      it('does not import optional fields in the schema w/o values', () => {
        assert.isFalse(model.has('optional'));
      });

      it('ignores fields not in the schema', () => {
        assert.isFalse(model.has('ignored'));
      });
    });

    describe('does not pass validation', () => {
      let err;

      describe('missing data', () => {
        beforeEach(() => {
          windowMock.location.hash = Url.objToHashString({});
          try {
            model.importHashParamsUsingSchema(schema, AuthErrors);
          } catch (e) {
            err = e;
          }
        });

        it('throws a MISSING_PARAMETER error', () => {
          assert.isTrue(AuthErrors.is(err, 'MISSING_PARAMETER'));
          assert.equal(err.param, 'required');
        });
      });

      describe('invalid data', () => {
        beforeEach(() => {
          windowMock.location.hash = Url.objToHashString({
            required: 'invalid',
          });

          try {
            model.importHashParamsUsingSchema(schema, AuthErrors);
          } catch (e) {
            err = e;
          }
        });

        it('throws a INVALID_PARAMETER', () => {
          assert.isTrue(AuthErrors.is(err, 'INVALID_PARAMETER'));
          assert.equal(err.param, 'required');
        });
      });
    });
  });

  describe('importFromObjectUsingSchema', () => {
    const schema = {
      optional: Vat.string().optional(),
      required: Vat.string().valid('value').required(),
    };

    describe('passes validation', () => {
      beforeEach(() => {
        model.importFromObjectUsingSchema(
          { ignored: true, required: 'value' },
          schema,
          AuthErrors
        );
      });

      it('imports fields in the schema that have values', () => {
        assert.equal(model.get('required'), 'value');
      });

      it('does not import optional fields in the schema w/o values', () => {
        assert.isFalse(model.has('optional'));
      });

      it('ignores fields not in the schema', () => {
        assert.isFalse(model.has('ignored'));
      });
    });

    describe('does not pass validation', () => {
      let err;

      describe('missing data', () => {
        beforeEach(() => {
          try {
            model.importFromObjectUsingSchema({}, schema, AuthErrors);
          } catch (e) {
            err = e;
          }
        });

        it('throws a MISSING_PARAMETER error', () => {
          assert.isTrue(AuthErrors.is(err, 'MISSING_PARAMETER'));
          assert.equal(err.param, 'required');
        });
      });

      describe('invalid data', () => {
        beforeEach(() => {
          try {
            model.importFromObjectUsingSchema(
              {
                required: 'invalid',
              },
              schema,
              AuthErrors
            );
          } catch (e) {
            err = e;
          }
        });

        it('throws a INVALID_PARAMETER', () => {
          assert.isTrue(AuthErrors.is(err, 'INVALID_PARAMETER'));
          assert.equal(err.param, 'required');
        });
      });
    });
  });
});
