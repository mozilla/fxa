/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'chai',
  'jquery',
  'views/button_progress_indicator'
],
function (chai, $, ProgressIndicator) {
  /*global describe, beforeEach, afterEach, it*/
  var assert = chai.assert;
  var progressIndicator;

  describe('views/button_progress_indicator', function () {
    beforeEach(function () {
      progressIndicator = new ProgressIndicator();
      $('#container').html('<button id="indicate">Button</button>');
    });

    describe('start', function () {
      it('shows the indicator', function () {
        progressIndicator.start('#indicate');
        assert.isTrue(progressIndicator.isVisible());
      });
    });

    describe('done', function () {
      it('hides the indicator', function () {
        progressIndicator.start('#indicate');
        progressIndicator.done();
        assert.isFalse(progressIndicator.isVisible());
      });
    });

    describe('multiple starts', function () {
      it('must be matched by same number of dones', function () {
        progressIndicator.start('#indicate');
        progressIndicator.start('#indicate');
        progressIndicator.done();
        assert.isTrue(progressIndicator.isVisible());

        progressIndicator.done();
        assert.isFalse(progressIndicator.isVisible());
      });
    });

    describe('showIndicator', function () {
      it('replaces the button text with a spinner', function () {
        progressIndicator.showIndicator('#indicate');
        assert.notEqual($('#indicate').text(), 'Button');
      });
    });

    describe('removeIndicator', function () {
      it('replaces the spinner with the original button text', function () {
        progressIndicator.showIndicator('#indicate');
        progressIndicator.removeIndicator();
        assert.equal($('#indicate').text(), 'Button');
      });
    });
  });
});

