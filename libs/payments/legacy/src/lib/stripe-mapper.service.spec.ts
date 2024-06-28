import { Stripe } from 'stripe';

import {
  ProductConfigurationManager,
  PurchaseWithDetailsOfferingContentUtil,
  PurchaseWithDetailsOfferingContentTransformedFactory,
  PurchaseDetailsTransformedFactory,
  StrapiClient,
} from '@fxa/shared/cms';
import { StripePlanFactory, StripeProductFactory } from '@fxa/payments/stripe';

import { StripeMapperService } from './stripe-mapper.service';
import { StripeMetadataWithCMSFactory } from './factories';

jest.useFakeTimers();

describe('StripeMapperService', () => {
  describe('mapCMSToStripePlans', () => {
    let stripeMapper: StripeMapperService;
    const mockCMSConfigUtil = {
      transformedPurchaseWithCommonContentForPlanId: jest.fn(),
    };

    beforeEach(() => {
      jest
        .spyOn(
          ProductConfigurationManager.prototype,
          'getPurchaseWithDetailsOfferingContentByPlanIds'
        )
        .mockResolvedValue(
          mockCMSConfigUtil as unknown as PurchaseWithDetailsOfferingContentUtil
        );
      const strapiClient = new StrapiClient({} as any, {} as any);
      const mockStatsd = {} as any;
      stripeMapper = new StripeMapperService(
        new ProductConfigurationManager(strapiClient, mockStatsd)
      );
    });

    it('should return stripe metadata with error due to plan.product not being an object', async () => {
      const validMetadata = StripeMetadataWithCMSFactory({
        webIconURL: 'https://example.com/webIconURL',
      });
      const stripePlan = StripePlanFactory({
        product: 'stringvalue',
        metadata: validMetadata,
      });
      const { mappedPlans, nonMatchingPlans } =
        await stripeMapper.mapCMSToStripePlans([stripePlan], 'en', false);
      expect(mappedPlans[0].metadata?.['webIconURL']).toBe(
        validMetadata.webIconURL
      );
      expect(nonMatchingPlans[0].split(' - ')[1]).toBe(
        'Plan product not expanded'
      );
    });

    it('should return stripe metadata with error due to missing cms data', async () => {
      mockCMSConfigUtil.transformedPurchaseWithCommonContentForPlanId = jest
        .fn()
        .mockReturnValueOnce(undefined);
      const validMetadata = StripeMetadataWithCMSFactory({
        webIconURL: 'https://example.com/webIconURL',
      });
      const stripePlan = StripePlanFactory() as Stripe.Plan;
      stripePlan.product = StripeProductFactory({
        metadata: validMetadata,
      });
      const { mappedPlans, nonMatchingPlans } =
        await stripeMapper.mapCMSToStripePlans([stripePlan], 'en', false);
      const actualProduct = mappedPlans[0].product as Stripe.Product;
      expect(actualProduct.metadata?.['webIconURL']).toBe(
        validMetadata.webIconURL
      );
      expect(nonMatchingPlans[0].split(' - ')[1]).toBe('No CMS config');
    });

    it('should return stripe metadata with error due to invalid fields in product.metadata', async () => {
      mockCMSConfigUtil.transformedPurchaseWithCommonContentForPlanId = jest
        .fn()
        .mockReturnValueOnce(
          PurchaseWithDetailsOfferingContentTransformedFactory()
        );
      const validMetadata = StripeMetadataWithCMSFactory({
        webIconURL: 'https://example.com/webIconURL',
      });
      const stripePlan = StripePlanFactory() as Stripe.Plan;
      stripePlan.product = StripeProductFactory({
        metadata: validMetadata,
      });
      const { mappedPlans, nonMatchingPlans } =
        await stripeMapper.mapCMSToStripePlans([stripePlan], 'en', false);
      const actualProduct = mappedPlans[0].product as Stripe.Product;
      expect(actualProduct.metadata?.['webIconURL']).toBe(
        validMetadata.webIconURL
      );
      expect(nonMatchingPlans[0].split(' - ')[1]).toBe('webIconURL');
    });

    it('should return stripe metadata with error due to invalid fields in plan.metadata', async () => {
      mockCMSConfigUtil.transformedPurchaseWithCommonContentForPlanId = jest
        .fn()
        .mockReturnValueOnce(
          PurchaseWithDetailsOfferingContentTransformedFactory()
        );
      const validMetadata = StripeMetadataWithCMSFactory({
        webIconURL: 'https://example.com/webIconURL',
      });
      const planOverrideMetadata = StripeMetadataWithCMSFactory({
        webIconURL: 'https://plan.override/emailIcon',
      });
      const stripePlan = StripePlanFactory({
        metadata: planOverrideMetadata,
      }) as Stripe.Plan;
      stripePlan.product = StripeProductFactory({
        metadata: validMetadata,
      });
      const { mappedPlans, nonMatchingPlans } =
        await stripeMapper.mapCMSToStripePlans([stripePlan], 'en', false);
      const actualProduct = mappedPlans[0].product as Stripe.Product;
      expect(actualProduct.metadata?.['webIconURL']).toBe(
        planOverrideMetadata.webIconURL
      );
      expect(nonMatchingPlans[0].split(' - ')[1]).toBe('webIconURL');
    });

    it('should return data from cms', async () => {
      const expected = PurchaseWithDetailsOfferingContentTransformedFactory();
      mockCMSConfigUtil.transformedPurchaseWithCommonContentForPlanId = jest
        .fn()
        .mockReturnValueOnce(expected);
      const productMetadata = {
        productSet: 'set',
        productOrder: 'order',
      };
      const stripePlan = StripePlanFactory() as Stripe.Plan;
      stripePlan.product = StripeProductFactory({
        metadata: productMetadata,
      });
      const { mappedPlans, nonMatchingPlans } =
        await stripeMapper.mapCMSToStripePlans([stripePlan], 'en', false);
      const actualProduct = mappedPlans[0].product as Stripe.Product;
      expect(mappedPlans[0].metadata?.['webIconURL']).toBe(
        expected.purchaseDetails.webIcon
      );
      expect(actualProduct.metadata?.['webIconURL']).toBe(
        expected.purchaseDetails.webIcon
      );
      expect(actualProduct.metadata?.['productSet']).toBe(
        productMetadata.productSet
      );
      expect(actualProduct.metadata?.['productOrder']).toBe(
        productMetadata.productOrder
      );
      expect(nonMatchingPlans).toHaveLength(0);
    });

    it('should return data from CMS and not error on locale plan', async () => {
      const expected = PurchaseWithDetailsOfferingContentTransformedFactory({
        purchaseDetails: PurchaseDetailsTransformedFactory({
          details: ['Detail 1 in English'],
        }),
      });
      mockCMSConfigUtil.transformedPurchaseWithCommonContentForPlanId = jest
        .fn()
        .mockReturnValue(expected);
      const productMetadata = {
        productSet: 'set',
        productOrder: 'order',
      };
      const product = StripeProductFactory({
        metadata: productMetadata,
      });
      const stripePlan1 = StripePlanFactory({
        metadata: StripeMetadataWithCMSFactory({
          'product:details:1': 'Detail 1 in English',
        }),
      }) as Stripe.Plan;
      stripePlan1.product = product;
      const stripePlan2 = StripePlanFactory({
        metadata: StripeMetadataWithCMSFactory({
          'product:details:1': 'Detail 1 in French',
          'product:details:2': 'Detail 2 in French',
        }),
      }) as Stripe.Plan;
      stripePlan2.product = product;

      const { mappedPlans, nonMatchingPlans } =
        await stripeMapper.mapCMSToStripePlans(
          [stripePlan1, stripePlan2],
          'en',
          false
        );

      expect(nonMatchingPlans).toHaveLength(0);
      const actualProduct1 = mappedPlans[0].product as Stripe.Product;
      const actualProduct2 = mappedPlans[1].product as Stripe.Product;
      expect(mappedPlans[0].metadata?.['product:details:1']).toBe(
        expected.purchaseDetails.details[0]
      );
      expect(actualProduct1.metadata?.['product:details:1']).toBe(
        expected.purchaseDetails.details[0]
      );
      expect(mappedPlans[1].metadata?.['product:details:1']).toBe(
        'Detail 1 in French'
      );
      expect(actualProduct2.metadata?.['product:details:1']).toBe(
        'Detail 1 in French'
      );
    });

    it('should return data from Stripe and concat errors for product', async () => {
      const expected = PurchaseWithDetailsOfferingContentTransformedFactory({
        purchaseDetails: PurchaseDetailsTransformedFactory({
          details: ['Detail 1 in English'],
        }),
      });
      mockCMSConfigUtil.transformedPurchaseWithCommonContentForPlanId = jest
        .fn()
        .mockReturnValue(expected);
      const productMetadata = {
        productSet: 'set',
        productOrder: 'order',
      };
      const product = StripeProductFactory({
        metadata: productMetadata,
      });
      const stripePlan1 = StripePlanFactory({
        metadata: StripeMetadataWithCMSFactory({
          'product:details:1': 'Detail 1 in German',
        }),
      }) as Stripe.Plan;
      stripePlan1.product = product;
      const stripePlan2 = StripePlanFactory({
        metadata: StripeMetadataWithCMSFactory({
          'product:details:1': 'Detail 1 in French',
          'product:details:2': 'Detail 2 in French',
        }),
      }) as Stripe.Plan;
      stripePlan2.product = product;

      const { mappedPlans, nonMatchingPlans } =
        await stripeMapper.mapCMSToStripePlans(
          [stripePlan1, stripePlan2],
          'en',
          false
        );

      expect(nonMatchingPlans[0].split(' - ')[1]).toBe(
        'product:details:1, product:details:2'
      );
      const actualProduct1 = mappedPlans[0].product as Stripe.Product;
      const actualProduct2 = mappedPlans[1].product as Stripe.Product;
      expect(mappedPlans[0].metadata?.['product:details:1']).toBe(
        'Detail 1 in German'
      );
      expect(actualProduct1.metadata?.['product:details:1']).toBe(
        'Detail 1 in German'
      );
      expect(mappedPlans[1].metadata?.['product:details:1']).toBe(
        'Detail 1 in French'
      );
      expect(actualProduct2.metadata?.['product:details:1']).toBe(
        'Detail 1 in French'
      );
      expect(mappedPlans[1].metadata?.['product:details:2']).toBe(
        'Detail 2 in French'
      );
      expect(actualProduct2.metadata?.['product:details:2']).toBe(
        'Detail 2 in French'
      );
    });
  });
});
