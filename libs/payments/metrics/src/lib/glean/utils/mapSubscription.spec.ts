/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { CartErrorReasonId } from '@fxa/shared/db/mysql/account';
import {
  CmsMetricsDataFactory,
  FxaPaySetupViewMetricsFactory,
  ParamsFactory,
} from '../glean.factory';
import { mapSubscription } from './mapSubscription';

describe('mapSubscription', () => {
  it('should map all values', () => {
    const mockMetricsData = FxaPaySetupViewMetricsFactory({
      params: ParamsFactory(),
      couponCode: 'couponCode',
      errorReasonId: CartErrorReasonId.BASIC_ERROR,
    });
    const mockCmsMetricsData = CmsMetricsDataFactory();
    const result = mapSubscription({
      metricsData: mockMetricsData,
      cmsMetricsData: mockCmsMetricsData,
    });
    expect(result).toEqual({
      subscription_checkout_type: '',
      subscription_currency: mockMetricsData.currency,
      subscription_error_id: mockMetricsData.errorReasonId,
      subscription_interval: mockMetricsData.params['interval'],
      subscription_offering_id: mockMetricsData.params['offeringId'],
      subscription_payment_provider: '',
      subscription_plan_id: mockCmsMetricsData.priceId,
      subscription_product_id: mockCmsMetricsData.productId,
      subscription_promotion_code: mockMetricsData.couponCode,
      subscription_subscribed_plan_ids: '',
    });
  });

  it('should return empty strings if values are not present', () => {
    const mockMetricsData = FxaPaySetupViewMetricsFactory({
      params: {},
      currency: undefined,
      errorReasonId: null,
      couponCode: null,
    });
    const mockCmsMetricsData = CmsMetricsDataFactory({
      productId: undefined,
      priceId: undefined,
    });
    const result = mapSubscription({
      metricsData: mockMetricsData,
      cmsMetricsData: mockCmsMetricsData,
    });
    expect(result).toEqual({
      subscription_checkout_type: '',
      subscription_currency: '',
      subscription_error_id: '',
      subscription_interval: '',
      subscription_offering_id: '',
      subscription_payment_provider: '',
      subscription_plan_id: mockCmsMetricsData.priceId,
      subscription_product_id: mockCmsMetricsData.productId,
      subscription_promotion_code: '',
      subscription_subscribed_plan_ids: '',
    });
  });
});
