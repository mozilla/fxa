/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const chai = require('chai');
  const Constants = require('lib/constants');
  const VerificationReasons = require('lib/verification-reasons');
  const Metrics = require('lib/metrics');
  const View = require('views/marketing_snippet');
  const WindowMock = require('../../mocks/window');

  var assert = chai.assert;

  describe('views/marketing_snippet', function () {
    var view, windowMock, metrics;

    function createView(options) {
      options.window = windowMock;

      metrics = new Metrics();
      options.metrics = metrics;

      view = new View(options);
    }

    function testMarketingNotDisplayed (userAgent) {
      windowMock.navigator.userAgent = userAgent;

      createView({
        language: 'en',
        service: Constants.SYNC_SERVICE,
        type: VerificationReasons.SIGN_UP
      });

      return view.render()
        .then(() => {
          assert.lengthOf(view.$('.marketing.default'), 0);
        });
    }


    beforeEach(function () {
      windowMock = new WindowMock();
    });

    afterEach(function () {
      view.remove();
      view.destroy();
      view = windowMock = null;
    });

    describe('render', function () {
      it('shows marketing material users signing up to Sync on desktop', function () {
        windowMock.navigator.userAgent = 'Mozilla/5.0 (Windows NT x.y; rv:31.0) Gecko/20100101 Firefox/31.0';

        createView({
          language: 'en',
          service: Constants.SYNC_SERVICE,
          type: VerificationReasons.SIGN_UP
        });

        return view.render()
          .then(function () {
            assert.equal(view.$('.marketing.default').length, 1);
          });
      });

      it('shows marketing material users signing in to Sync on desktop', function () {
        windowMock.navigator.userAgent = 'Mozilla/5.0 (Windows NT x.y; rv:31.0) Gecko/20100101 Firefox/31.0';

        createView({
          language: 'en',
          service: Constants.SYNC_SERVICE,
          type: VerificationReasons.SIGN_IN
        });

        return view.render()
          .then(function () {
            assert.equal(view.$('.marketing.default').length, 1);
          });
      });

      it('shows nothing to english speaking non-sync users', function () {
        windowMock.navigator.userAgent = 'Mozilla/5.0 (Windows NT x.y; rv:31.0) Gecko/20100101 Firefox/31.0';

        createView({
          language: 'en',
          type: VerificationReasons.SIGN_UP
        });

        return view.render()
          .then(function () {
            assert.equal(view.$('.marketing.default').length, 0);
          });
      });

      it('shows nothing to english speaking users on Firefox for Android', function () {
        return testMarketingNotDisplayed(
          'Mozilla/5.0 (Android; Tablet; rv:26.0) Gecko/26.0 Firefox/26.0');
      });

      it('shows nothing to english speaking users on B2G', function () {
        return testMarketingNotDisplayed(
          'Mozilla/5.0 (Mobile; rv:26.0) Gecko/26.0 Firefox/26.0');
      });

      it('shows nothing to english speaking users on Firefox for iOS', function () {
        return testMarketingNotDisplayed(
          'Mozilla/5.0 (iPod touch; CPU iPhone ' +
          'OS 8_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) ' +
          'FxiOS/1.0 Mobile/12F69 Safari/600.1.4');
      });

      it('shows nothing to non-english speaking, non-sync users', function () {
        createView({
          language: 'ru',
          surveyPercentage: 0,
          type: VerificationReasons.SIGN_UP
        });

        return view.render()
          .then(function () {
            assert.equal(view.$('.marketing.default').length, 0);
          });
      });

      it('logs the marketing type and link', function () {
        createView({
          language: 'de',
          service: Constants.SYNC_SERVICE,
          type: VerificationReasons.SIGN_UP
        });

        return view.render()
          .then(function () {
            var filteredData = metrics.getFilteredData();
            var impression = filteredData.marketing[0];
            assert.isTrue('campaignId' in impression);
            assert.isTrue('url' in impression);
            assert.isFalse(impression.clicked);
          });
      });

    });

    describe('a click on the marketing material', function () {
      it('is logged', function () {
        createView({
          language: 'de',
          service: Constants.SYNC_SERVICE,
          type: VerificationReasons.SIGN_UP
        });

        return view.render()
          .then(function () {
            view.$('.marketing-link').click();
          })
          .then(function () {
            var filteredData = metrics.getFilteredData();
            var impression = filteredData.marketing[0];
            assert.isTrue(impression.clicked);
          });
      });
    });
  });
});
