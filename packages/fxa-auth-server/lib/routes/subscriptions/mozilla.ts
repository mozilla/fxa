/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ServerRoute } from '@hapi/hapi';
import { MozillaSubscription } from 'fxa-shared/subscriptions/types';
import { Container } from 'typedi';
import { PlaySubscriptions } from '../../../lib/payments/iap/google-play/subscriptions';
import error from '../../error';
import { PaymentBillingDetails, StripeHelper } from '../../payments/stripe';
import { AuthLogger, AuthRequest } from '../../types';
import validators from '../validators';
import { handleAuth } from './utils';

const SUBSCRIPTIONS_DOCS =
  require('../../../docs/swagger/subscriptions-api').default;

export const mozillaSubscriptionRoutes = ({
  log,
  db,
  customs,
  stripeHelper,
  playSubscriptions,
}: {
  log: AuthLogger;
  db: any;
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
}
