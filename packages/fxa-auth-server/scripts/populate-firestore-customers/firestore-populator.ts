/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { accountExists } from 'fxa-shared/db/models/auth';
import { Stripe } from 'stripe';

import { StripeHelper } from '../../lib/payments/stripe';
import { StripeFirestore } from '../../lib/payments/stripe-firestore';
import { RateLimitObserver } from './rate-limit-observer';

export class FirestorePopulator {
  rateLimitObserver: RateLimitObserver;
  stripe: Stripe;

  constructor(
    private log: any,
    private stripeHelper: StripeHelper,
    rateLimit: number
  ) {
    this.stripe = this.stripeHelper.stripe as Stripe;
    // Hook up the rate limit observer
    this.rateLimitObserver = new RateLimitObserver(rateLimit);
    this.stripe.on('request', (request) => this.rateLimitObserver.increment());
  }

  public async populate() {
    const stripeFirestore = (this.stripeHelper as any)
      .stripeFirestore as StripeFirestore;

    for await (const stripeUser of this.stripe.customers.list({ limit: 100 })) {
      // Skip deleted users or without a userid
      if (stripeUser.deleted || !stripeUser.metadata.userid) {
        continue;
      }

      // Verify the user is in our fxa database
      const uid = stripeUser.metadata.userid;
      const exists = await accountExists(uid);
      if (!exists) {
        this.log.warn('Stripe user not found in fxa database', { uid });
        continue;
      }

      // Ensure the firestore record is loaded, this inserts subscriptions
      // as well.
      // Note that we don't use expandResource as that makes an additional
      // firestore call to fetch subscriptions which is not needed here.
      await stripeFirestore.retrieveAndFetchCustomer(stripeUser.id);

      // Wait for the next customer to be processed based on rate limiting
      await this.rateLimitObserver.pause();
    }
  }
}
