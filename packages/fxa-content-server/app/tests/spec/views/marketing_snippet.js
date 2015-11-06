/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var chai = require('chai');
  var Metrics = require('lib/metrics');
  var View = require('views/marketing_snippet');
  var WindowMock = require('../../mocks/window');

  var assert = chai.assert;

  describe('views/marketing_snippet', function () {
    var view, windowMock, metrics;

    function createView(options) {
      options.window = windowMock;

      metrics = new Metrics();
      options.metrics = metrics;

      view = new View(options);
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
      it('normally shows sign up marketing material to desktop sync users', function () {
        windowMock.navigator.userAgent = 'Mozilla/5.0 (Windows NT x.y; rv:31.0) Gecko/20100101 Firefox/31.0';

        createView({
          language: 'en',
          service: 'sync',
          type: 'sign_up'
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
          type: 'sign_up'
        });

        return view.render()
          .then(function () {
            assert.equal(view.$('.marketing.default').length, 0);
          });
      });

      it('shows nothing to english speaking users on Firefox for Android', function () {
        windowMock.navigator.userAgent = 'Mozilla/5.0 (Android; Tablet; rv:26.0) Gecko/26.0 Firefox/26.0';

        createView({
          language: 'en',
          service: 'sync',
          type: 'sign_up'
        });

        return view.render()
          .then(function () {
            assert.equal(view.$('.marketing.default').length, 0);
          });
      });

      it('shows nothing to english speaking users on B2G', function () {
        windowMock.navigator.userAgent = 'Mozilla/5.0 (Mobile; rv:26.0) Gecko/26.0 Firefox/26.0';
        createView({
          language: 'en',
          service: 'sync',
          type: 'sign_up'
        });

        return view.render()
          .then(function () {
            assert.equal(view.$('.marketing.default').length, 0);
          });
      });

      it('shows nothing to non-english speaking, non-sync users', function () {
        createView({
          language: 'ru',
          surveyPercentage: 0,
          type: 'sign_up'
        });

        return view.render()
          .then(function () {
            assert.equal(view.$('.marketing.default').length, 0);
          });
      });

      it('logs the marketing type and link', function () {
        createView({
          language: 'de',
          service: 'sync',
          type: 'sign_up'
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
          service: 'sync',
          type: 'sign_up'
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
