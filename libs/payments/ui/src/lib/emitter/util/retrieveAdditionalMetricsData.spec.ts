import { CartManager, ResultCartFactory } from '@fxa/payments/cart';
import { PriceManager } from '@fxa/payments/customer';
import {
  MockStripeConfigProvider,
  StripeClient,
  StripePriceFactory,
} from '@fxa/payments/stripe';
import {
  MockStrapiClientConfigProvider,
  ProductConfigurationManager,
  StrapiClient,
} from '@fxa/shared/cms';
import { MockFirestoreProvider } from '@fxa/shared/db/firestore';
import { MockAccountDatabaseNestFactory } from '@fxa/shared/db/mysql/account';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';
import { Test } from '@nestjs/testing';
import { retrieveAdditionalMetricsData } from './retrieveAdditionalData';
import { CheckoutParamsFactory } from '@fxa/payments/metrics';

const mockStripePlan = StripePriceFactory();
const mockCart = ResultCartFactory();

const expectedCmsMetricsData = {
  priceId: mockStripePlan.id,
  productId: mockStripePlan.product,
};
const expectedCartMetricsData = {
  uid: mockCart.uid,
  errorReasonId: mockCart.errorReasonId,
  couponCode: mockCart.couponCode,
  currency: mockCart.currency,
};

const emptyCmsMetricsData = {
  priceId: '',
  productId: '',
};
const emptyCartMetricsData = {
  uid: '',
  errorReasonId: null,
  couponCode: '',
  currency: '',
};

describe('retrieveAdditionalMetricsData', () => {
  let productConfigurationManager: ProductConfigurationManager;
  let cartManager: CartManager;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MockAccountDatabaseNestFactory,
        MockStrapiClientConfigProvider,
        MockStripeConfigProvider,
        MockFirestoreProvider,
        MockStatsDProvider,
        CartManager,
        StrapiClient,
        StripeClient,
        PriceManager,
        ProductConfigurationManager,
      ],
    }).compile();

    productConfigurationManager = moduleRef.get(ProductConfigurationManager);
    cartManager = moduleRef.get(CartManager);
  });

  describe('invalid params', () => {
    beforeEach(() => {
      jest
        .spyOn(productConfigurationManager, 'retrieveStripePrice')
        .mockResolvedValue(mockStripePlan);
      jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockCart);
    });

    it('should return empty CMS data on missing offeringId', async () => {
      const { cmsMetricsData } = await retrieveAdditionalMetricsData(
        productConfigurationManager,
        cartManager,
        {
          ...CheckoutParamsFactory(),
          offeringId: undefined,
        }
      );
      expect(
        productConfigurationManager.retrieveStripePrice
      ).not.toHaveBeenCalled();
      expect(cmsMetricsData).toEqual(emptyCmsMetricsData);
    });

    it('should return empty CMS data on missing interval', async () => {
      const { cmsMetricsData } = await retrieveAdditionalMetricsData(
        productConfigurationManager,
        cartManager,
        {
          ...CheckoutParamsFactory(),
          interval: undefined,
        }
      );
      expect(
        productConfigurationManager.retrieveStripePrice
      ).not.toHaveBeenCalled();
      expect(cmsMetricsData).toEqual(emptyCmsMetricsData);
    });

    it('should return empty CMS data on invalid interval', async () => {
      const { cmsMetricsData } = await retrieveAdditionalMetricsData(
        productConfigurationManager,
        cartManager,
        {
          ...CheckoutParamsFactory(),
          interval: 'invalidvalue',
        }
      );
      expect(
        productConfigurationManager.retrieveStripePrice
      ).not.toHaveBeenCalled();
      expect(cmsMetricsData).toEqual(emptyCmsMetricsData);
    });

    it('should return empty Cart data on missing cartId', async () => {
      const { cartMetricsData } = await retrieveAdditionalMetricsData(
        productConfigurationManager,
        cartManager,
        {
          ...CheckoutParamsFactory(),
          cartId: undefined,
        }
      );
      expect(cartManager.fetchCartById).not.toHaveBeenCalled();
      expect(cartMetricsData).toEqual(emptyCartMetricsData);
    });
  });

  describe('valid params', () => {
    beforeEach(() => {
      jest
        .spyOn(productConfigurationManager, 'retrieveStripePrice')
        .mockResolvedValue(mockStripePlan);
      jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockCart);
    });

    it('should return all additional metrics data', async () => {
      const { cmsMetricsData, cartMetricsData } =
        await retrieveAdditionalMetricsData(
          productConfigurationManager,
          cartManager,
          CheckoutParamsFactory()
        );
      expect(cmsMetricsData).toEqual(expectedCmsMetricsData);
      expect(cartMetricsData).toEqual(expectedCartMetricsData);
    });

    it('should return empty cms and cart data on cms error', async () => {
      jest
        .spyOn(productConfigurationManager, 'retrieveStripePrice')
        .mockRejectedValue(new Error('error'));

      const { cmsMetricsData, cartMetricsData } =
        await retrieveAdditionalMetricsData(
          productConfigurationManager,
          cartManager,
          CheckoutParamsFactory()
        );
      expect(
        productConfigurationManager.retrieveStripePrice
      ).toHaveBeenCalled();
      expect(cmsMetricsData).toEqual(emptyCmsMetricsData);
      expect(cartMetricsData).toEqual(expectedCartMetricsData);
    });

    it('should return cms metrics and empty cart on cart fetch error', async () => {
      jest
        .spyOn(cartManager, 'fetchCartById')
        .mockRejectedValue(new Error('error'));

      const { cmsMetricsData, cartMetricsData } =
        await retrieveAdditionalMetricsData(
          productConfigurationManager,
          cartManager,
          CheckoutParamsFactory()
        );
      expect(cartManager.fetchCartById).toHaveBeenCalled();
      expect(cmsMetricsData).toEqual(expectedCmsMetricsData);
      expect(cartMetricsData).toEqual(emptyCartMetricsData);
    });

    it('should return empty cms metrics and empty cart on cms and cart error', async () => {
      jest
        .spyOn(productConfigurationManager, 'retrieveStripePrice')
        .mockRejectedValue(new Error('error'));
      jest
        .spyOn(cartManager, 'fetchCartById')
        .mockRejectedValue(new Error('error'));

      const { cmsMetricsData, cartMetricsData } =
        await retrieveAdditionalMetricsData(
          productConfigurationManager,
          cartManager,
          CheckoutParamsFactory()
        );
      expect(
        productConfigurationManager.retrieveStripePrice
      ).toHaveBeenCalled();
      expect(cartManager.fetchCartById).toHaveBeenCalled();
      expect(cmsMetricsData).toEqual(emptyCmsMetricsData);
      expect(cartMetricsData).toEqual(emptyCartMetricsData);
    });
  });
});
