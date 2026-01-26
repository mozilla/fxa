/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import {
  getSubplatIntervalFromSubscription,
  type CustomerManager,
  type SubscriptionManager,
} from '@fxa/payments/customer';
import { ProductConfigurationManager } from '@fxa/shared/cms';
import type {
  AccountsMetricsData,
  CommonMetrics,
  ExperimentationData,
  SessionMetricsData,
  StripeMetricsData,
  SubPlatCmsMetricsData,
} from '../glean/glean.types';
import type { AccountManager } from '@fxa/shared/account/account';
import { getPriceFromSubscription } from 'libs/payments/customer/src/lib/util/getPriceFromSubscription';
import { getNimbusUserId } from './retrieveNimbusUserId';
import type { NimbusManager } from '@fxa/payments/experiments';

export async function retrieveSubManageMetricsData(
  subscriptionManager: SubscriptionManager,
  customerManager: CustomerManager,
  productConfigurationManager: ProductConfigurationManager,
  accountManager: AccountManager,
  nimbusManager: NimbusManager,
  commonMetrics: CommonMetrics,
  uid: string,
  subscriptionId?: string
) {
  const stripeMetricsData: StripeMetricsData = {
    customerId: '',
    couponCode: '',
    currency: '',
    taxAddress: { countryCode: '', postalCode: '' },
    productId: '',
    priceId: '',
  };
  const accountsMetricsData: AccountsMetricsData = {
    uid: '',
    metricsOptOut: true,
    locale: '',
  };
  const subplatCmsMetricsData: SubPlatCmsMetricsData = {
    offeringId: '',
    interval: '',
  };
  const sessionMetricsData: SessionMetricsData = {
    locale: '',
    ipAddress: '',
    deviceType: '',
    userAgent: '',
  };
  const experimentationMetricsData: ExperimentationData = {
    nimbusUserId: '',
  };

  const params = commonMetrics.params;
  if (params['locale']) {
    sessionMetricsData.locale = params['locale'];
  }
  sessionMetricsData.ipAddress = commonMetrics.ipAddress;
  sessionMetricsData.deviceType = commonMetrics.deviceType;
  sessionMetricsData.userAgent = commonMetrics.userAgent;

  const accountsPromise = await accountManager.getAccounts([uid]);
  const subscriptionDataPromise = subscriptionId
    ? subscriptionManager.retrieve(subscriptionId)
    : Promise.reject(new Error('subscriptionId not provided'));

  const [accountsResult, subscriptionResult] = await Promise.allSettled([
    accountsPromise,
    subscriptionDataPromise,
  ]);

  if (subscriptionResult.status === 'fulfilled') {
    const subscription = subscriptionResult.value;
    try {
      const price = getPriceFromSubscription(subscription);
      const cms = await productConfigurationManager.getPageContentByPriceIds([
        price.id,
      ]);
      const customer = await customerManager.retrieve(subscription.customer);

      stripeMetricsData.customerId = customer.id;
      stripeMetricsData.priceId = price.id;
      stripeMetricsData.productId = price.product;

      if (customer.currency) {
        stripeMetricsData.currency = customer.currency;
      }
      if (
        customer.shipping?.address?.country &&
        customer.shipping.address.postal_code
      ) {
        stripeMetricsData.taxAddress = {
          countryCode: customer.shipping.address.country,
          postalCode: customer.shipping.address.postal_code,
        };
      }

      if (subscription.discount?.coupon.id) {
        stripeMetricsData.couponCode = subscription.discount.coupon.id;
      }

      const interval = getSubplatIntervalFromSubscription(subscription);
      const offeringId = cms.purchases.at(0)?.offering.apiIdentifier;

      if (offeringId) {
        subplatCmsMetricsData.offeringId = offeringId;
      }
      if (interval) {
        subplatCmsMetricsData.interval = interval;
      }
    } catch (error) {}
  }

  if (accountsResult.status === 'fulfilled') {
    const account = accountsResult.value.at(0);
    if (account) {
      if (account.locale) {
        accountsMetricsData.locale = account.locale;
      }
      accountsMetricsData.metricsOptOut = account.metricsOptOutAt !== null;
    }
  }

  const { nimbusUserId } = await getNimbusUserId(nimbusManager, {
    uid,
    language: sessionMetricsData.locale,
    region: stripeMetricsData.taxAddress.countryCode,
    experimentationId: commonMetrics.experimentationId,
    experimentationPreview:
      commonMetrics?.searchParams?.['experimentationPreview'] === 'true',
  });

  experimentationMetricsData.nimbusUserId = nimbusUserId;

  return {
    stripeMetricsData,
    accountsMetricsData,
    cmsData: subplatCmsMetricsData,
    sessionMetricsData,
    experimentationMetricsData,
  };
}
