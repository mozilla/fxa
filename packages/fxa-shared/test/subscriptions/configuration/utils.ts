import 'chai';
import { assert } from 'chai';
import {
  mergeConfigs,
  mapPlanConfigsByPriceId,
} from '../../../subscriptions/configuration/utils';

describe('product configuration util functions', () => {
  const productCapabilities = {
    '*': ['product', 'plan'],
    abc123: ['product'],
    foo: ['wibble'],
  };
  const planCapabilities = {
    '*': ['plan'],
    '789xyz': ['plan'],
    foo: ['testo'],
  };
  const productUrls = {
    webIcon: 'product',
    emailIcon: 'product',
    termsOfService: 'product',
    termsOfServiceDownload: 'product',
    privacyNotice: 'product',
    privacyNoticeDownload: 'product',
    download: 'download',
  };
  const planUrls = {
    download: 'plan',
    emailIcon: 'plan',
    termsOfService: 'plan',
    termsOfServiceDownload: 'plan',
  };
  const productUiContent = {
    subtitle: 'subtitle',
    details: ['this', 'is', 'FxA'],
    successActionButtonLabel: 'great success',
    upgradeCTA: 'make it better',
  };
  const planUiContent = {
    details: ['this', 'is', '$ubPlat'],
    upgradeCTA: 'make it huge',
  };
  const productStyles = { webIconBackground: 'orange' };
  const planStyles = { webIconBackground: 'gray' };
  const productLocales = {
    es: { uiContent: { details: ['lol'] } },
    nl: { uiContent: { details: ['lol'] } },
  };
  const planLocales = {
    nl: { uiContent: { details: ['trolol'] } },
    de: { uiContent: { details: ['HGW'] } },
  };
  const productSupport = { app: ['windows', 'mac', 'SunOS'] };
  const planSupport = { app: ['SunOS', 'BSD'] };
  const productPromotionCodes = ['generous', 'very'];
  const planPromotionCodes = ['generous', 'insane'];

  const productConfig = {
    id: '001',
    active: true,
    productSet: 'testo',
    capabilities: productCapabilities,
    urls: productUrls,
    uiContent: productUiContent,
    styles: productStyles,
    locales: productLocales,
    support: productSupport,
    promotionCodes: productPromotionCodes,
  };
  const planConfig = {
    id: '0001',
    productConfigId: 'xyxyxyxy',
    active: true,
    productOrder: 3,
    capabilities: planCapabilities,
    urls: planUrls,
    uiContent: planUiContent,
    styles: planStyles,
    locales: planLocales,
    support: planSupport,
    promotionCodes: planPromotionCodes,
  };

  describe('mergeConfigs', () => {
    it('merges product configs into plans configs', () => {
      const expected = {
        id: '0001',
        productConfigId: 'xyxyxyxy',
        active: true,
        capabilities: {
          abc123: ['product'],
          '*': ['plan'],
          '789xyz': ['plan'],
          foo: ['testo'],
        },
        urls: {
          webIcon: 'product',
          privacyNotice: 'product',
          privacyNoticeDownload: 'product',
          download: 'plan',
          emailIcon: 'plan',
          termsOfService: 'plan',
          termsOfServiceDownload: 'plan',
        },
        uiContent: {
          subtitle: 'subtitle',
          successActionButtonLabel: 'great success',
          details: ['this', 'is', '$ubPlat'],
          upgradeCTA: 'make it huge',
        },
        styles: { webIconBackground: 'gray' },
        locales: {
          es: { uiContent: { details: ['lol'] } },
          nl: { uiContent: { details: ['trolol'] } },
          de: { uiContent: { details: ['HGW'] } },
        },
        support: planSupport,
        promotionCodes: ['generous', 'very', 'insane'],
        productSet: 'testo',
        productOrder: 3,
      };

      const actual = mergeConfigs(planConfig, productConfig);
      assert.deepEqual(actual, expected);
    });
  });

  describe('mapPlanConfigsByPriceId', () => {
    it('maps plans config by Stripe price ids', () => {
      const planConfigA = { ...planConfig, stripePriceId: 'a' };
      const planConfigB = { ...planConfig, stripePriceId: 'bb' };
      const expected = { a: planConfigA, bb: planConfigB };
      const actual = mapPlanConfigsByPriceId([planConfigA, planConfigB]);
      assert.deepEqual(actual, expected);
    });
  });
});
