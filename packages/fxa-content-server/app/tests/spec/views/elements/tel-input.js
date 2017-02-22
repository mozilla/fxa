/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const { assert } = require('chai');
  const AuthErrors = require('lib/auth-errors');
  const TelEl = require('views/elements/tel-input');

  const TEMPLATE =
    '<input type="text"></input>' +
    '<input type="tel"></input>';

  describe('views/elements/tel-input', function () {
    let $telEl;
    let $textEl;

    before(() => {
      $('#container').html(TEMPLATE);
      $telEl = $('input[type=tel]');
      $textEl = $('input[type=text]');
    });

    after(() => {
      $('#container').html('');
    });

    describe('match', () => {
      it('returns `true` for input[type=tel]', () => {
        assert.isTrue(TelEl.match($telEl));
        assert.isFalse(TelEl.match($textEl));
      });
    });

    describe('val', () => {
      it('strips periods, commas, -, spaces', () => {
        $telEl.val('  123,456.78-90');
        assert.equal($telEl.val(), '1234567890');
      });
    });

    describe('validate', () => {
      function validate(text) {
        $telEl.val(text);
        try {
          $telEl.validate();
        } catch (err) {
          return err;
        }
      }

      function testInvalidInput(text, expectedErrorType) {
        assert.isTrue(AuthErrors.is(validate(text), expectedErrorType));
      }

      describe('default country', () => {
        it('throws a `PHONE_NUMBER_REQUIRED` if empty', () => {
          testInvalidInput('', 'PHONE_NUMBER_REQUIRED');
        });

        it('throws a `INVALID_PHONE_NUMBER` if invalid', () => {
          testInvalidInput('asdf', 'INVALID_PHONE_NUMBER');
          testInvalidInput('123456789', 'INVALID_PHONE_NUMBER');
          testInvalidInput('+1123456789', 'INVALID_PHONE_NUMBER');
          testInvalidInput('+441234567890', 'INVALID_PHONE_NUMBER');
        });

        it('does not throw if valid', () => {
          assert.isUndefined(validate('1234567890'));
          assert.isUndefined(validate('+11234567890'));
        });
      });

      describe('specifying country using `data-country`', () => {
        beforeEach(() => {
          $telEl.data('country', 'GB');
        });
        it('throws a `PHONE_NUMBER_REQUIRED` if empty', () => {
          testInvalidInput('', 'PHONE_NUMBER_REQUIRED');
        });

        it('throws a `INVALID_PHONE_NUMBER` if invalid', () => {
          testInvalidInput('asdf', 'INVALID_PHONE_NUMBER');
          testInvalidInput('123456789', 'INVALID_PHONE_NUMBER');
          testInvalidInput('+11234567890', 'INVALID_PHONE_NUMBER');
        });

        it('does not throw if valid', () => {
          assert.isUndefined(validate('1234567890'));
          assert.isUndefined(validate('+441234567890'));
        });
      });
    });
  });
});
