/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  OfferingCommonContentResult,
  PurchaseDetailsTransformed,
  OfferingCommonContentResultFactory,
  PurchaseDetailsTransformedFactory,
} from '@fxa/shared/cms';
import { PlanMapperUtil } from './plan-mapper.util';
import { StripeMetadataWithCMSFactory } from './factories';
import { StripeMetadataKeysForCMS } from './types';

describe('PlanMapperUtil', () => {
  const defaultCommonContent: OfferingCommonContentResult =
    OfferingCommonContentResultFactory();
  const defaultPurchaseDetails: PurchaseDetailsTransformed =
    PurchaseDetailsTransformedFactory();
  const stripeMetadata = StripeMetadataWithCMSFactory({
    emailIconURL: `${defaultCommonContent.emailIcon}/random/addition`,
    webIconURL: defaultPurchaseDetails.webIcon,
  });

  describe('mapField', () => {
    let defaultMapper: PlanMapperUtil;
    beforeEach(() => {
      defaultMapper = new PlanMapperUtil(
        defaultCommonContent,
        defaultPurchaseDetails,
        stripeMetadata,
        false
      );
    });

    it('should return stripeValue if neither is set', () => {
      const expected = undefined;
      const actual = defaultMapper.mapField(
        StripeMetadataKeysForCMS.DetailsLine1,
        undefined,
        null
      );
      expect(actual).toBe(expected);
      expect(defaultMapper.errorFields).toHaveLength(0);
    });

    it('should return stripeValue and log error fieldname', () => {
      const testFieldName = StripeMetadataKeysForCMS.EmailIcon;
      const expected = stripeMetadata[testFieldName];
      const actual = defaultMapper.mapField(
        testFieldName,
        stripeMetadata[testFieldName],
        defaultCommonContent.emailIcon
      );
      expect(actual).toBe(expected);
      expect(defaultMapper.errorFields.length).toBe(1);
      expect(defaultMapper.errorFields[0]).toBe(testFieldName);
    });

    it('should return cmsValue if no stripeValue and cms is available', () => {
      const testFieldName = StripeMetadataKeysForCMS.ToS;
      const expected = defaultCommonContent.termsOfServiceUrl;
      const actual = defaultMapper.mapField(
        testFieldName,
        stripeMetadata[testFieldName],
        defaultCommonContent.termsOfServiceUrl
      );
      expect(actual).toBe(expected);
      expect(defaultMapper.errorFields).toHaveLength(0);
    });

    it('should return stripeValue as default', () => {
      const testFieldName = StripeMetadataKeysForCMS.WebIcon;
      const expected = stripeMetadata[testFieldName];
      const actual = defaultMapper.mapField(
        testFieldName,
        stripeMetadata[testFieldName],
        defaultPurchaseDetails.webIcon
      );
      expect(actual).toBe(expected);
      expect(defaultMapper.errorFields).toHaveLength(0);
    });
  });

  describe('getStripeForMetadataKey', () => {
    const commonContent = {
      ...defaultCommonContent,
      newsletterSlug: ['snp', 'mdnplus', 'hubs'],
    };
    const defaultMapper = new PlanMapperUtil(
      commonContent,
      defaultPurchaseDetails,
      stripeMetadata,
      false
    );
    // Instead of having a test for each Stripe Metadata Key, only test
    // for keys with mapping logic, e.g. newsletterSlug
    it('should return newsletterSlug in expected format', () => {
      const expected = 'hubs,mdnplus,snp';
      const actual = defaultMapper.getCMSForMetadataKey(
        StripeMetadataKeysForCMS.NewsletterSlug
      );
      expect(actual).toBe(expected);
    });

    it('should return newsletterSlug in expected format', () => {
      const commonContent = {
        ...defaultCommonContent,
        newsletterSlug: null,
      };
      const mapper = new PlanMapperUtil(
        commonContent,
        defaultPurchaseDetails,
        stripeMetadata,
        false
      );
      const expected = null;
      const actual = mapper.getCMSForMetadataKey(
        StripeMetadataKeysForCMS.NewsletterSlug
      );
      expect(actual).toBe(expected);
    });

    it('should return undefined as default', () => {
      const expected = undefined;
      const actual = defaultMapper.getCMSForMetadataKey(
        'doesnotexist' as StripeMetadataKeysForCMS
      );
      expect(actual).toBe(expected);
    });
  });

  describe('getCMSForMetadataKey', () => {
    it('should return newsletterSlug in expected format', () => {
      const metadata = {
        newsletterSlug: 'snp,mdnplus,hubs',
      };
      const mapper = new PlanMapperUtil(
        defaultCommonContent,
        defaultPurchaseDetails,
        metadata,
        false
      );
      const expected = 'hubs,mdnplus,snp';
      const actual = mapper.getStripeForMetadataKey(
        StripeMetadataKeysForCMS.NewsletterSlug
      );
      expect(actual).toBe(expected);
    });

    it('should return undefined for undefined newsletterSlug', () => {
      const metadata = {};
      const mapper = new PlanMapperUtil(
        defaultCommonContent,
        defaultPurchaseDetails,
        metadata,
        false
      );
      const expected = undefined;
      const actual = mapper.getStripeForMetadataKey(
        StripeMetadataKeysForCMS.NewsletterSlug
      );
      expect(actual).toBe(expected);
    });
  });

  describe('mergeStripeAndCMS', () => {
    it('successfully maps cms and stripe data', () => {
      const defaultMapper = new PlanMapperUtil(
        defaultCommonContent,
        defaultPurchaseDetails,
        stripeMetadata,
        false
      );
      const result = defaultMapper.mergeStripeAndCMS();
      expect(result.errorFields.length).toBe(1);
      expect(result.errorFields[0]).toBe('emailIconURL');
      expect(result.metadata.webIconURL).toBe(defaultPurchaseDetails.webIcon);
    });
  });
});
