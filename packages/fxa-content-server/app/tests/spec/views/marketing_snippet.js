/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import BaseBroker from 'models/auth_brokers/base';
import Constants from 'lib/constants';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import sinon from 'sinon';
import View from 'views/marketing_snippet';
import WindowMock from '../../mocks/window';
import VerificationReasons from 'lib/verification-reasons';

describe('views/marketing_snippet', function () {
  let broker;
  let metrics;
  let notifier;
  let view;
  let windowMock;

  function createView(options = {}) {
    options.broker = broker;
    options.lang = options.lang || 'en';
    options.service = 'sync';
    options.type = VerificationReasons.SIGN_UP;
    options.window = windowMock;

    notifier = new Notifier();
    options.notifier = notifier;

    metrics = new Metrics({ notifier });
    options.metrics = metrics;

    view = new View(options);
  }

  beforeEach(function () {
    broker = new BaseBroker({});
    broker.setCapability('emailVerificationMarketingSnippet', true);

    windowMock = new WindowMock();
    // set a known userAgent that will display both buttons to begin with.
    windowMock.navigator.userAgent =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:50.0) Gecko/20100101 Firefox/50.0';
  });

  afterEach(function () {
    metrics.destroy();
    metrics = null;

    view.remove();
    view.destroy();
    view = null;

    windowMock = null;
  });

  testMarketingCampaign(Constants.MARKETING_ID_SPRING_2015);
  testMarketingCampaign(Constants.MARKETING_ID_AUTUMN_2016);

  function testMarketingCampaign(marketingId) {
    function assertLinkHasExpectedAttributes(view, expectedId, expectedType) {
      const $linkEl = view.$(`.marketing-link-${expectedType}`);
      assert.lengthOf($linkEl, 1);
      assert.equal($linkEl.data('marketing-id'), expectedId);
      assert.equal($linkEl.data('marketing-type'), expectedType);
      assert.equal($linkEl.prop('target'), '_blank');
    }

    describe(`render for ${marketingId}`, function () {
      it('shows no marketing to Fx Mobile users', () => {
        windowMock.navigator.userAgent =
          'Mozilla/5.0 (Android 4.4; Mobile; rv:41.0) Gecko/41.0 Firefox/41.0';

        createView({ marketingId });

        return view.render().then(() => {
          assert.lengthOf(view.$('.marketing-link-ios'), 0);
          assert.lengthOf(view.$('.marketing-link-android'), 0);
        });
      });

      it('override for Fx Mobile users', () => {
        windowMock.navigator.userAgent =
          'Mozilla/5.0 (Android 4.4; Mobile; rv:41.0) Gecko/41.0 Firefox/41.0';

        createView({ marketingId, which: View.WHICH.BOTH });

        return view.render().then(() => {
          assert.lengthOf(view.$('.marketing-link-ios'), 1);
          assert.lengthOf(view.$('.marketing-link-android'), 1);
          assert.isTrue(view.$el.hasClass(marketingId));
        });
      });

      it('shows only iOS button to iOS users', function () {
        windowMock.navigator.userAgent =
          'Mozilla/5.0 (iPhone; CPU iPhone ' +
          'OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) ' +
          'Version/5.1 Mobile/9A334 Safari/7534.48.3';

        createView({ marketingId });

        return view.render().then(() => {
          assertLinkHasExpectedAttributes(view, marketingId, 'ios');
          assert.lengthOf(view.$('.marketing-link-android'), 0);
          assert.isTrue(view.$el.hasClass(marketingId));
        });
      });

      it('shows only Android button to Android users', function () {
        windowMock.navigator.userAgent =
          'Mozilla/5.0 (Linux; U; Android 2.3; en-us) AppleWebKit/999+ (KHTML, like Gecko) Safari/999.9';

        createView({ marketingId });

        return view.render().then(() => {
          assert.lengthOf(view.$('.marketing-link-ios'), 0);
          assertLinkHasExpectedAttributes(view, marketingId, 'android');
          assert.isTrue(view.$el.hasClass(marketingId));
        });
      });

      it('shows iOS and Android buttons to non-iOS, non-Android users', function () {
        windowMock.navigator.userAgent =
          'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)';

        createView({ marketingId });

        return view.render().then(() => {
          assertLinkHasExpectedAttributes(view, marketingId, 'ios');
          assertLinkHasExpectedAttributes(view, marketingId, 'android');
        });
      });

      it('shows localized buttons for supported languages', function () {
        createView({ lang: 'de', marketingId });

        return view.render().then(() => {
          // de.png for play store
          assert.lengthOf(view.$('img[src*="/de."]'), 2);
        });
      });

      it('shows en-US buttons for unsupported languages', function () {
        createView({ lang: 'klingon', marketingId });

        return view.render().then(() => {
          // en.png for play store
          assert.lengthOf(view.$('img[src*="/en."]'), 2);
        });
      });

      it('shows high-res Android image to users with high-dpi displays', function () {
        createView({ marketingId });

        sinon.stub(view, '_isHighRes').callsFake(() => true);

        return view.render().then(() => {
          // en@2x.png for play store. (app store images are SVG)
          assert.lengthOf(view.$('img[src*="/en@2x.png"]'), 1);
        });
      });

      describe('_storeLink', () => {
        function testStoreLink(which) {
          it(`attaches the expected query parameters for ${which}`, () => {
            createView({ marketingId });

            const link = view._storeLink(Constants[which]);
            assert.include(link, `creative=${View.BUTTON_IDS[marketingId]}`);
            assert.include(link, 'campaign=fxa-conf-page');
          });
        }

        testStoreLink('DOWNLOAD_LINK_TEMPLATE_ANDROID');
        testStoreLink('DOWNLOAD_LINK_TEMPLATE_IOS');
      });

      it('use android pairing app', () => {
        createView({
          marketingId,
          which: View.WHICH.BOTH,
          useAndroidPairingApp: true,
        });

        return view.render().then(() => {
          assert.lengthOf(view.$('.marketing-link-ios'), 1);
          assert.lengthOf(view.$('.marketing-link-android'), 1);

          const link = view.$('.marketing-link-android').attr('href');
          assert.include(
            link,
            'https://play.google.com/store/apps/details?id=org.mozilla.firefox'
          );
        });
      });
    });
  }

  describe('a click on the marketing material', function () {
    it('is logged', function () {
      createView();

      return view
        .render()
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
