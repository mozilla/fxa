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
import error from '../../error';
import {
  appStoreSubscriptionPurchaseToAppStoreSubscriptionDTO,
  playStoreSubscriptionPurchaseToPlayStoreSubscriptionDTO,
} from '../../payments/iap/iap-formatter';
import {
  StripeHelper,
  SubscriptionManagementPriceInfoError,
} from '../../payments/stripe';
import { AuthLogger, AuthRequest } from '../../types';
import validators from '../validators';
import { handleAuth } from './utils';
import DESCRIPTIONS from '../../../docs/swagger/shared/descriptions';
import type { AppendedPlayStoreSubscriptionPurchase } from 'fxa-shared/payments/iap/google-play/types';
import type { AppendedAppStoreSubscriptionPurchase } from 'fxa-shared/payments/iap/apple-app-store/types';
import { VError } from 'verror';
import type { ConfigType } from '../../../config';

const DEFAULT_CURRENCY = 'usd';

export class SubscriptionManagementPriceMappingError extends VError {
  constructor(cause: Error, info: any) {
    super(
      {
        name: 'SubscriptionManagementPriceMappingError',
        cause,
        info,
      },
      'Error ocurred while mapping price info.'
    );
  }
}

export class MozillaSubscriptionHandler {
  constructor(
    protected log: AuthLogger,
    protected db: any,
    protected config: ConfigType,
    protected customs: any,
    protected stripeHelper: StripeHelper,
    protected playSubscriptions: PlaySubscriptions,
    protected appStoreSubscriptions: AppStoreSubscriptions,
    protected capabilityService: CapabilityService
  ) {}

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
    let subsPriceInfo: {
      priceId: string;
      priceInfo: {
        amount: number;
        currency: string;
        interval: string;
        interval_count: number;
      };
    }[] = [];

    if (this.config.subscriptions.billingPriceInfoFeature) {
      const stripePromises =
        stripeSubscriptions?.map(async (sub) => {
          if (!customerCurrency) {
            throw new Error('Customer currency required');
          }

          return this.stripeHelper
            .getSubscriptionManagementPriceInfo(sub.plan_id, customerCurrency)
            .then((priceInfo) => ({
              priceId: sub.plan_id,
              priceInfo,
            }));
        }) || [];

      const googleIapSubsPromises =
        iapGooglePlaySubscriptions?.map((sub) =>
          this.stripeHelper
            .getSubscriptionManagementPriceInfo(
              sub.price_id,
              sub.priceCurrencyCode || DEFAULT_CURRENCY
            )
            .then((priceInfo) => ({
              priceId: sub.price_id,
              priceInfo: priceInfo,
            }))
        ) || [];
      const appleIapSubsPromises =
        iapAppStoreSubscriptions?.map((sub) =>
          this.stripeHelper
            .getSubscriptionManagementPriceInfo(
              sub.price_id,
              sub.currency || DEFAULT_CURRENCY
            )
            .then((priceInfo) => ({
              priceId: sub.price_id,
              priceInfo: priceInfo,
            }))
        ) || [];

      subsPriceInfo = await Promise.all([
        ...stripePromises,
        ...googleIapSubsPromises,
        ...appleIapSubsPromises,
      ]);
    }

    const stripeMozSubs = stripeSubscriptions.map((sub) => {
      return {
        ...sub,
        priceInfo: subsPriceInfo.find((info) => info.priceId === sub.plan_id)
          ?.priceInfo,
      };
    });
    const googleIapMozSubs = iapGooglePlaySubscriptions.map((sub) => {
      return {
        ...playStoreSubscriptionPurchaseToPlayStoreSubscriptionDTO(sub),
        priceInfo: subsPriceInfo.find((info) => info.priceId === sub.price_id)
          ?.priceInfo,
      };
    });
    const appleIapMozSubs = iapAppStoreSubscriptions.map((sub) => {
      return {
        ...appStoreSubscriptionPurchaseToAppStoreSubscriptionDTO(sub),
        priceInfo: subsPriceInfo.find((info) => info.priceId === sub.price_id)
          ?.priceInfo,
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
      if (error instanceof SubscriptionManagementPriceInfoError) {
        const info = VError.info(error);
        throw new SubscriptionManagementPriceMappingError(error, {
          ...info,
          uid,
        });
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
      currentPlan: result.eligibleSourcePlan,
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
