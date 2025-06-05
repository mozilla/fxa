/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ServerRoute } from '@hapi/hapi';
import { CapabilityService } from '../../../lib/payments/capability';
import { MozillaSubscription } from 'fxa-shared/subscriptions/types';
import { Container } from 'typedi';

import SUBSCRIPTIONS_DOCS from '../../../docs/swagger/subscriptions-api';
import { AppStoreSubscriptions } from '../../../lib/payments/iap/apple-app-store/subscriptions';
import { PlaySubscriptions } from '../../../lib/payments/iap/google-play/subscriptions';
import error from '../../error';
import {
  appStoreSubscriptionPurchaseToAppStoreSubscriptionDTO,
  playStoreSubscriptionPurchaseToPlayStoreSubscriptionDTO,
} from '../../payments/iap/iap-formatter';
import { PaymentBillingDetails, StripeHelper } from '../../payments/stripe';
import { AuthLogger, AuthRequest } from '../../types';
import validators from '../validators';
import { handleAuth } from './utils';
import DESCRIPTIONS from '../../../docs/swagger/shared/descriptions';

export class MozillaSubscriptionHandler {
  constructor(
    protected log: AuthLogger,
    protected db: any,
    protected customs: any,
    protected stripeHelper: StripeHelper,
    protected playSubscriptions: PlaySubscriptions,
    protected appStoreSubscriptions: AppStoreSubscriptions,
    protected capabilityService: CapabilityService
  ) {}

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

    const response: {
      customerId?: string;
      subscriptions: MozillaSubscription[];
    } & Partial<PaymentBillingDetails> =
      stripeBillingDetailsAndSubscriptions || {
        subscriptions: [],
      };

    return {
      ...response,
      subscriptions: [
        ...response.subscriptions,
        ...iapGooglePlaySubscriptions.map(
          playStoreSubscriptionPurchaseToPlayStoreSubscriptionDTO
        ),
        ...iapAppStoreSubscriptions.map(
          appStoreSubscriptionPurchaseToAppStoreSubscriptionDTO
        ),
      ],
    };
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
  customs,
  stripeHelper,
  playSubscriptions,
  appStoreSubscriptions,
  capabilityService,
}: {
  log: AuthLogger;
  db: any;
  customs: any;
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
