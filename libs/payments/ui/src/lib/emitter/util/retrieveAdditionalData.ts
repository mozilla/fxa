/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { CartManager } from '@fxa/payments/cart';
import { SubplatInterval } from '@fxa/payments/customer';
import { ProductConfigurationManager } from '@fxa/shared/cms';
import { AdditionalMetricsData } from '../emitter.types';

export async function retrieveAdditionalMetricsData(
  productConfigurationManager: ProductConfigurationManager,
  cartManager: CartManager,
  params: Record<string, string | undefined>
): Promise<AdditionalMetricsData> {
  const offeringId = params['offeringId'];
  const interval = params['interval'];
  const cartId = params['cartId'];

  const cmsDataPromise =
    offeringId &&
    interval &&
    Object.values(SubplatInterval).includes(interval as SubplatInterval)
      ? productConfigurationManager.retrieveStripePrice(
          offeringId,
          interval as SubplatInterval
        )
      : Promise.reject(
          new Error('Offering Id and Interval as SubplatInterval are required')
        );
  const cartDataPromise = cartId
    ? cartManager.fetchCartById(cartId)
    : Promise.reject(new Error('cartId is required'));

  const [cmsData, cartData] = await Promise.allSettled([
    cmsDataPromise,
    cartDataPromise,
  ]);

  const cmsMetricsData =
    cmsData.status === 'fulfilled'
      ? {
          priceId: cmsData.value.id,
          productId: cmsData.value.product,
        }
      : {
          priceId: '',
          productId: '',
        };

  const cartMetricsData =
    cartData.status === 'fulfilled'
      ? {
          uid: cartData.value.uid,
          errorReasonId: cartData.value.errorReasonId,
          couponCode: cartData.value.couponCode,
          currency: cartData.value.currency,
        }
      : {
          uid: '',
          errorReasonId: null,
          couponCode: '',
          currency: '',
        };

  return {
    cmsMetricsData,
    cartMetricsData,
  };
}
