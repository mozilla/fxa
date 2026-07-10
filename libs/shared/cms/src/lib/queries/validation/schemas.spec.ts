/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import {
  offeringValidationSchema,
  purchaseValidationSchema,
  purchaseDetailValidationSchema,
  commonContentValidationSchema,
  capabilityValidationSchema,
  serviceValidationSchema,
  subgroupValidationSchema,
  iapValidationSchema,
  churnInterventionValidationSchema,
  cancelInterstitialOfferValidationSchema,
  couponConfigValidationSchema,
} from './schemas';

import {
  CMSValidationOfferingFactory,
  CMSValidationPurchaseFactory,
  CMSValidationCapabilityFactory,
  CMSValidationChurnInterventionFactory
} from './factories';

describe('Validation Schemas', () => {
  describe('offeringValidationSchema', () => {
    it('accepts valid offering data', () => {
      const result = offeringValidationSchema.safeParse(CMSValidationOfferingFactory());
      expect(result.success).toBe(true);
    });

    it('rejects offering with null defaultPurchase', () => {
      const data = { ...CMSValidationOfferingFactory(), defaultPurchase: null };
      const result = offeringValidationSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects offering with null commonContent', () => {
      const data = { ...CMSValidationOfferingFactory(), commonContent: null };
      const result = offeringValidationSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects offering with empty capabilities', () => {
      const data = { ...CMSValidationOfferingFactory(), capabilities: [] };
      const result = offeringValidationSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects offering with empty countries', () => {
      const data = { ...CMSValidationOfferingFactory(), countries: [] };
      const result = offeringValidationSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects offering with missing apiIdentifier', () => {
      const data = { ...CMSValidationOfferingFactory(), apiIdentifier: '' };
      const result = offeringValidationSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('purchaseValidationSchema', () => {
    it('accepts valid purchase data', () => {
      const result = purchaseValidationSchema.safeParse(CMSValidationPurchaseFactory());
      expect(result.success).toBe(true);
    });

    it('rejects purchase with null purchaseDetails', () => {
      const data = { ...CMSValidationPurchaseFactory(), purchaseDetails: null };
      const result = purchaseValidationSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects purchase with empty stripePlanChoices', () => {
      const data = { ...CMSValidationPurchaseFactory(), stripePlanChoices: [] };
      const result = purchaseValidationSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects purchase with invalid stripePlanChoice format', () => {
      const data = {
        ...CMSValidationPurchaseFactory(),
        stripePlanChoices: [{ stripePlanChoice: 'invalid_format' }],
      };
      const result = purchaseValidationSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('purchaseDetailValidationSchema', () => {
    it('accepts valid purchase detail', () => {
      const result = purchaseDetailValidationSchema.safeParse({
        details: faker.lorem.sentence(),
        productName: faker.commerce.productName(),
        subtitle: null,
        webIcon: faker.internet.url(),
      });
      expect(result.success).toBe(true);
    });

    it('rejects purchase detail with empty productName', () => {
      const result = purchaseDetailValidationSchema.safeParse({
        details: faker.lorem.sentence(),
        productName: '',
        webIcon: faker.internet.url(),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('commonContentValidationSchema', () => {
    it('accepts valid common content', () => {
      const result = commonContentValidationSchema.safeParse(
        CMSValidationOfferingFactory().commonContent
      );
      expect(result.success).toBe(true);
    });

    it('rejects common content with missing supportUrl', () => {
      const commonContent = CMSValidationOfferingFactory().commonContent;
      delete (commonContent as Record<string, unknown>)['supportUrl'];
      const result = commonContentValidationSchema.safeParse(commonContent);
      expect(result.success).toBe(false);
    });
  });

  describe('capabilityValidationSchema', () => {
    it('accepts valid capability', () => {
      const result = capabilityValidationSchema.safeParse(CMSValidationCapabilityFactory());
      expect(result.success).toBe(true);
    });

    it('rejects capability with empty services', () => {
      const data = { ...CMSValidationCapabilityFactory(), services: [] };
      const result = capabilityValidationSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('serviceValidationSchema', () => {
    it('accepts valid service', () => {
      const result = serviceValidationSchema.safeParse({
        oauthClientId: faker.string.hexadecimal({ length: 16 }),
      });
      expect(result.success).toBe(true);
    });

    it('rejects service with empty oauthClientId', () => {
      const result = serviceValidationSchema.safeParse({ oauthClientId: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('subgroupValidationSchema', () => {
    it('accepts valid subgroup', () => {
      const result = subgroupValidationSchema.safeParse({
        internalName: faker.string.alpha(10),
        groupName: faker.string.alpha(10),
      });
      expect(result.success).toBe(true);
    });

    it('accepts subgroup with null groupName', () => {
      const result = subgroupValidationSchema.safeParse({
        internalName: faker.string.alpha(10),
        groupName: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('iapValidationSchema', () => {
    it('accepts valid IAP', () => {
      const result = iapValidationSchema.safeParse({
        storeID: faker.string.alphanumeric(10),
        interval: 'monthly',
        offering: { apiIdentifier: faker.string.alphanumeric(10) },
      });
      expect(result.success).toBe(true);
    });

    it('rejects IAP with null offering', () => {
      const result = iapValidationSchema.safeParse({
        storeID: faker.string.alphanumeric(10),
        interval: 'monthly',
        offering: null,
      });
      expect(result.success).toBe(false);
    });

    it('rejects IAP with invalid interval', () => {
      const result = iapValidationSchema.safeParse({
        storeID: faker.string.alphanumeric(10),
        interval: 'biweekly',
        offering: { apiIdentifier: faker.string.alphanumeric(10) },
      });
      expect(result.success).toBe(false);
    });
  });

  describe('churnInterventionValidationSchema', () => {
    it('accepts valid churn intervention', () => {
      const result = churnInterventionValidationSchema.safeParse(
        CMSValidationChurnInterventionFactory()
      );
      expect(result.success).toBe(true);
    });

    it('rejects churn intervention with invalid churnType', () => {
      const data = { ...CMSValidationChurnInterventionFactory(), churnType: 'invalid' };
      const result = churnInterventionValidationSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects churn intervention with discountAmount > 100', () => {
      const data = { ...CMSValidationChurnInterventionFactory(), discountAmount: 150 };
      const result = churnInterventionValidationSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('cancelInterstitialOfferValidationSchema', () => {
    it('accepts valid cancel interstitial offer', () => {
      const result = cancelInterstitialOfferValidationSchema.safeParse({
        offeringApiIdentifier: faker.string.alphanumeric(10),
        currentInterval: 'monthly',
        upgradeInterval: 'yearly',
        modalHeading1: faker.lorem.sentence(),
        modalMessage: faker.lorem.paragraph(),
        productPageUrl: faker.internet.url(),
        upgradeButtonLabel: faker.lorem.word(),
        upgradeButtonUrl: faker.internet.url(),
        offering: { stripeProductId: `prod_${faker.string.alphanumeric(14)}` },
      });
      expect(result.success).toBe(true);
    });

    it('rejects cancel interstitial offer with null offering', () => {
      const result = cancelInterstitialOfferValidationSchema.safeParse({
        offeringApiIdentifier: faker.string.alphanumeric(10),
        currentInterval: 'monthly',
        upgradeInterval: 'yearly',
        modalHeading1: faker.lorem.sentence(),
        modalMessage: faker.lorem.paragraph(),
        productPageUrl: faker.internet.url(),
        upgradeButtonLabel: faker.lorem.word(),
        upgradeButtonUrl: faker.internet.url(),
        offering: null,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('couponConfigValidationSchema', () => {
    it('accepts valid coupon config', () => {
      const result = couponConfigValidationSchema.safeParse({
        internalName: faker.string.alpha(10),
        stripePromotionCodes: [{ PromoCode: faker.string.alphanumeric(10) }],
      });
      expect(result.success).toBe(true);
    });

    it('accepts coupon config without promotion codes', () => {
      const result = couponConfigValidationSchema.safeParse({
        internalName: faker.string.alpha(10),
      });
      expect(result.success).toBe(true);
    });
  });
});
