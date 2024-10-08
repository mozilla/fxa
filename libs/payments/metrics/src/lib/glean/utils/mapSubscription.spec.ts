/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { CartErrorReasonId } from '@fxa/shared/db/mysql/account';
import {
  CartMetricsFactory,
  CmsMetricsDataFactory,
  CommonMetricsFactory,
  CheckoutParamsFactory,
} from '../glean.factory';
import { mapSubscription } from './mapSubscription';

describe('mapSubscription', () => {
  it('should map all values', () => {
    const mockCommonData = CommonMetricsFactory({
      params: CheckoutParamsFactory(),
    });
    const mockCartData = CartMetricsFactory({
      couponCode: 'couponCode',
      errorReasonId: CartErrorReasonId.BASIC_ERROR,
    });
    const mockCmsMetricsData = CmsMetricsDataFactory();
    const result = mapSubscription({
      commonMetricsData: mockCommonData,
      cartMetricsData: mockCartData,
      cmsMetricsData: mockCmsMetricsData,
    });
    expect(result).toEqual({
      subscription_checkout_type: 'without-accounts',
      subscription_currency: mockCartData.currency,
      subscription_error_id: mockCartData.errorReasonId,
      subscription_interval: mockCommonData.params['interval'],
      subscription_offering_id: mockCommonData.params['offeringId'],
      subscription_payment_provider: '',
      subscription_plan_id: mockCmsMetricsData.priceId,
      subscription_product_id: mockCmsMetricsData.productId,
      subscription_promotion_code: mockCartData.couponCode,
      subscription_subscribed_plan_ids: '',
    });
  });

  it('should return empty strings if values are not present', () => {
    const mockCommonData = CommonMetricsFactory({
      params: {},
    });
    const mockCartData = CartMetricsFactory({
      currency: undefined,
      errorReasonId: null,
      couponCode: null,
    });
    const mockCmsMetricsData = CmsMetricsDataFactory({
      productId: undefined,
      priceId: undefined,
    });
    const result = mapSubscription({
      commonMetricsData: mockCommonData,
      cartMetricsData: mockCartData,
      cmsMetricsData: mockCmsMetricsData,
    });
    expect(result).toEqual({
      subscription_checkout_type: 'without-accounts',
      subscription_currency: '',
      subscription_error_id: '',
      subscription_interval: '',
      subscription_offering_id: '',
      subscription_payment_provider: '',
      subscription_plan_id: '',
      subscription_product_id: '',
      subscription_promotion_code: '',
      subscription_subscribed_plan_ids: '',
    });
  });
});
