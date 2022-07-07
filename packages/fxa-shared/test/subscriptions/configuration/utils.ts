import { assert, expect } from 'chai';

import { PlanConfigurationDtoT } from '../../../dto/auth/payments/plan-configuration';
import {
  flattenProductConfigLocalesData,
  getPlanProductConfig,
  localizedPlanConfig,
  mapPlanConfigsByPriceId,
  mergeConfigs,
  productUpgradeFromProductConfig,
  uiContentFromProductConfig,
  urlsFromProductConfig,
  webIconConfigFromProductConfig,
} from '../../../subscriptions/configuration/utils';
import { Plan } from '../../../subscriptions/types';

const PLAN: Plan = {
  plan_id: 'plan_8675309',
  plan_name: '',
  product_id: 'prod_8675309',
  product_name: 'Example product',
  currency: 'usd',
  amount: 599,
  interval: 'month' as const,
  interval_count: 1,
  plan_metadata: null,
  product_metadata: null,
};

const PLAN_WITH_METADATA: Plan = {
  ...PLAN,
  plan_name: 'The Plan',
  product_metadata: {
    productSet: 'foo',
    productOrder: '2',
    webIconURL: 'https://example.org/webicon.png',
    webIconBackground: '#ffffff',
    upgradeCTA: 'upgradeCTA',
    'product:termsOfServiceURL': 'https://example.org/en-US/terms',
    'product:privacyNoticeURL': 'https://example.org/en-US/privacy',
    'product:termsOfServiceDownloadURL':
      'https://example.org/en-US/terms/download',
    'product:privacyNoticeDownloadURL':
      'https://example.org/en-US/privacy/download',
    'product:ignoreme': 'Unknown name here',
    'product:subtitle': 'Great Full-device VPN',
    'product:details:3': 'Baz Connects 5 devices with one subscription',
    'product:details:1': 'Foo Device-level encryption',
    'product:details:2': 'Bar Servers in 30+ countries',
    'product:details:4': 'Quux Available for Windows, iOS and Android',
    'product:successActionButtonLabel': 'Do something else',
    'product:subtitle:xx-pirate': 'VPN fer yer full-device',
    'product:foobar:9:xx-pirate': 'what even is this',
    'product:details:4:xx-pirate': "Available fer Windows, iOS an' Android",
    'product:details:1:xx-pirate': 'Device-level encryption arr',
    'product:details:3:xx-pirate': "Connects 5 devices wit' one subscription",
    'product:details:2:xx-pirate': 'Servers is 30+ countries matey',
    'product:termsOfServiceURL:xx-pirate':
      'https://example.org/xx-pirate/terms',
    'product:privacyNoticeURL:xx-pirate':
      'https://example.org/xx-pirate/privacy',
    'product:termsOfServiceDownloadURL:xx-pirate':
      'https://example.org/xx-pirate/terms/download',
    'product:privacyNoticeDownloadURL:xx-pirate':
      'https://example.org/xx-pirate/privacy/download',
    'product:successActionButtonLabel:xx-pirate': 'Yarr...',
    'product:subtitle:xx-partial': 'Partial localization',
    'product:termsOfServiceURL:xx-partial':
      'https://example.org/xx-partial/terms',
  },
};

const CONFIGURATION_URLS = {
  successActionButton: 'https://download',
  privacyNotice: 'https://privacynotice',
  termsOfService: 'httsp://termsofservice',
  termsOfServiceDownload: 'https://termsofservicedownload',
  webIcon: 'https://webicon',
};

const CONFIGURATION_UI_CONTENT = {
  successActionButtonLabel: 'Success Label',
  subtitle: 'VPN Subtitle',
  details: ['Detail line 1', 'Detail line 2', 'Detail line 3'],
  upgradeCTA: 'Upgrade',
};

const LOCALE_CONFIGURATION_NONE = {
  urls: CONFIGURATION_URLS,
  uiContent: CONFIGURATION_UI_CONTENT,
  support: {},
};

const LOCALE_CONFIGURATION_FR = {
  urls: {
    successActionButton: 'https://download/fr',
    privacyNotice: 'https://privacynotice/fr',
    termsOfService: 'httsp://termsofservice/fr',
    termsOfServiceDownload: 'https://termsofservicedownload/fr',
    webIcon: 'https://webicon/fr',
  },
  uiContent: {
    successActionButtonLabel: 'Success Label - FR',
    subtitle: 'VPN Subtitle - FR',
    details: ['Detail line 1 - FR', 'Detail line 2 - FR', 'Detail line 3 - FR'],
    upgradeCTA: 'Upgrade - FR',
  },
  support: {},
};

