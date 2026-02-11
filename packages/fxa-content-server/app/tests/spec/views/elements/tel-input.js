/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import TelEl from 'views/elements/tel-input';

const TEMPLATE =
  '<input type="text"></input>' +
  '<input type="tel" required id="required-tel"></input>' +
  '<input type="tel" id="optional-tel"></input>';

describe('views/elements/tel-input', function () {
  let $optionalTelEl;
  let $requiredTelEl;
  let $textEl;

  before(() => {
    $('#container').html(TEMPLATE);
    $optionalTelEl = $('#optional-tel');
    $requiredTelEl = $('#required-tel');
    $textEl = $('input[type=text]');
  });

  after(() => {
    $('#container').html('');
  });

  describe('match', () => {
    it('returns `true` for input[type=tel]', () => {
      assert.isTrue(TelEl.match($optionalTelEl));
      assert.isTrue(TelEl.match($requiredTelEl));
      assert.isFalse(TelEl.match($textEl));
    });
  });

  describe('val', () => {
    it('strips periods, commas, -, spaces, ()', () => {
      $requiredTelEl.val('  (123),456.78-90');
      assert.equal($requiredTelEl.val(), '1234567890');
    });
  });

  describe('validate', () => {
    function validate($el, text) {
      $el.val(text);
      try {
        $el.validate();
      } catch (err) {
        return err;
      }
    }

    function testInvalidInput($el, text, expectedErrorType) {
      assert.isTrue(AuthErrors.is(validate($el, text), expectedErrorType));
    }

    describe('default country', () => {
      it('if empty, throws a `PHONE_NUMBER_REQUIRED` with required attribute', () => {
        testInvalidInput($requiredTelEl, '', 'PHONE_NUMBER_REQUIRED');
        assert.isUndefined(validate($optionalTelEl, ''));
      });

      it('throws a `INVALID_PHONE_NUMBER` if invalid', () => {
        testInvalidInput($requiredTelEl, 'asdf', 'INVALID_PHONE_NUMBER');
        testInvalidInput($requiredTelEl, '123456789', 'INVALID_PHONE_NUMBER');
        testInvalidInput($requiredTelEl, '+1123456789', 'INVALID_PHONE_NUMBER');
        testInvalidInput(
          $requiredTelEl,
          '+441234567890',
          'INVALID_PHONE_NUMBER'
        );
      });

      it('does not throw if valid', () => {
        assert.isUndefined(validate($requiredTelEl, '2134567890'));
        assert.isUndefined(validate($requiredTelEl, '12134567890'));
        assert.isUndefined(validate($requiredTelEl, '(213)4567890'));
        assert.isUndefined(validate($requiredTelEl, '(213)456-7890'));
        assert.isUndefined(validate($requiredTelEl, '(213) 456-7890'));
        assert.isUndefined(validate($requiredTelEl, '1(213) 456-7890'));
        assert.isUndefined(validate($requiredTelEl, '1 (213) 456-7890'));
        assert.isUndefined(validate($requiredTelEl, '+1(213) 456-7890'));
        assert.isUndefined(validate($requiredTelEl, '+1 (213) 456-7890'));
      });
    });

    describe('specifying country using `data-country`', () => {
      beforeEach(() => {
        $requiredTelEl.data('country', 'GB');
      });

      it('if empty, throws a `PHONE_NUMBER_REQUIRED` with required attribute', () => {
        testInvalidInput($requiredTelEl, '', 'PHONE_NUMBER_REQUIRED');
        assert.isUndefined(validate($optionalTelEl, ''));
      });

      it('throws a `INVALID_PHONE_NUMBER` if invalid', () => {
        testInvalidInput($requiredTelEl, 'asdf', 'INVALID_PHONE_NUMBER');
        testInvalidInput($requiredTelEl, '123456789', 'INVALID_PHONE_NUMBER');
        testInvalidInput(
          $requiredTelEl,
          '+11234567890',
          'INVALID_PHONE_NUMBER'
        );
      });

      it('does not throw if valid', () => {
        assert.isUndefined(validate($requiredTelEl, '12345678901'));
        assert.isUndefined(validate($requiredTelEl, '+441234567890'));
      });
    });
  });
});
