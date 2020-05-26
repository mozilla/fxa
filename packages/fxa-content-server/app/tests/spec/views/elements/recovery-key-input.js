/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import TotpEl from 'views/elements/recovery-key-input';

const TEMPLATE =
  '<input type="text" class="recovery-key"></input>' +
  '<input type="text" class="recovery-key"></input>';

describe('views/elements/recovery-key-input', function () {
  let $element;
  let $otherElement;

  before(() => {
    $('#container').html(TEMPLATE);
    $element = $('.recovery-key');
    $otherElement = $('.not-key');
  });

  after(() => {
    $('#container').html('');
  });

  describe('match', () => {
    it('returns `true` for class `recovery-key`', () => {
      assert.isTrue(TotpEl.match($element));
    });

    it('returns `false` for other class', () => {
      assert.isFalse(TotpEl.match($otherElement));
    });
  });

  describe('val', () => {
    it('strips spaces, return uppercase key', () => {
      $element.val('abc');
      assert.equal($element.val(), 'ABC');

      $element.val(' AbC');
      assert.equal($element.val(), 'ABC');
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

    it('if empty, throws a `RECOVERY_KEY_REQUIRED`', () => {
      testInvalidInput($element, '', 'RECOVERY_KEY_REQUIRED');
    });

    it('if invalid, throws a `INVALID_RECOVERY_KEY`', () => {
      testInvalidInput($element, 'OOOIU', 'INVALID_RECOVERY_KEY');
    });

    it('does not throw if valid', () => {
      assert.isUndefined(validate($element, 'wert123'));
      assert.isUndefined(validate($element, 'WERTc4'));
    });
  });
});
