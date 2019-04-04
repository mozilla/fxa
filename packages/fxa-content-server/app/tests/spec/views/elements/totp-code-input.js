/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
const {assert} = require('chai');
import AuthErrors from 'lib/auth-errors';
import TotpEl from 'views/elements/totp-code-input';

const TEMPLATE =
  '<input type="number" pattern="\d*" class="totp-code"></input>' +
  '<input type="number" pattern="\d*" class="not-code"></input>';

describe('views/elements/totp-code-input', function () {
  let $element;
  let $otherElement;

  before(() => {
    $('#container').html(TEMPLATE);
    $element = $('.totp-code');
    $otherElement = $('.not-code');
  });

  after(() => {
    $('#container').html('');
  });

  describe('match', () => {
    it('returns `true` for class `totp-code`', () => {
      assert.isTrue(TotpEl.match($element));
    });

    it('returns `false` for other class', () => {
      assert.isFalse(TotpEl.match($otherElement));
    });
  });

  describe('val', () => {
    it('strips, -, spaces', () => {
      $element.val('  000001');
      assert.equal($element.val(), '000001');

      $element.val('000-002');
      assert.equal($element.val(), '000002');

      $element.val('000 003');
      assert.equal($element.val(), '000003');
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

    it('if empty, throws a `TOTP_CODE_REQUIRED`', () => {
      testInvalidInput($element, '', 'TOTP_CODE_REQUIRED');
    });

    it('if invalid, throws a `INVALID_TOTP_CODE`', () => {
      testInvalidInput($element, '000000000', 'INVALID_TOTP_CODE');
    });

    it('does not throw if valid', () => {
      assert.isUndefined(validate($element, '000000'));
      assert.isUndefined(validate($element, '111111'));
    });
  });
});
