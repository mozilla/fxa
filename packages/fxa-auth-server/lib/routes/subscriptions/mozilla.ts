/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ServerRoute } from '@hapi/hapi';
import { CapabilityService } from '../../../lib/payments/capability';
import { type WebSubscription } from 'fxa-shared/subscriptions/types';
import { Container } from 'typedi';

import SUBSCRIPTIONS_DOCS from '../../../docs/swagger/subscriptions-api';
import { AppStoreSubscriptions } from '../../../lib/payments/iap/apple-app-store/subscriptions';
import { PlaySubscriptions } from '../../../lib/payments/iap/google-play/subscriptions';
import { AppError as error } from '@fxa/accounts/errors';
import {
  appStoreSubscriptionPurchaseToAppStoreSubscriptionDTO,
  playStoreSubscriptionPurchaseToPlayStoreSubscriptionDTO,
} from '../../payments/iap/iap-formatter';
import { StripeHelper } from '../../payments/stripe';
import { AuthLogger, AuthRequest } from '../../types';
import validators from '../validators';
import { handleAuth } from './utils';
import DESCRIPTIONS from '../../../docs/swagger/shared/descriptions';
import type { AppendedPlayStoreSubscriptionPurchase } from 'fxa-shared/payments/iap/google-play/types';
import type { AppendedAppStoreSubscriptionPurchase } from 'fxa-shared/payments/iap/apple-app-store/types';
import { VError } from 'verror';
import type { ConfigType } from '../../../config';
import { sanitizePlans } from './stripe';
import type { StripePrice } from '@fxa/payments/stripe';
import { PriceManager, type SubplatInterval } from '@fxa/payments/customer';
import { ProductConfigurationManager } from '@fxa/shared/cms';

type PriceInfo = {
  amount: number | null;
  currency: string | null;
  interval: string;
  interval_count: number;
};

type PriceMap = {
  uniqueId: string;
  priceInfo: PriceInfo;
};

('Error ocurred while mapping price info.');
export class SubscriptionManagementPriceMappingError extends VError {
  constructor(message: string, info?: any, cause?: Error) {
    super(
      {
        name: 'SubscriptionManagementPriceMappingError',
        info,
        cause,
      },
      message
    );
  }
}

export class MozillaSubscriptionHandler {
  private priceManager: PriceManager;
  private productConfigurationManager: ProductConfigurationManager;

  constructor(
    protected log: AuthLogger,
    protected db: any,
    protected config: ConfigType,
    protected customs: any,
    protected stripeHelper: StripeHelper,
    protected playSubscriptions: PlaySubscriptions,
    protected appStoreSubscriptions: AppStoreSubscriptions,
    protected capabilityService: CapabilityService
  ) {
    if (Container.has(PriceManager)) {
      this.priceManager = Container.get(PriceManager);
    } else {
      throw new SubscriptionManagementPriceMappingError(
        'No PriceManager found in container'
      );
    }

    if (Container.has(ProductConfigurationManager)) {
      this.productConfigurationManager = Container.get(
        ProductConfigurationManager
      );
    } else {
      throw new SubscriptionManagementPriceMappingError(
        'No ProductConfigurationManager found in container'
      );
    }
  }

  async fetchIapPriceInfo(
    iapGooglePlaySubscriptions: AppendedPlayStoreSubscriptionPurchase[],
    iapAppStoreSubscriptions: AppendedAppStoreSubscriptionPurchase[]
  ) {
    // Combine Google and Apple IAP info into a common format
    const normalizedIapInfoGoogle = iapGooglePlaySubscriptions.map((sub) => ({
      storeId: sub.sku,
      currency: sub.priceCurrencyCode,
    }));
    const normalizedIapInfoAppStore = iapAppStoreSubscriptions.map((sub) => ({
      storeId: sub.productId,
      currency: sub.currency,
    }));
    const normalizedIapInfo = [
      ...normalizedIapInfoGoogle,
      ...normalizedIapInfoAppStore,
    ];
    const storeIds = normalizedIapInfo.map((c) => c.storeId);

    // Fetch IAP Offerings data from CMS for Apple and Google IAPs
    const iapOfferingUtil =
      await this.productConfigurationManager.getIapOfferings(storeIds);

    const output: PriceMap[] = [];
    for (const storeId of storeIds) {
      const iapOffering = iapOfferingUtil.getIapPageContentByStoreId(storeId);

      if (!iapOffering) {
        throw new SubscriptionManagementPriceMappingError(
          'IAP offering CMS config not found',
          { uniqueId: storeId }
        );
      }

      const priceIds =
        iapOffering.offering.defaultPurchase.stripePlanChoices.map(
          (choices) => choices.stripePlanChoice
        );
      const price = await this.priceManager.retrieveByInterval(
        priceIds,
        iapOffering.interval as unknown as SubplatInterval
      );

      if (!price) {
        // An IAP productId/sku should always have associated config in the CMS that
        // resolves to a Stripe price. If not, it indicates a misconfiguration, and
        // an error should be thrown.
        throw new SubscriptionManagementPriceMappingError(
          'Price not found for IAP',
          { uniqueId: storeId }
        );
      }

      const currency = normalizedIapInfo.find(
        (iap) => iap.storeId === storeId
      )?.currency;

      const priceInfo = this.mapPriceInfo(price, currency);

      output.push({ uniqueId: storeId, priceInfo });
    }

    return output;
  }

