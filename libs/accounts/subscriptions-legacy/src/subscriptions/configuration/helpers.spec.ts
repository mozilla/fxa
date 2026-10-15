/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  getPlanProductConfig,
  flattenProductConfigLocalesData,
  urlsFromProductConfig,
  uiContentFromProductConfig,
  productUpgradeFromProductConfig,
  webIconConfigFromProductConfig,
} from './helpers';
import {
  CONFIGURATION,
  CONFIGURATION_UI_CONTENT,
  CONFIGURATION_URLS,
  LOCALE_CONFIGURATION_FR,
  LOCALE_CONFIGURATION_NONE,
  PLAN,
  PLAN_WITH_CONFIGURATION,
  PLAN_WITH_METADATA,
} from '../fixtures/plans';

describe('subscriptions/configuration/helpers', () => {
  describe('getPlanProductConfig', () => {
    it('returns the plans configuration', () => {
      const actual = getPlanProductConfig(PLAN_WITH_CONFIGURATION);
      expect(actual).toStrictEqual(CONFIGURATION);
    });

    it('throws an error if plans has no configuration', () => {
      expect(() => getPlanProductConfig(PLAN)).toThrow(
        `Plan configuration not found. (${PLAN.plan_id})`
      );
    });
  });

  describe('flattenProductConfigLocalesData', () => {
    it('returns non-locale configuration', () => {
      const actual = flattenProductConfigLocalesData(PLAN_WITH_CONFIGURATION, [
        'en',
      ]);
      expect(actual).toStrictEqual(LOCALE_CONFIGURATION_NONE);
    });

    it('returns selected locale configuration', () => {
      const actual = flattenProductConfigLocalesData(PLAN_WITH_CONFIGURATION, [
        'fr',
      ]);
      expect(actual).toStrictEqual(LOCALE_CONFIGURATION_FR);
    });

    it('throws an error if plans has no configuration', () => {
      expect(() => flattenProductConfigLocalesData(PLAN)).toThrow(
        `Plan configuration not found. (${PLAN.plan_id})`
      );
    });
  });

  describe('urlsFromProductConfig', () => {
    it('returns url from plan configurations if featureFlag is true', () => {
      const actual = urlsFromProductConfig(
        PLAN_WITH_CONFIGURATION,
        ['de'],
        true
      );
      expect(actual).toBe(CONFIGURATION_URLS);
    });

    it('returns url from plan metadata if featureFlag is false', () => {
      const actual = urlsFromProductConfig(PLAN_WITH_METADATA, ['de'], false);
      expect(actual).toStrictEqual({
        termsOfService: 'https://example.org/en-US/terms',
        privacyNotice: 'https://example.org/en-US/privacy',
        termsOfServiceDownload: 'https://example.org/en-US/terms/download',
        privacyNoticeDownload: 'https://example.org/en-US/privacy/download',
        successActionButton: undefined,
        cancellationSurvey: undefined,
      });
    });

    it('throws an error if no plan configuration is available and featureFlag is true', () => {
      expect(() => urlsFromProductConfig(PLAN, ['de'], true)).toThrow(
        `Plan configuration not found. (${PLAN.plan_id})`
      );
    });
  });

  describe('webIconConfigFromProductConfig', () => {
    it('returns web icon from plan configurations if featureFlag is true', () => {
      const actual = webIconConfigFromProductConfig(
        PLAN_WITH_CONFIGURATION,
        ['de'],
        true
      );
      expect(actual).toStrictEqual({
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
      expect(actual).toStrictEqual({
        webIcon: PLAN_WITH_METADATA.plan_metadata?.webIconURL,
        webIconBackground: PLAN_WITH_METADATA.plan_metadata?.webIconBackground,
      });
    });

    it('prioritizes plan metadata over product metadata', () => {
      const actual = webIconConfigFromProductConfig(
        PLAN_WITH_METADATA,
        ['de'],
        false
      );
      expect(actual).toStrictEqual({
        webIcon: PLAN_WITH_METADATA.plan_metadata?.webIconURL,
        webIconBackground: PLAN_WITH_METADATA.plan_metadata?.webIconBackground,
      });
      expect(actual).not.toStrictEqual({
        webIcon: PLAN_WITH_METADATA.product_metadata?.webIconURL,
        webIconBackground:
          PLAN_WITH_METADATA.product_metadata?.webIconBackground,
      });
    });

    it('throws an error if no plan configuration is available and featureFlag is true', () => {
      expect(() => webIconConfigFromProductConfig(PLAN, ['de'], true)).toThrow(
        `Plan configuration not found. (${PLAN.plan_id})`
      );
    });
  });

  describe('uiContentFromProductConfig', () => {
    it('returns uiContent from plan configurations if featureFlag is true', () => {
      const actual = uiContentFromProductConfig(
        PLAN_WITH_CONFIGURATION,
        ['de'],
        true
      );
      expect(actual).toStrictEqual(CONFIGURATION_UI_CONTENT);
    });

    it('returns uiContent from plan metadata if featureFlag is false', () => {
      const actual = uiContentFromProductConfig(
        PLAN_WITH_METADATA,
        ['de'],
        false
      );
      expect(actual).toStrictEqual({
        subtitle: PLAN_WITH_METADATA.plan_metadata?.['product:subtitle'],
        details: [
          PLAN_WITH_METADATA.plan_metadata?.['product:details:1'],
          PLAN_WITH_METADATA.plan_metadata?.['product:details:2'],
          PLAN_WITH_METADATA.plan_metadata?.['product:details:3'],
          PLAN_WITH_METADATA.plan_metadata?.['product:details:4'],
        ],
        successActionButtonLabel:
          PLAN_WITH_METADATA.plan_metadata?.[
            'product:successActionButtonLabel'
          ],
        upgradeCTA: PLAN_WITH_METADATA.plan_metadata?.upgradeCTA,
      });
    });

    it('throws an error if no plan configuration is available and featureFlag is true', () => {
      expect(() => uiContentFromProductConfig(PLAN, ['de'], true)).toThrow(
        `Plan configuration not found. (${PLAN.plan_id})`
      );
    });
  });

  describe('productUpgradeFromProductConfig', () => {
    it('returns product update config from plan configurations if featureFlag is true', () => {
      const actual = productUpgradeFromProductConfig(
        PLAN_WITH_CONFIGURATION,
        true
      );
      expect(actual).toStrictEqual({
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
      expect(actual).toStrictEqual({
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
      expect(actual).toStrictEqual({
        productOrder: undefined,
        productSet: CONFIGURATION.productSet,
      });
    });

    it('returns product update config from plan metadata if featureFlag is false', () => {
      const actual = productUpgradeFromProductConfig(PLAN_WITH_METADATA, false);
      expect(actual).toStrictEqual({
        productOrder: PLAN_WITH_METADATA.plan_metadata?.productOrder,
        productSet: PLAN_WITH_METADATA.plan_metadata?.productSet.split(','),
      });
    });

    it('throws an error if no plan configuration is available and featureFlag is true', () => {
      expect(() => productUpgradeFromProductConfig(PLAN, true)).toThrow(
        `Plan configuration not found. (${PLAN.plan_id})`
      );
    });
  });
});
