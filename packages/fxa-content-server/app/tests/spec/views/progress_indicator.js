/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var chai = require('chai');
  var ProgressIndicator = require('views/progress_indicator');
  var sinon = require('sinon');

  var assert = chai.assert;
  var progressIndicator;

  describe('views/progress_indicator', function () {
    beforeEach(function () {
      progressIndicator = new ProgressIndicator();
      $('#container').html('<button id="indicate">Button</button>');
    });

    afterEach(function () {
      progressIndicator.destroy();
      progressIndicator = null;
    });

    describe('start', function () {
      it('shows the indicator', function () {
        progressIndicator.start('#indicate');
        assert.isTrue(progressIndicator.isVisible());
      });

      it('works when waiting for the indicator', function () {
        progressIndicator._removeIndicatorTimeout = true;
        progressIndicator.start('#indicate');
        assert.isTrue(progressIndicator.isVisible());
      });

      it('calls showIndicator', function (done) {
        sinon.stub(progressIndicator, 'showIndicator', function () {
          done();
        });
        progressIndicator.start('#indicate');
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

      it('calls removeIndicator', function (done) {
        sinon.stub(progressIndicator, 'removeIndicator', function () {
          done();
        });
        progressIndicator.showIndicator('#indicate');
        progressIndicator.removeIndicator();
      });
    });
  });
});