  findPriceInfo(uniqueId: string, priceInfoMap: PriceMap[]) {
    if (!this.config.subscriptions.billingPriceInfoFeature) {
      return undefined;
    }

    const priceInfo = priceInfoMap.find(
      (priceInfo) => priceInfo.uniqueId === uniqueId
    )?.priceInfo;

    // Price Info is a required field. If price info is not found
    // throw an error.
    if (!priceInfo) {
      throw new SubscriptionManagementPriceMappingError(
        'Price info could not be found',
        { uniqueId }
      );
    }

    return priceInfo;
  }

  mapPriceInfo(price: StripePrice, currency?: string | null) {
    if (!price.recurring) {
      throw new SubscriptionManagementPriceMappingError(
        'Only support recurring prices',
        {
          priceId: price.id,
          currency,
        }
      );
    }

    // If currency is not provided, or amount can't be determined, then
    // return default null values.
    const normalizedCurrency = currency ? currency.toLowerCase() : null;
    let amount: number | null = null;

    if (normalizedCurrency) {
      const currencyOption = price.currency_options?.[normalizedCurrency];

      if (currencyOption) {
        const { unit_amount, unit_amount_decimal } = currencyOption;
        amount =
          unit_amount ??
          (unit_amount_decimal != null
            ? Math.round(parseFloat(unit_amount_decimal))
            : null);
      }
    }

    return {
      amount,
      currency: normalizedCurrency,
      interval: price.recurring.interval,
      interval_count: price.recurring.interval_count,
    };
  }

  private async mapMozillaSubscriptions({
    customerCurrency,
    stripeSubscriptions,
    iapGooglePlaySubscriptions,
    iapAppStoreSubscriptions,
  }: {
    customerCurrency: string | null | undefined;
    stripeSubscriptions: WebSubscription[];
    iapGooglePlaySubscriptions: AppendedPlayStoreSubscriptionPurchase[];
    iapAppStoreSubscriptions: AppendedAppStoreSubscriptionPurchase[];
  }) {
    let storeIdPriceInfoMap: PriceMap[] = [];
    if (this.config.subscriptions.billingPriceInfoFeature) {
      storeIdPriceInfoMap = await this.fetchIapPriceInfo(
        iapGooglePlaySubscriptions,
        iapAppStoreSubscriptions
      );

      for (const sub of stripeSubscriptions) {
        const price = await this.priceManager.retrieve(sub.plan_id);
        const priceInfo = this.mapPriceInfo(price, customerCurrency);

        storeIdPriceInfoMap.push({
          uniqueId: sub.subscription_id,
          priceInfo,
        });
      }
    }

    const stripeMozSubs = stripeSubscriptions.map((sub) => {
      return {
        ...sub,
        priceInfo: this.findPriceInfo(sub.subscription_id, storeIdPriceInfoMap),
      };
    });
    const googleIapMozSubs = iapGooglePlaySubscriptions.map((sub) => {
      return {
        ...playStoreSubscriptionPurchaseToPlayStoreSubscriptionDTO(sub),
        priceInfo: this.findPriceInfo(sub.sku, storeIdPriceInfoMap),
      };
    });
    const appleIapMozSubs = iapAppStoreSubscriptions.map((sub) => {
      return {
        ...appStoreSubscriptionPurchaseToAppStoreSubscriptionDTO(sub),
        priceInfo: this.findPriceInfo(sub.productId, storeIdPriceInfoMap),
      };
    });

    return [...stripeMozSubs, ...googleIapMozSubs, ...appleIapMozSubs];
  }

