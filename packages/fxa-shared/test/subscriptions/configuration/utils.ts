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
import {
  CONFIGURATION,
  CONFIGURATION_UI_CONTENT,
  CONFIGURATION_URLS,
  LOCALE_CONFIGURATION_NONE,
  LOCALE_CONFIGURATION_FR,
  PLAN,
  PLAN_WITH_CONFIGURATION,
  PLAN_WITH_METADATA,
} from '../configuration/helpers';

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
    productSet: ['testo'],
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
    productSet: ['testo'],
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
    productSet: ['testo'],
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
      console.log('hi', actual, CONFIGURATION_URLS);
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

    it('prioritizes url from plan metadata over product_metadata', () => {
      const actual = urlsFromProductConfig(PLAN_WITH_METADATA, ['de'], false);
      expect(actual).to.deep.equal({
        termsOfService: 'https://example.org/en-US/terms',
        privacyNotice: 'https://example.org/en-US/privacy',
        termsOfServiceDownload: 'https://example.org/en-US/terms/download',
        privacyNoticeDownload: 'https://example.org/en-US/privacy/download',
        successActionButton: undefined,
        cancellationSurvey: undefined,
      });
      expect(actual).to.not.deep.equal({
        termsOfService: 'https://example.org/en-US/terms2',
        privacyNotice: 'https://example.org/en-US/privacy2',
        termsOfServiceDownload: 'https://example.org/en-US/terms/download2',
        privacyNoticeDownload: 'https://example.org/en-US/privacy/download2',
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
        webIcon: PLAN_WITH_METADATA.plan_metadata!.webIconURL,
        webIconBackground: PLAN_WITH_METADATA.plan_metadata!.webIconBackground,
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
        name: PLAN_WITH_METADATA.plan_metadata!['product:name'],
        subtitle: PLAN_WITH_METADATA.plan_metadata!['product:subtitle'],
        details: [
          PLAN_WITH_METADATA.plan_metadata!['product:details:1'],
          PLAN_WITH_METADATA.plan_metadata!['product:details:2'],
          PLAN_WITH_METADATA.plan_metadata!['product:details:3'],
          PLAN_WITH_METADATA.plan_metadata!['product:details:4'],
        ],
        successActionButtonLabel:
          PLAN_WITH_METADATA.plan_metadata!['product:successActionButtonLabel'],
        upgradeCTA: PLAN_WITH_METADATA.plan_metadata!.upgradeCTA,
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
        productOrder: PLAN_WITH_METADATA.plan_metadata!.productOrder,
        productSet: PLAN_WITH_METADATA.plan_metadata!.productSet.split(','),
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
