/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import CoppaAgeEl from 'views/elements/coppa-age-input';

const TEMPLATE = `
  <input type="text" />
  <input type="number" id="age" />
`;

describe('views/elements/coppa-age-input', function () {
  let $coppaEl;
  let $textEl;

  before(() => {
    $('#container').html(TEMPLATE);
    $coppaEl = $('#age');
    $textEl = $('input[type=text]');
  });

  after(() => {
    $('#container').html('');
  });

  describe('match', () => {
    it('returns `true` for input[type=number]#age', () => {
      assert.isTrue(CoppaAgeEl.match($coppaEl));
      assert.isFalse(CoppaAgeEl.match($textEl));
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

    describe('required', () => {
      before(() => {
        $coppaEl.attr('required', 'required');
      });

      after(() => {
        $coppaEl.removeAttr('required');
      });

      it('if empty, throws a `AGE_REQUIRED` with `required` attribute', () => {
        assert.isTrue(AuthErrors.is(validate($coppaEl, ''), 'AGE_REQUIRED'));
        assert.isUndefined(validate($coppaEl, '12'));
      });
    });

    describe('invalid', () => {
      it('if age is greater than 130, throws a `INVALID_AGE`', () => {
        assert.isTrue(AuthErrors.is(validate($coppaEl, '131'), 'INVALID_AGE'));
      });

      it('if age is less than or equals to 130, does not throw `INVALID_AGE`', () => {
        assert.isUndefined(validate($coppaEl, '130'));
      });
    });

    describe('not required', () => {
      it('does not throw if empty', () => {
        assert.isUndefined(validate($coppaEl, ''));
        assert.isUndefined(validate($coppaEl, '12'));
      });
    });
  });
});