  async getBillingDetailsAndSubscriptions(request: AuthRequest) {
    this.log.begin(
      'mozillaSubscriptions.customerBillingAndSubscriptions',
      request
    );

    const { uid, email } = await handleAuth(this.db, request.auth, true);
    await this.customs.checkAuthenticated(
      request,
      uid,
      email,
      'mozillaSubscriptionsCustomerBillingAndSubscriptions'
    );
    const stripeBillingDetailsAndSubscriptions =
      await this.stripeHelper.getBillingDetailsAndSubscriptions(uid);
    const iapGooglePlaySubscriptions =
      await this.playSubscriptions.getSubscriptions(uid);
    const iapAppStoreSubscriptions =
      await this.appStoreSubscriptions.getSubscriptions(uid);

    if (
      !stripeBillingDetailsAndSubscriptions &&
      iapGooglePlaySubscriptions.length === 0 &&
      iapAppStoreSubscriptions.length === 0
    ) {
      throw error.unknownCustomer(uid);
    }

    const {
      subscriptions: stripeSubscriptions,
      customerCurrency,
      ...billingDetails
    } = stripeBillingDetailsAndSubscriptions
      ? stripeBillingDetailsAndSubscriptions
      : { subscriptions: [], customerCurrency: undefined };

    try {
      const mozillaSubscriptions = await this.mapMozillaSubscriptions({
        customerCurrency,
        stripeSubscriptions,
        iapGooglePlaySubscriptions,
        iapAppStoreSubscriptions,
      });
      return {
        ...billingDetails,
        subscriptions: mozillaSubscriptions,
      };
    } catch (error) {
      if (!(error instanceof SubscriptionManagementPriceMappingError)) {
        throw new SubscriptionManagementPriceMappingError(
          'Error ocurred while mapping price info.',
          {
            uid,
          },
          error
        );
      } else {
        throw error;
      }
    }
  }

  async getPlanEligibility(request: AuthRequest) {
    this.log.begin('mozillaSubscriptions.validatePlanEligibility', request);

    const { uid, email } = await handleAuth(this.db, request.auth, true);
    await this.customs.checkAuthenticated(
      request,
      uid,
      email,
      'mozillaSubscriptionsValidatePlanEligibility'
    );

    const targetPlanId = request.params.planId;

    const result = await this.capabilityService.getPlanEligibility(
      uid,
      targetPlanId
    );

    return {
      eligibility: result.subscriptionEligibilityResult,
      currentPlan:
        result.eligibleSourcePlan &&
        sanitizePlans([result.eligibleSourcePlan]).at(0),
    };
  }
}

export const mozillaSubscriptionRoutes = ({
  log,
  db,
  config,
  customs,
  stripeHelper,
  playSubscriptions,
  appStoreSubscriptions,
  capabilityService,
}: {
  log: AuthLogger;
  db: any;
  customs: any;
  config: ConfigType;
  stripeHelper: StripeHelper;
  playSubscriptions?: PlaySubscriptions;
  appStoreSubscriptions?: AppStoreSubscriptions;
  capabilityService?: CapabilityService;
}): ServerRoute[] => {
  if (!playSubscriptions) {
    playSubscriptions = Container.get(PlaySubscriptions);
  }
  if (!appStoreSubscriptions) {
    appStoreSubscriptions = Container.get(AppStoreSubscriptions);
  }
  if (!capabilityService) {
    capabilityService = Container.get(CapabilityService);
  }
  const mozillaSubscriptionHandler = new MozillaSubscriptionHandler(
    log,
    db,
    config,
    customs,
    stripeHelper,
    playSubscriptions,
    appStoreSubscriptions,
    capabilityService
  );
  return [
    {
      method: 'GET',
      path: '/oauth/mozilla-subscriptions/customer/billing-and-subscriptions',
      options: {
        ...SUBSCRIPTIONS_DOCS.OAUTH_MOZILLA_SUBSCRIPTIONS_CUSTOMER_BILLING_AND_SUBSCRIPTIONS_GET,
        auth: {
          payload: false,
          strategy: 'oauthToken',
        },
        response: {
          schema: validators.subscriptionsMozillaSubscriptionsValidator as any,
        },
      },
      handler: (request: AuthRequest) =>
        mozillaSubscriptionHandler.getBillingDetailsAndSubscriptions(request),
    },
    {
      method: 'GET',
      path: '/oauth/mozilla-subscriptions/customer/plan-eligibility/{planId}',
      options: {
        ...SUBSCRIPTIONS_DOCS.OAUTH_MOZILLA_SUBSCRIPTIONS_CUSTOMER_PLAN_ELIGIBILITY,
        auth: {
          payload: false,
          strategy: 'oauthToken',
        },
        validate: {
          params: {
            planId: validators.subscriptionsPlanId
              .required()
              .description(DESCRIPTIONS.planId),
          },
        },
      },
      handler: (request: AuthRequest) =>
        mozillaSubscriptionHandler.getPlanEligibility(request),
    },
  ];
};
