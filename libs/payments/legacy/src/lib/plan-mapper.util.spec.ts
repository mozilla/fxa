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
import { StripeMetadataKeysForCMS } from './types';

describe('PlanMapperUtil', () => {
  const defaultCommonContent: OfferingCommonContentResult =
    OfferingCommonContentResultFactory();
  const defaultPurchaseDetails: PurchaseDetailsTransformed =
    PurchaseDetailsTransformedFactory();

  describe('getCMSForMetadataKey', () => {
    it('returns newsletterSlug joined and sorted', () => {
      const commonContent = {
        ...defaultCommonContent,
        newsletterSlug: ['snp', 'mdnplus', 'hubs'],
      };
      const mapper = new PlanMapperUtil(commonContent, defaultPurchaseDetails);
      const expected = 'hubs,mdnplus,snp';
      const actual = mapper.getCMSForMetadataKey(
        StripeMetadataKeysForCMS.NewsletterSlug
      );
      expect(actual).toBe(expected);
    });

    it('returns null when newsletterSlug is null', () => {
      const commonContent = {
        ...defaultCommonContent,
        newsletterSlug: null,
      };
      const mapper = new PlanMapperUtil(commonContent, defaultPurchaseDetails);
      const actual = mapper.getCMSForMetadataKey(
        StripeMetadataKeysForCMS.NewsletterSlug
      );
      expect(actual).toBe(null);
    });

    it('returns undefined for unknown key', () => {
      const mapper = new PlanMapperUtil(
        defaultCommonContent,
        defaultPurchaseDetails
      );
      const actual = mapper.getCMSForMetadataKey(
        'doesnotexist' as StripeMetadataKeysForCMS
      );
      expect(actual).toBe(undefined);
    });
  });

  describe('mapCMSToStripeMetadata', () => {
    it('builds metadata from CMS values, omitting null/undefined', () => {
      const mapper = new PlanMapperUtil(
        defaultCommonContent,
        defaultPurchaseDetails
      );
      const result = mapper.mapCMSToStripeMetadata();
      expect(result[StripeMetadataKeysForCMS.WebIcon]).toBe(
        defaultPurchaseDetails.webIcon
      );
      expect(result[StripeMetadataKeysForCMS.EmailIcon]).toBe(
        defaultCommonContent.emailIcon
      );
      expect(result[StripeMetadataKeysForCMS.ToS]).toBe(
        defaultCommonContent.termsOfServiceUrl
      );
    });
  });
});
