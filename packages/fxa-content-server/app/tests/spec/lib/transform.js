/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthErrors from 'lib/auth-errors';
import chai from 'chai';
import Transform from 'lib/transform';
import Vat from 'lib/vat';

var assert = chai.assert;

describe('lib/transform', function () {
  describe('transformUsingSchema', function () {
    describe('with a missing parameter', function () {
      var err;

      before(function () {
        var schema = {
          optional: Vat.any(),
          required: Vat.any().required(),
        };

        try {
          Transform.transformUsingSchema({}, schema, AuthErrors);
        } catch (_err) {
          err = _err;
        }
      });

      it('throws a `MISSING_PARAMETER` error', function () {
        assert.isTrue(AuthErrors.is(err, 'MISSING_PARAMETER'));
        assert.equal(err.param, 'required');
      });
    });

    describe('with an invalid parameter', function () {
      var err;

      before(function () {
        var schema = {
          numeric: Vat.number(),
        };

        try {
          Transform.transformUsingSchema(
            {
              numeric: 'a',
            },
            schema,
            AuthErrors
          );
        } catch (_err) {
          err = _err;
        }
      });

      it('throws a `INVALID_PARAMETER` error', function () {
        assert.isTrue(AuthErrors.is(err, 'INVALID_PARAMETER'));
        assert.equal(err.param, 'numeric');
      });
    });

    describe('valid', function () {
      var result;

      before(function () {
        var schema = {
          numeric: Vat.number(),
          optional: Vat.any(),
          required: Vat.any().required(),
        };

        result = Transform.transformUsingSchema(
          {
            numeric: 123,
            required: true,
          },
          schema,
          AuthErrors
        );
      });

      it('succeeds', function () {
        assert.deepEqual(result, {
          numeric: 123,
          required: true,
        });
      });
    });
  });
});
