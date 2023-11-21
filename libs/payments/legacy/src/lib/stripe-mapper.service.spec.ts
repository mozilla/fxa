import { Stripe } from 'stripe';
import {
  ContentfulClient,
  PurchaseWithDetailsOfferingContentUtil,
  ContentfulManager,
  PurchaseWithDetailsOfferingContentTransformedFactory,
} from '@fxa/shared/contentful';
import { StripeMapperService } from './stripe-mapper.service';
import { ProductFactory, PlanFactory } from '@fxa/payments/stripe';
import { StripeMetadataWithContentfulFactory } from './factories';

describe('StripeMapperService', () => {
  describe('mapContentfulToStripePlans', () => {
    let stripeMapper: StripeMapperService;
    const mockContentfulConfigUtil = {
      transformedPurchaseWithCommonContentForPlanId: jest.fn(),
    };

    beforeEach(() => {
      jest
        .spyOn(
          ContentfulManager.prototype,
          'getPurchaseWithDetailsOfferingContentByPlanIds'
        )
        .mockResolvedValue(
          mockContentfulConfigUtil as unknown as PurchaseWithDetailsOfferingContentUtil
        );
      const contentfulClient = {} as ContentfulClient;
      stripeMapper = new StripeMapperService(
        new ContentfulManager(contentfulClient)
      );
    });

    it('should return stripe metadata with error due to plan.product not being an object', async () => {
      const validMetadata = StripeMetadataWithContentfulFactory({
        webIconURL: 'https://example.com/webIconURL',
      });
      const stripePlan = PlanFactory({
        product: 'stringvalue',
        metadata: validMetadata,
      });
      const { mappedPlans, nonMatchingPlans } =
        await stripeMapper.mapContentfulToStripePlans([stripePlan], 'en');
      expect(mappedPlans[0].metadata?.['webIconURL']).toBe(
        validMetadata.webIconURL
      );
      expect(nonMatchingPlans[0].split(' - ')[1]).toBe(
        'Plan product not expanded'
      );
    });

    it('should return stripe metadata with error due to missing contentful data', async () => {
      mockContentfulConfigUtil.transformedPurchaseWithCommonContentForPlanId =
        jest.fn().mockReturnValueOnce(undefined);
      const validMetadata = StripeMetadataWithContentfulFactory({
        webIconURL: 'https://example.com/webIconURL',
      });
      const stripePlan = PlanFactory({
        product: ProductFactory({
          metadata: validMetadata,
        }),
      });
      const { mappedPlans, nonMatchingPlans } =
        await stripeMapper.mapContentfulToStripePlans([stripePlan], 'en');
      const actualProduct = mappedPlans[0].product as Stripe.Product;
      expect(actualProduct.metadata?.['webIconURL']).toBe(
        validMetadata.webIconURL
      );
      expect(nonMatchingPlans[0].split(' - ')[1]).toBe('No Contentful config');
    });

    it('should return stripe metadata with error due to invalid fields in product.metadata', async () => {
      mockContentfulConfigUtil.transformedPurchaseWithCommonContentForPlanId =
        jest
          .fn()
          .mockReturnValueOnce(
            PurchaseWithDetailsOfferingContentTransformedFactory()
          );
      const validMetadata = StripeMetadataWithContentfulFactory({
        webIconURL: 'https://example.com/webIconURL',
      });
      const stripePlan = PlanFactory({
        product: ProductFactory({
          metadata: validMetadata,
        }),
      });
      const { mappedPlans, nonMatchingPlans } =
        await stripeMapper.mapContentfulToStripePlans([stripePlan], 'en');
      const actualProduct = mappedPlans[0].product as Stripe.Product;
      expect(actualProduct.metadata?.['webIconURL']).toBe(
        validMetadata.webIconURL
      );
      expect(nonMatchingPlans[0].split(' - ')[1]).toBe('webIconURL');
    });

    it('should return stripe metadata with error due to invalid fields in plan.metadata', async () => {
      mockContentfulConfigUtil.transformedPurchaseWithCommonContentForPlanId =
        jest
          .fn()
          .mockReturnValueOnce(
            PurchaseWithDetailsOfferingContentTransformedFactory()
          );
      const validMetadata = StripeMetadataWithContentfulFactory({
        webIconURL: 'https://example.com/webIconURL',
      });
      const planOverrideMetadata = StripeMetadataWithContentfulFactory({
        webIconURL: 'https://plan.override/emailIcon',
      });
      const stripePlan = PlanFactory({
        product: ProductFactory({
          metadata: validMetadata,
        }),
        metadata: planOverrideMetadata,
      });
      const { mappedPlans, nonMatchingPlans } =
        await stripeMapper.mapContentfulToStripePlans([stripePlan], 'en');
      const actualProduct = mappedPlans[0].product as Stripe.Product;
      expect(actualProduct.metadata?.['webIconURL']).toBe(
        planOverrideMetadata.webIconURL
      );
      expect(nonMatchingPlans[0].split(' - ')[1]).toBe('webIconURL');
    });

    it('should return data from contentful', async () => {
      const expected = PurchaseWithDetailsOfferingContentTransformedFactory();
      mockContentfulConfigUtil.transformedPurchaseWithCommonContentForPlanId =
        jest.fn().mockReturnValueOnce(expected);
      const productMetadata = {
        productSet: 'set',
        productOrder: 'order',
      };
      const stripePlan = PlanFactory({
        product: ProductFactory({
          metadata: productMetadata,
        }),
      });
      const { mappedPlans, nonMatchingPlans } =
        await stripeMapper.mapContentfulToStripePlans([stripePlan], 'en');
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
      expect(nonMatchingPlans.length).toBe(0);
    });
  });
});
