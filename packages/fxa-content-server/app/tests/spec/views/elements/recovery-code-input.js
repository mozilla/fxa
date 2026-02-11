/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import RecoveryEl from 'views/elements/recovery-code-input';

const TEMPLATE =
  '<input type="text" class="recovery-code"></input>' +
  '<input type="text" class="not-code"></input>';

describe('views/elements/recovery-code-input', function () {
  let $element;
  let $otherElement;

  before(() => {
    $('#container').html(TEMPLATE);
    $element = $('.recovery-code');
    $otherElement = $('.not-code');
  });

  after(() => {
    $('#container').html('');
  });

  describe('match', () => {
    it('returns `true` for class `recovery-code`', () => {
      assert.isTrue(RecoveryEl.match($element));
    });

    it('returns `false` for other class', () => {
      assert.isFalse(RecoveryEl.match($otherElement));
    });
  });

  describe('val', () => {
    it('strips spaces', () => {
      $element.val('  00000000');
      assert.equal($element.val(), '00000000');

      $element.val('00000000  ');
      assert.equal($element.val(), '00000000');

      $element.val('00000000 ');
      assert.equal($element.val(), '00000000');
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

    it('if empty, throws a `RECOVERY_CODE_REQUIRED`', () => {
      testInvalidInput($element, '', 'RECOVERY_CODE_REQUIRED');
    });

    it('if invalid, throws a `INVALID_RECOVERY_CODE`', () => {
      testInvalidInput($element, 'notvalid!!', 'INVALID_RECOVERY_CODE');
    });

    it('does not throw if valid', () => {
      assert.isUndefined(validate($element, 'abcd0000'));
      assert.isUndefined(validate($element, 'abcdefgh00'));
    });
  });
});
