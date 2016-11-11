/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const Able = require('lib/able');
  const { assert } = require('chai');
  const Metrics = require('lib/metrics');
  const sinon = require('sinon');
  const View = require('views/marketing_snippet');
  const WindowMock = require('../../mocks/window');
  const VerificationReasons = require('lib/verification-reasons');

  describe('views/marketing_snippet', function () {
    let metrics;
    let view;
    let windowMock;

    function createView(options = {}) {
      options.service = 'sync';
      options.type = VerificationReasons.SIGN_UP;
      options.lang = options.lang || 'en';

      options.window = windowMock;

      metrics = new Metrics();
      options.metrics = metrics;

      options.able = new Able();
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
      it('normally shows sign up marketing material to non-FxMobile sync users', function () {
        windowMock.navigator.userAgent = 'Mozilla/5.0 (Windows NT x.y; rv:31.0) Gecko/20100101 Firefox/31.0';

        createView();

        return view.render()
          .then(() => {
            assert.lengthOf(view.$('.marketing-ios'), 1);
          });
      });

      it('shows only iOS button to iOS users', function () {
        windowMock.navigator.platform = 'iPhone';

        createView();

        return view.render()
          .then(() => {
            assert.lengthOf(view.$('.marketing-link-ios'), 1);
            assert.lengthOf(view.$('.marketing-link-android'), 0);
          });
      });

      it('shows only Android button to Android users', function () {
        windowMock.navigator.userAgent = 'Mozilla/5.0 (Linux; U; Android 2.3; en-us) AppleWebKit/999+ (KHTML, like Gecko) Safari/999.9';

        createView();

        return view.render()
          .then(() => {
            assert.lengthOf(view.$('.marketing-link-ios'), 0);
            assert.lengthOf(view.$('.marketing-link-android'), 1);
          });
      });

      it('shows iOS and Android buttons to non-iOS, non-Android users', function () {
        windowMock.navigator.userAgent = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)';

        createView();

        return view.render()
          .then(() => {
            assert.lengthOf(view.$('.marketing-link-ios'), 1);
            assert.lengthOf(view.$('.marketing-link-android'), 1);
          });
      });

      it('shows localized buttons for supported languages', function () {
        createView({ lang: 'de' });

        return view.render()
          .then(() => {
            // de.png for play store
            assert.lengthOf(view.$('img[src*="/de."]'), 2);
          });
      });

      it('shows en-US buttons for unsupported languages', function () {
        createView({ lang: 'klingon' });

        return view.render()
          .then(() => {
            // en.png for play store
            assert.lengthOf(view.$('img[src*="/en."]'), 2);
          });
      });

      it('shows high-res Android image to users with high-dpi displays', function () {
        createView();

        sinon.stub(view, '_isHighRes', () => true);

        return view.render()
          .then(() => {
            // en@2x.png for play store. (app store images are SVG)
            assert.lengthOf(view.$('img[src*="/en@2x.png"]'), 1);
          });
      });
    });

    describe('a click on the marketing material', function () {
      it('is logged', function () {
        createView();

        return view.render()
          .then(() => {
            view.$('.marketing-link:first').click();
          })
          .then(() => {
            const filteredData = metrics.getFilteredData();
            const impression = filteredData.marketing[0];
            assert.isTrue(impression.clicked);
          });
      });
    });
  });
});