const LOCALE_CONFIGURATION_ENUS = {
  urls: {
    download: 'https://download/enUS',
    privacyNotice: 'https://privacynotice/enUS',
    termsOfService: 'httsp://termsofservice/enUS',
    termsOfServiceDownload: 'https://termsofservicedownload/enUS',
    webIcon: 'https://webicon/enUS',
  },
  uiContent: {
    successActionButtonLabel: 'Success Label - enUS',
    subtitle: 'VPN Subtitle - enUS',
    details: [
      'Detail line 1 - enUS',
      'Detail line 2 - enUS',
      'Detail line 3 - enUS',
    ],
    upgradeCTA: 'Upgrade - enUS',
  },
  support: {},
};

const CONFIGURATION: PlanConfigurationDtoT = {
  ...LOCALE_CONFIGURATION_NONE,
  locales: {
    fr: LOCALE_CONFIGURATION_FR,
    enUS: LOCALE_CONFIGURATION_ENUS,
  },
  styles: {
    webIconBackground: 'webbackgroundfr',
  },
  productSet: 'Set 1',
  productOrder: 1,
};

const PLAN_WITH_CONFIGURATION: Plan = {
  ...PLAN,
  plan_name: 'Plan Name',
  plan_metadata: {},
  product_metadata: {},
  configuration: CONFIGURATION,
};

