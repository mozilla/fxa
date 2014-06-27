/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'views/marketing_snippet',
  '../../mocks/window'
],
function (chai, View, WindowMock) {
  var assert = chai.assert;

  describe('views/marketing_snippet', function () {
    var view, windowMock;

    function createView(options) {
      options.window = windowMock;

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
          type: 'sign_up',
          service: 'sync',
          language: 'en',
          surveyPercentage: 0
        });

        return view.render()
            .then(function () {
              assert.equal(view.$('.marketing.survey').length, 0);
              assert.equal(view.$('.marketing.default').length, 1);
            });
      });

      it('shows survey to english speaking non-sync users', function () {
        windowMock.navigator.userAgent = 'Mozilla/5.0 (Windows NT x.y; rv:31.0) Gecko/20100101 Firefox/31.0';

        createView({
          type: 'sign_up',
          language: 'en',
          surveyPercentage: 0
        });

        return view.render()
            .then(function () {
              assert.equal(view.$('.marketing.survey').length, 1);
              assert.equal(view.$('.marketing.default').length, 0);
            });
      });

      it('shows survey to english speaking users on Firefox for Android', function () {
        windowMock.navigator.userAgent = 'Mozilla/5.0 (Android; Tablet; rv:26.0) Gecko/26.0 Firefox/26.0';

        createView({
          type: 'sign_up',
          service: 'sync',
          language: 'en',
          surveyPercentage: 0
        });

        return view.render()
            .then(function () {
              assert.equal(view.$('.marketing.default').length, 0);
              assert.equal(view.$('.marketing.survey').length, 1);
            });
      });

      it('shows survey to english speaking users on B2G', function () {
        windowMock.navigator.userAgent = 'Mozilla/5.0 (Mobile; rv:26.0) Gecko/26.0 Firefox/26.0';
        createView({
          type: 'sign_up',
          service: 'sync',
          language: 'en',
          surveyPercentage: 0
        });

        return view.render()
            .then(function () {
              assert.equal(view.$('.marketing.default').length, 0);
              assert.equal(view.$('.marketing.survey').length, 1);
            });
      });

      it('shows nothing to non-english speaking, non-sync users', function () {
        createView({
          type: 'sign_up',
          language: 'ru',
          surveyPercentage: 0
        });

        return view.render()
            .then(function () {
              assert.equal(view.$('.marketing.default').length, 0);
              assert.equal(view.$('.marketing.survey').length, 0);
            });
      });
    });

    describe('render/show survey', function () {
      it('shows survey to english users', function () {
        createView({
          type: 'sign_up',
          service: 'sync',
          language: 'en_GB',
          surveyPercentage: 100
        });

        return view.render()
            .then(function () {
              assert.equal(view.$('.marketing.default').length, 0);
              assert.equal(view.$('.marketing.survey').length, 1);
            });
      });

      it('still shows default marketing to non-english desktop sync users', function () {
        createView({
          type: 'sign_up',
          service: 'sync',
          language: 'de',
          surveyPercentage: 100
        });

        return view.render()
            .then(function () {
              assert.equal(view.$('.marketing.default').length, 1);
              assert.equal(view.$('.marketing.survey').length, 0);
            });
      });

    });
  });
});



