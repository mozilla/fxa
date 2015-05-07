/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'sinon',
  'views/marketing_snippet_ios',
  'lib/able',
  'lib/metrics',
  '../../mocks/window'
],
function (chai, sinon, View, Able, Metrics, WindowMock) {
  var assert = chai.assert;

  describe('views/marketing_snippet_ios', function () {
    var view, windowMock, metrics;

    function createView(options) {
      options = options || {};

      options.service = 'sync';
      options.type = 'sign_up';
      options.language = options.language || 'en';

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
            .then(function () {
              assert.equal(view.$('.marketing-ios').length, 1);
            });
      });

      it('shows only iOS button to iOS users', function () {
        windowMock.navigator.platform = 'iPhone';

        createView();

        return view.render()
            .then(function () {
              assert.equal(view.$('.marketing-link-ios').length, 1);
              assert.equal(view.$('.marketing-link-android').length, 0);
            });
      });

      it('shows only Android button to Android users', function () {
        windowMock.navigator.userAgent = 'Mozilla/5.0 (Linux; U; Android 2.3; en-us) AppleWebKit/999+ (KHTML, like Gecko) Safari/999.9';

        createView();

        return view.render()
            .then(function () {
              assert.equal(view.$('.marketing-link-ios').length, 0);
              assert.equal(view.$('.marketing-link-android').length, 1);
            });
      });

      it('shows iOS and Android buttons to non-iOS, non-Android users', function () {
        windowMock.navigator.userAgent = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)';

        createView();

        return view.render()
            .then(function () {
              assert.equal(view.$('.marketing-link-ios').length, 1);
              assert.equal(view.$('.marketing-link-android').length, 1);
            });
      });

      it('shows localized buttons for supported langauges', function () {
        createView({
          language: 'de'
        });

        return view.render()
            .then(function () {
              // de.png for play store
              assert.equal(view.$('img[src*="/de."]').length, 1);
            });
      });

      it('shows en-US buttons for unsupported langauges', function () {
        createView({
          language: 'klingon'
        });

        return view.render()
            .then(function () {
              // en.png for play store
              assert.equal(view.$('img[src*="/en."]').length, 1);
            });
      });

      it('shows high-res Android image to users with high-dpi displays', function () {
        createView();

        sinon.stub(view, '_isHighRes', function () {
          return true;
        });

        return view.render()
            .then(function () {
              // en@2x.png for play store. (app store images are SVG)
              assert.equal(view.$('img[src*="/en@2x.png"]').length, 1);
            });
      });
    });


    describe('a click on the marketing material', function () {
      it('is logged', function () {
        createView();

        return view.render()
            .then(function () {
              view.$('.marketing-link:first').click();
            })
            .then(function () {
              var filteredData = metrics.getFilteredData();
              assert.isTrue(filteredData.marketingClicked);
            });
      });
    });
  });
});



