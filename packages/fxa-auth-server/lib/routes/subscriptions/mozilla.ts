/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ServerRoute } from '@hapi/hapi';
import isA from '@hapi/joi';
import {
  MozillaSubscription,
  MozillaSubscriptionTypes,
} from 'fxa-shared/subscriptions/types';
import { Container } from 'typedi';

import { ConfigType } from '../../../config';
import { PlaySubscriptions } from '../../../lib/payments/google-play/subscriptions';
import error from '../../error';
import { PaymentBillingDetails, StripeHelper } from '../../payments/stripe';
import { AuthLogger, AuthRequest } from '../../types';
import validators from '../validators';
import { handleAuth } from './utils';

export const mozillaSubscriptionRoutes = ({
  log,
  db,
  config,
  customs,
  stripeHelper,
  playSubscriptions,
}: {
  log: AuthLogger;
  db: any;
  config: ConfigType;
  customs: any;
  stripeHelper: StripeHelper;
  playSubscriptions?: PlaySubscriptions;
}): ServerRoute[] => {
  if (!playSubscriptions) {
    playSubscriptions = Container.get(PlaySubscriptions);
  }
  const mozillaSubscriptionHandler = new MozillaSubscriptionHandler(
    log,
    db,
    customs,
    stripeHelper,
    playSubscriptions
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
    {
      // A Support Panel specific endpoint
      method: 'GET',
      path: '/oauth/mozilla-subscriptions/support-panel/subscriptions',
      options: {
        auth: {
          payload: false,
          strategy: 'supportPanelSecret',
        },
        response: {
          schema: validators.subscriptionsSubscriptionSupportValidator,
        },
        validate: {
          query: {
            uid: isA.string().required(),
          },
        },
      },
      handler: (request: AuthRequest) =>
        mozillaSubscriptionHandler.getSubscriptionsForSupportPanel(request),
    },
  ];
};

export class MozillaSubscriptionHandler {
  constructor(
    protected log: AuthLogger,
    protected db: any,
    protected customs: any,
    protected stripeHelper: StripeHelper,
    protected playSubscriptions: PlaySubscriptions
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
    const iapGooglePlaySubscriptions =
      await this.playSubscriptions.getSubscriptions(uid);

    if (
      !stripeBillingDetailsAndSubscriptions &&
      iapGooglePlaySubscriptions.length === 0
    ) {
      throw error.unknownCustomer(uid);
    }

    const response: {
      customerId?: string;
      subscriptions: MozillaSubscription[];
    } & Partial<PaymentBillingDetails> = stripeBillingDetailsAndSubscriptions || {
      subscriptions: [],
    };

    return {
      ...response,
      subscriptions: [...response.subscriptions, ...iapGooglePlaySubscriptions],
    };
  }

  async getSubscriptionsForSupportPanel(request: AuthRequest) {
    this.log.begin('mozillaSubscriptions.supportPanelSubscriptions', request);
    const { uid } = request.query as Record<string, string>;
    const iapPlaySubscriptions = await this.playSubscriptions.getSubscriptions(
      uid
    );
    const customer = await this.stripeHelper.fetchCustomer(uid);
    const webSubscriptions = customer?.subscriptions;
    const formattedWebSubscriptions = webSubscriptions
      ? await this.stripeHelper.formatSubscriptionsForSupport(webSubscriptions)
      : [];

    return {
      [MozillaSubscriptionTypes.WEB]: formattedWebSubscriptions,
      [MozillaSubscriptionTypes.IAP_GOOGLE]: iapPlaySubscriptions,
    };
  }
}
