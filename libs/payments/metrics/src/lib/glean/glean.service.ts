/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  getSubplatIntervalFromSubscription,
  CustomerManager,
  SubscriptionManager,
} from '@fxa/payments/customer';
import { NimbusManager } from '@fxa/payments/experiments';
import { AccountManager } from '@fxa/shared/account/account';
import {
  PageContentByPriceIdsResultUtil,
  ProductConfigurationManager,
} from '@fxa/shared/cms';
import type {
  AccountsMetricsData,
  CommonMetrics,
  ExperimentationData,
  GenericGleanSubManageEvent,
  GleanMetricsData,
  SessionMetricsData,
  StripeMetricsData,
  SubPlatCmsMetricsData,
} from './glean.types';
import type {
  StripeCustomer,
  StripePrice,
  StripeSubscription,
} from '@fxa/payments/stripe';
import { getPriceFromSubscription } from 'libs/payments/customer/src/lib/util/getPriceFromSubscription';
import { PaymentsGleanManager } from './glean.manager';
import { Logger, Injectable } from '@nestjs/common';

@Injectable()
export class PaymentsGleanService {
  constructor(
    private accountManager: AccountManager,
    private customerManager: CustomerManager,
    private log: Logger,
    private nimbusManager: NimbusManager,
    private paymentsGleanManager: PaymentsGleanManager,
    private productConfigurationManager: ProductConfigurationManager,
    private subscriptionManager: SubscriptionManager
  ) {}

  mapStripeMetricsData(
    customer?: StripeCustomer,
    price?: StripePrice,
    subscription?: StripeSubscription
  ): StripeMetricsData {
    const taxAddress =
      customer?.shipping?.address?.country &&
      customer?.shipping.address.postal_code
        ? {
            countryCode: customer.shipping.address.country,
            postalCode: customer.shipping.address.postal_code,
          }
        : { countryCode: '', postalCode: '' };

    return {
      customerId: customer?.id,
      couponCode: subscription?.discount?.coupon.id,
      currency: customer?.currency || undefined,
      taxAddress: taxAddress,
      productId: price?.product,
      priceId: price?.id,
    };
  }

  mapAccountsMetricsData(
    uid: string,
    account?: { locale: string | null; metricsOptOutAt: number | null }
  ): AccountsMetricsData {
    if (account) {
      return {
        uid,
        metricsOptOut: account.metricsOptOutAt !== null,
        locale: account.locale || undefined,
      };
    } else {
      return {
        uid,
        metricsOptOut: true,
      };
    }
  }

  mapSubPlatCmsMetricsData(
    subscription?: StripeSubscription,
    pageContentUtil?: PageContentByPriceIdsResultUtil
  ): SubPlatCmsMetricsData {
    return {
      offeringId: pageContentUtil?.purchases.at(0)?.offering.apiIdentifier,
      interval: subscription
        ? getSubplatIntervalFromSubscription(subscription)
        : undefined,
    };
  }

  mapSessionMetricsData(commonMetrics: CommonMetrics): SessionMetricsData {
    return {
      locale: commonMetrics.params['locale'],
      ipAddress: commonMetrics.ipAddress,
      deviceType: commonMetrics.deviceType,
      userAgent: commonMetrics.userAgent,
    };
  }

  async mapExperimentationMetricsData(
    uid: string,
    commonMetrics: CommonMetrics,
    customer?: StripeCustomer
  ): Promise<ExperimentationData> {
    const generatedNimbusUserId = this.nimbusManager.generateNimbusId(
      uid,
      commonMetrics.experimentationId
    );

    const language = commonMetrics.params['locale'];
    const region = customer?.shipping?.address?.country || undefined;

    try {
      const experiments = await this.nimbusManager.fetchExperiments({
        nimbusUserId: generatedNimbusUserId,
        language,
        region,
        preview:
          commonMetrics?.searchParams?.['experimentationPreview'] === 'true',
      });

      return {
        nimbusUserId:
          experiments?.Enrollments?.at(0)?.nimbus_user_id ||
          generatedNimbusUserId,
      };
    } catch (error) {
      this.log.error(error);
      return {
        nimbusUserId: generatedNimbusUserId,
      };
    }
  }

  async retrieveSubManageMetricsData(
    commonMetrics: CommonMetrics,
    uid: string,
    subscriptionId?: string
  ): Promise<GleanMetricsData> {
    let subscription: StripeSubscription | undefined;
    let price: StripePrice | undefined;
    let customer: StripeCustomer | undefined;
    let account:
      | { locale: string | null; metricsOptOutAt: number | null }
      | undefined;
    let pageContentUtil: PageContentByPriceIdsResultUtil | undefined;

    const subscriptionDataPromise = subscriptionId
      ? this.subscriptionManager.retrieve(subscriptionId)
      : Promise.reject(new Error('subscriptionId not provided'));

    const [accountsResult, subscriptionResult] = await Promise.allSettled([
      this.accountManager.getAccounts([uid]),
      subscriptionDataPromise,
    ]);

    if (subscriptionResult.status === 'fulfilled') {
      subscription = subscriptionResult.value;
      price = getPriceFromSubscription(subscription);

      const [customerResult, pageContentUtilResult] = await Promise.allSettled([
        this.customerManager.retrieve(subscription.customer),
        this.productConfigurationManager.getPageContentByPriceIds([price.id]),
      ]);

      if (customerResult.status === 'fulfilled') {
        customer = customerResult.value;
      }

      if (pageContentUtilResult.status === 'fulfilled') {
        pageContentUtil = pageContentUtilResult.value;
      }
    }

    if (accountsResult.status === 'fulfilled') {
      account = accountsResult.value.at(0);
    }

    const experimentation = await this.mapExperimentationMetricsData(
      uid,
      commonMetrics,
      customer
    );

    return {
      stripe: this.mapStripeMetricsData(customer, price, subscription),
      accounts: this.mapAccountsMetricsData(uid, account),
      cms: this.mapSubPlatCmsMetricsData(subscription, pageContentUtil),
      session: this.mapSessionMetricsData(commonMetrics),
      experimentation,
    };
  }

  async recordGenericSubManageEvent({
    eventName,
    uid,
    subscriptionId,
    commonMetrics,
  }: GenericGleanSubManageEvent) {
    const metricsData = await this.retrieveSubManageMetricsData(
      commonMetrics,
      uid,
      subscriptionId
    );

    if (!metricsData.accounts?.metricsOptOut) {
      this.paymentsGleanManager.recordGenericEvent(eventName, {
        commonMetricsData: commonMetrics,
        ...metricsData,
      });
    }
  }
}
