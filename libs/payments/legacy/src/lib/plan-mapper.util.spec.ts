import {
  OfferingCommonContentResult,
  PurchaseDetailsTransformed,
  OfferingCommonContentResultFactory,
  PurchaseDetailsTransformedFactory,
} from '@fxa/shared/contentful';
import { PlanMapperUtil } from './plan-mapper.util';
import { StripeMetadataWithContentfulFactory } from './factories';
import { StripeMetadataKeysForContentful } from './types';

describe('PlanMapperUtil', () => {
  const defaultCommonContent: OfferingCommonContentResult =
    OfferingCommonContentResultFactory();
  const defaultPurchaseDetails: PurchaseDetailsTransformed =
    PurchaseDetailsTransformedFactory();
  const stripeMetadata = StripeMetadataWithContentfulFactory({
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
        StripeMetadataKeysForContentful.DetailsLine1,
        undefined,
        null
      );
      expect(actual).toBe(expected);
      expect(defaultMapper.errorFields.length).toBe(0);
    });

    it('should return stripeValue and log error fieldname', () => {
      const testFieldName = StripeMetadataKeysForContentful.EmailIcon;
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

    it('should return contentfulValue if no stripeValue and contentful is available', () => {
      const testFieldName = StripeMetadataKeysForContentful.ToS;
      const expected = defaultCommonContent.termsOfServiceUrl;
      const actual = defaultMapper.mapField(
        testFieldName,
        stripeMetadata[testFieldName],
        defaultCommonContent.termsOfServiceUrl
      );
      expect(actual).toBe(expected);
      expect(defaultMapper.errorFields.length).toBe(0);
    });

    it('should return stripeValue as default', () => {
      const testFieldName = StripeMetadataKeysForContentful.WebIcon;
      const expected = stripeMetadata[testFieldName];
      const actual = defaultMapper.mapField(
        testFieldName,
        stripeMetadata[testFieldName],
        defaultPurchaseDetails.webIcon
      );
      expect(actual).toBe(expected);
      expect(defaultMapper.errorFields.length).toBe(0);
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
      const actual = defaultMapper.getContentfulForMetadataKey(
        StripeMetadataKeysForContentful.NewsletterSlug
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
      const actual = mapper.getContentfulForMetadataKey(
        StripeMetadataKeysForContentful.NewsletterSlug
      );
      expect(actual).toBe(expected);
    });

    it('should return undefined as default', () => {
      const expected = undefined;
      const actual = defaultMapper.getContentfulForMetadataKey(
        'doesnotexist' as StripeMetadataKeysForContentful
      );
      expect(actual).toBe(expected);
    });
  });

  describe('getContentfulForMetadataKey', () => {
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
        StripeMetadataKeysForContentful.NewsletterSlug
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
        StripeMetadataKeysForContentful.NewsletterSlug
      );
      expect(actual).toBe(expected);
    });
  });

  describe('mergeStripeAndContentful', () => {
    it('successfully maps contentful and stripe data', () => {
      const defaultMapper = new PlanMapperUtil(
        defaultCommonContent,
        defaultPurchaseDetails,
        stripeMetadata,
        false
      );
      const result = defaultMapper.mergeStripeAndContentful();
      expect(result.errorFields.length).toBe(1);
      expect(result.errorFields[0]).toBe('emailIconURL');
      expect(result.metadata.webIconURL).toBe(defaultPurchaseDetails.webIcon);
    });
  });
});
