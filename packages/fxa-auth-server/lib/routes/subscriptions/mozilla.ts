/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ServerRoute } from '@hapi/hapi';
import { Container } from 'typedi';
import error from '../../error';
import { PaymentBillingDetails, StripeHelper } from '../../payments/stripe';
import { CapabilityService } from '../../../lib/payments/capability';
import {
  GooglePlaySubscription,
  MozillaSubscription,
  MozillaSubscriptionTypes,
} from 'fxa-shared/subscriptions/types';
import { AuthLogger, AuthRequest } from '../../types';
import { handleAuth } from './utils';
import validators from '../validators';

export const mozillaSubscriptionRoutes = ({
  log,
  db,
  customs,
  stripeHelper,
  capabilityService,
}: {
  log: AuthLogger;
  db: any;
  customs: any;
  stripeHelper: StripeHelper;
  capabilityService?: CapabilityService;
}): ServerRoute[] => {
  if (!capabilityService) {
    capabilityService = Container.get(CapabilityService);
  }
  const mozillaSubscriptionHandler = new MozillaSubscriptionHandler(
    log,
    db,
    customs,
    stripeHelper,
    capabilityService
  );
  return [
    {
      method: 'GET',
      path: '/oauth/mozilla-subscriptions/customer/billing-and-subscriptions',
      options: {
        auth: {
          payload: false,
          strategy: 'oauthToken',
        },
        response: {
          schema: validators.subscriptionsMozillaSubscriptionsValidator,
        },
      },
      handler: (request: AuthRequest) =>
        mozillaSubscriptionHandler.getBillingDetailsAndSubscriptions(request),
    },
  ];
};

export class MozillaSubscriptionHandler {
  constructor(
    protected log: AuthLogger,
    protected db: any,
    protected customs: any,
    protected stripeHelper: StripeHelper,
    protected capabilityService: CapabilityService
  ) {}

  async getBillingDetailsAndSubscriptions(request: AuthRequest) {
    this.log.begin(
      'mozillaSubscriptions.customerBillingAndSubscriptions',
      request
    );

    const { uid, email } = await handleAuth(this.db, request.auth, true);
    await this.customs.check(
      request,
      email,
      'mozillaSubscriptionsCustomerBillingAndSubscriptions'
    );

    const stripeBillingDetailsAndSubscriptions =
      await this.stripeHelper.getBillingDetailsAndSubscriptions(uid);
    const iapSubscribedGooglePlayAbbrevPlayPurchases =
      await this.capabilityService.fetchSubscribedAbbrevPlayPurchasesFromPlay(
        uid
      );

    const iapAbbrevPlayPurchasesWithProductIds =
      await this.stripeHelper.appendAbbrevPlayPurchasesWithProductIds(
        iapSubscribedGooglePlayAbbrevPlayPurchases
      );

    if (
      !stripeBillingDetailsAndSubscriptions &&
      iapAbbrevPlayPurchasesWithProductIds.length === 0
    ) {
      throw error.unknownCustomer(uid);
    }

    const response: {
      customerId?: string;
      subscriptions: MozillaSubscription[];
    } & Partial<PaymentBillingDetails> = stripeBillingDetailsAndSubscriptions || {
      subscriptions: [],
    };

    const iapGooglePlaySubscriptions: GooglePlaySubscription[] =
      iapAbbrevPlayPurchasesWithProductIds.map((purchase) => ({
        ...purchase,
        _subscription_type: MozillaSubscriptionTypes.IAP_GOOGLE,
      }));

    return {
      ...response,
      subscriptions: [...response.subscriptions, ...iapGooglePlaySubscriptions],
    };
  }
}
