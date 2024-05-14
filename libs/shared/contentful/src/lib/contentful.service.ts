/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import {
  PlanNotFoundError,
  StripeManager,
  SubplatInterval,
} from '@fxa/payments/stripe';
import { ContentfulManager } from './contentful.manager';

@Injectable()
export class ContentfulService {
  constructor(
    private contentfulManager: ContentfulManager,
    private stripeManager: StripeManager
  ) {}

  async fetchContentfulData(offeringId: string, acceptLanguage: string) {
    const offeringResult =
      await this.contentfulManager.getPageContentForOffering(
        offeringId,
        acceptLanguage
      );

    return offeringResult.getOffering();
  }

  async retrieveStripePlanId(
    offeringConfigId: string,
    interval: SubplatInterval
  ) {
    const planIds = await this.contentfulManager.getOfferingPlanIds(
      offeringConfigId
    );
    const plan = await this.stripeManager.getPlanByInterval(planIds, interval);
    if (!plan) throw new PlanNotFoundError();
    return plan.id;
  }
}