const missingPlanConfigMessage = (planId: string) =>
  `Plan configuration for ${planId} not found.`;

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
    successActionButton: 'download',
  };
  const planUrls = {
    successActionButton: 'plan',
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
  const fullMergedConfig = {
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
      successActionButton: 'plan',
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

  describe('mergeConfigs', () => {
    it('merges product configs into plans configs', () => {
      const actual = mergeConfigs(planConfig, productConfig);
      assert.deepEqual(actual, fullMergedConfig);
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

  describe('getPlanProductConfig', () => {
    it('returns the plans configuration', () => {
      const actual = getPlanProductConfig(PLAN_WITH_CONFIGURATION);
      expect(actual).to.deep.equal(CONFIGURATION);
    });

    it('throws an error if plans has no configuration', () => {
      try {
        getPlanProductConfig(PLAN);
        assert.fail();
      } catch (err) {
        expect(err.message).to.equal(missingPlanConfigMessage(PLAN.plan_id));
      }
    });
  });

  describe('flattenProductConfigLocalesData', () => {
    it('returns non-locale configuration', () => {
      const actual = flattenProductConfigLocalesData(PLAN_WITH_CONFIGURATION, [
        'en',
      ]);
      expect(actual).to.deep.equal(LOCALE_CONFIGURATION_NONE);
    });

    it('returns selected locale configuration', () => {
      const actual = flattenProductConfigLocalesData(PLAN_WITH_CONFIGURATION, [
        'fr',
      ]);
      expect(actual).to.deep.equal(LOCALE_CONFIGURATION_FR);
    });

    it('throws an error if plans has no configuration', () => {
      try {
        flattenProductConfigLocalesData(PLAN);
        assert.fail();
      } catch (err) {
        expect(err.message).to.equal(missingPlanConfigMessage(PLAN.plan_id));
      }
    });
  });

  describe('urlsFromProductConfig', () => {
    it('returns url from plan configurations if featureFlag is true', () => {
      const actual = urlsFromProductConfig(
        PLAN_WITH_CONFIGURATION,
        ['de'],
        true
      );
      expect(actual).to.equal(CONFIGURATION_URLS);
    });

    it('returns url from plan metadata if featureFlag is false', () => {
      const actual = urlsFromProductConfig(PLAN_WITH_METADATA, ['de'], false);
      expect(actual).to.deep.equal({
        termsOfService: 'https://example.org/en-US/terms',
        privacyNotice: 'https://example.org/en-US/privacy',
        termsOfServiceDownload: 'https://example.org/en-US/terms/download',
        privacyNoticeDownload: 'https://example.org/en-US/privacy/download',
        successActionButton: undefined,
        cancellationSurvey: undefined,
      });
    });

    it('throws an error if no plan configuration is available and featureFlag is true', () => {
      try {
        urlsFromProductConfig(PLAN, ['de'], true);
        assert.fail();
      } catch (err) {
        expect(err.message).to.equal(missingPlanConfigMessage(PLAN.plan_id));
      }
    });
  });

  describe('webIconConfigFromProductConfig', () => {
    it('returns web icon from plan configurations if featureFlag is true', () => {
      const actual = webIconConfigFromProductConfig(
        PLAN_WITH_CONFIGURATION,
        ['de'],
        true
      );
      expect(actual).to.deep.equal({
        webIcon: CONFIGURATION_URLS.webIcon,
        webIconBackground: CONFIGURATION.styles.webIconBackground,
      });
    });

    it('returns web icon from plan metadata if featureFlag is false', () => {
      const actual = webIconConfigFromProductConfig(
        PLAN_WITH_METADATA,
        ['de'],
        false
      );
      expect(actual).to.deep.equal({
        webIcon: PLAN_WITH_METADATA.product_metadata!.webIconURL,
        webIconBackground:
          PLAN_WITH_METADATA.product_metadata!.webIconBackground,
      });
    });

    it('throws an error if no plan configuration is available and featureFlag is true', () => {
      try {
        webIconConfigFromProductConfig(PLAN, ['de'], true);
        assert.fail();
      } catch (err) {
        expect(err.message).to.equal(missingPlanConfigMessage(PLAN.plan_id));
      }
    });
  });

  describe('uiContentFromProductConfig', () => {
    it('returns uiContent from plan configurations if featureFlag is true', () => {
      const actual = uiContentFromProductConfig(
        PLAN_WITH_CONFIGURATION,
        ['de'],
        true
      );
      expect(actual).to.deep.equal(CONFIGURATION_UI_CONTENT);
    });

    it('returns uiContent from plan metadata if featureFlag is false', () => {
      const actual = uiContentFromProductConfig(
        PLAN_WITH_METADATA,
        ['de'],
        false
      );
      expect(actual).to.deep.equal({
        subtitle: PLAN_WITH_METADATA.product_metadata!['product:subtitle'],
        details: [
          PLAN_WITH_METADATA.product_metadata!['product:details:1'],
          PLAN_WITH_METADATA.product_metadata!['product:details:2'],
          PLAN_WITH_METADATA.product_metadata!['product:details:3'],
          PLAN_WITH_METADATA.product_metadata!['product:details:4'],
        ],
        successActionButtonLabel:
          PLAN_WITH_METADATA.product_metadata![
            'product:successActionButtonLabel'
          ],
        upgradeCTA: PLAN_WITH_METADATA.product_metadata!.upgradeCTA,
      });
    });

    it('throws an error if no plan configuration is available and featureFlag is true', () => {
      try {
        uiContentFromProductConfig(PLAN, ['de'], true);
        assert.fail();
      } catch (err) {
        expect(err.message).to.equal(missingPlanConfigMessage(PLAN.plan_id));
      }
    });
  });

  describe('productUpgradeFromProductConfig', () => {
    it('returns product update config from plan configurations if featureFlag is true', () => {
      const actual = productUpgradeFromProductConfig(
        PLAN_WITH_CONFIGURATION,
        true
      );
      expect(actual).to.deep.equal({
        productOrder: `${CONFIGURATION.productOrder}`,
        productSet: CONFIGURATION.productSet,
      });
    });

    it('returns product update config from plan configurations if featureFlag is true and productOrder 0', () => {
      const actual = productUpgradeFromProductConfig(
        {
          ...PLAN_WITH_CONFIGURATION,
          configuration: {
            ...CONFIGURATION,
            productOrder: 0,
          },
        },
        true
      );
      expect(actual).to.deep.equal({
        productOrder: '0',
        productSet: CONFIGURATION.productSet,
      });
    });

    it('returns product update config from plan configurations if featureFlag is true and productOrder undefined', () => {
      const actual = productUpgradeFromProductConfig(
        {
          ...PLAN_WITH_CONFIGURATION,
          configuration: {
            ...CONFIGURATION,
            productOrder: undefined,
          },
        },
        true
      );
      expect(actual).to.deep.equal({
        productOrder: undefined,
        productSet: CONFIGURATION.productSet,
      });
    });

    it('returns product update config from plan metadata if featureFlag is false', () => {
      const actual = productUpgradeFromProductConfig(PLAN_WITH_METADATA, false);
      expect(actual).to.deep.equal({
        productOrder: PLAN_WITH_METADATA.product_metadata!.productOrder,
        productSet: PLAN_WITH_METADATA.product_metadata!.productSet,
      });
    });

    it('throws an error if no plan configuration is available and featureFlag is true', () => {
      try {
        productUpgradeFromProductConfig(PLAN, true);
        assert.fail();
      } catch (err) {
        expect(err.message).to.equal(missingPlanConfigMessage(PLAN.plan_id));
      }
    });
  });

  describe('localizedPlanConfig', () => {
    const defaults = {
      uiContent: fullMergedConfig.uiContent,
      urls: fullMergedConfig.urls,
      support: fullMergedConfig.support,
    };

    it('returns the defaults when no other locales are available', () => {
      const actual = localizedPlanConfig(fullMergedConfig, []);
      assert.deepEqual(actual, defaults);
    });

    it('returns the defaults if the picked lang is not one of the available locales', () => {
      const actual = localizedPlanConfig(fullMergedConfig, ['no']);
      assert.deepEqual(actual, defaults);
    });

    it('returns the localized config of the picked lang', () => {
      const extraConfig = {
        ...fullMergedConfig,
        locales: { ...fullMergedConfig.locales, fr: LOCALE_CONFIGURATION_FR },
      };
      const actual = localizedPlanConfig(extraConfig, ['fr']);
      assert.deepEqual(actual, {
        ...LOCALE_CONFIGURATION_FR,
        support: {
          ...fullMergedConfig.support,
          ...LOCALE_CONFIGURATION_FR.support,
        },
        urls: { ...fullMergedConfig.urls, ...LOCALE_CONFIGURATION_FR.urls },
      });
    });
  });
});
