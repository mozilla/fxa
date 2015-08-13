/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// test the metrics library

define([
  'sinon',
  'chai',
  'jquery',
  'lib/mailcheck'
],
function (sinon, chai, $, mailcheck) {
  'use strict';

  var assert = chai.assert;
  var MAILCHECK_ID = 'mailcheck-test';
  var MAILCHECK_SELECTOR = '#' + MAILCHECK_ID;
  var TOOLTIP_SELECTOR = '.tooltip-suggest';
  var BAD_EMAIL = 'something@gnail.com';
  var CORRECTED_EMAIL = 'something@gmail.com';
  var RESULT_TEXT = 'Did you mean gmail.com?✕';

  describe('lib/mailcheck', function () {
    var mockTranslator = window.translator;
    var mockMetrics = {
      logEvent: function () {
      }
    };
    var metricsStub;
    var mockView = {
      experimentTrigger: function () {},
      isInExperimentGroup: function () {
        return true;
      }
    };

    beforeEach(function () {
      $('body').append('<div class="input-row test-input"><input type=text id="' + MAILCHECK_ID + '"/></div>');
      metricsStub = sinon.stub(mockView, 'experimentTrigger', function () {
      });
    });

    afterEach(function () {
      $('.test-input').remove();
      metricsStub.restore();
    });

    it('skips mailcheck if element cannot be found', function (done) {
      var MAILCHECK_SELECTOR = $('.bad-selector-that-does-not-exist');
      assert.doesNotThrow(function () {
        mailcheck(MAILCHECK_SELECTOR);
        done();
      });
    });

    it('works with attached elements and changes values', function (done) {
      $(MAILCHECK_SELECTOR).blur(function () {
        mailcheck(MAILCHECK_SELECTOR, mockMetrics, mockTranslator, mockView);
      });


      $(MAILCHECK_SELECTOR).val(BAD_EMAIL).blur();
      assert.isTrue(mockView.experimentTrigger.calledTwice, 'called experimentTrigger twice');

      // wait for tooltip
      setTimeout(function () {
        assert.equal($(TOOLTIP_SELECTOR).text(), RESULT_TEXT);
        $(TOOLTIP_SELECTOR).find('span').first().click();
        // email should be corrected
        assert.equal($(MAILCHECK_SELECTOR).val(), CORRECTED_EMAIL);
        assert.isTrue(mockView.experimentTrigger.calledThrice, 'called experimentTrigger thrice');
        done();
      }, 50);
    });

    it('works with attached elements and can be dismissed', function (done) {
      $(MAILCHECK_SELECTOR).blur(function () {
        mailcheck(MAILCHECK_SELECTOR, mockMetrics, mockTranslator, mockView);
      });

      $(MAILCHECK_SELECTOR).val(BAD_EMAIL).blur();
      assert.isTrue(mockView.experimentTrigger.calledTwice, 'called experimentTrigger twice');

      // wait for tooltip
      setTimeout(function () {
        assert.equal($(TOOLTIP_SELECTOR).text(), RESULT_TEXT);
        $(TOOLTIP_SELECTOR).find('span').eq(1).click();
        // email should NOT be corrected
        assert.equal($(MAILCHECK_SELECTOR).val(), BAD_EMAIL);
        assert.isFalse(mockView.experimentTrigger.calledThrice, 'called experimentTrigger thrice');
        done();
      }, 50);
    });

  });
});
