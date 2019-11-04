/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// test the metrics library

import $ from 'jquery';
import { assert } from 'chai';
import mailcheck from 'lib/mailcheck';
import p from 'lib/promise';
import sinon from 'sinon';
import Translator from 'lib/translator';

const GOOD_EMAIL = 'something@gmail.com';
const BAD_EMAIL = 'something@gnail.com';
const BAD_EMAIL_2 = 'something@gsail.com';
const CORRECTED_EMAIL = 'something@gmail.com';

const DISMISS_SELECTOR = '.tooltip-suggest .dismiss';
const MAILCHECK_ID = 'mailcheck-test';
const MAILCHECK_SELECTOR = '#' + MAILCHECK_ID;
const RESULT_TEXT = 'Did you mean gmail.com?✕';
const SUGGESTION_SELECTOR = '#email-suggestion';
const TOOLTIP_SELECTOR = '.tooltip-suggest';

describe('lib/mailcheck', () => {
  let mockView;
  let translator;

  beforeEach(() => {
    translator = new Translator({ forceEnglish: true });

    mockView = {
      isInExperimentGroup() {
        return true;
      },
      logEvent: sinon.spy(),
      unsafeTranslate(msg, params) {
        return translator.get(msg, params);
      },
      $(selector) {
        return $(selector);
      },
    };
    $('body').append(
      `<div class="input-row test-input"><input type=text id="${MAILCHECK_ID}"/></div>`
    );
  });

  afterEach(() => {
    $('.test-input').remove();
  });

  it('skips mailcheck if element cannot be found', () => {
    var MAILCHECK_SELECTOR = $('.bad-selector-that-does-not-exist');
    assert.isFalse(mailcheck(MAILCHECK_SELECTOR, mockView));
  });

  it('returns false if email domain is not caught', () => {
    $(MAILCHECK_SELECTOR).val(GOOD_EMAIL);

    assert.isFalse(mailcheck(MAILCHECK_SELECTOR, mockView));
    assert.equal(mockView.logEvent.callCount, 1);
  });

  it('works with attached elements and changes values', () => {
    $(MAILCHECK_SELECTOR).val(BAD_EMAIL);

    assert.isTrue(mailcheck(MAILCHECK_SELECTOR, mockView));
    assert.equal(mockView.logEvent.callCount, 2, 'called logEvent twice');

    return (
      p
        // wait for tooltip
        .delay(50)
        .then(() => {
          assert.equal($(TOOLTIP_SELECTOR).text(), RESULT_TEXT);
          $(SUGGESTION_SELECTOR).click();
          // email should be corrected
          assert.equal($(MAILCHECK_SELECTOR).val(), CORRECTED_EMAIL);
          assert.equal(
            mockView.logEvent.callCount,
            3,
            'called logEvent thrice'
          );
        })
    );
  });

  it('works with attached elements and can be dismissed', () => {
    $(MAILCHECK_SELECTOR).val(BAD_EMAIL);
    assert.isTrue(mailcheck(MAILCHECK_SELECTOR, mockView));

    assert.equal(mockView.logEvent.callCount, 2, 'called logEvent twice');

    return (
      p
        // wait for tooltip
        .delay(50)
        .then(() => {
          assert.equal($(TOOLTIP_SELECTOR).text(), RESULT_TEXT);
          $(DISMISS_SELECTOR).click();
          // email should NOT be corrected
          assert.equal($(MAILCHECK_SELECTOR).val(), BAD_EMAIL);
          assert.notEqual(
            mockView.logEvent.callCount,
            3,
            'called logEvent thrice'
          );
        })
    );
  });

  it('returns false if email domain is matched a 2nd time without a change', () => {
    $(MAILCHECK_SELECTOR).val(BAD_EMAIL);

    assert.isTrue(mailcheck(MAILCHECK_SELECTOR, mockView));
    assert.isFalse(mailcheck(MAILCHECK_SELECTOR, mockView));
  });

  it('returns true if email domain matches, is changed, then matches again', () => {
    $(MAILCHECK_SELECTOR).val(BAD_EMAIL);
    assert.isTrue(mailcheck(MAILCHECK_SELECTOR, mockView));

    $(MAILCHECK_SELECTOR).val(BAD_EMAIL_2);
    assert.isTrue(mailcheck(MAILCHECK_SELECTOR, mockView));
    assert.isFalse(mailcheck(MAILCHECK_SELECTOR, mockView));
  });
});
