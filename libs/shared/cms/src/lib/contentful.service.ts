/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { PriceManager, SubplatInterval } from '@fxa/payments/stripe';
import { CMSConfig } from './cms.config';
import { ContentfulServiceError } from './cms.error';
import { ProductConfigurationManager } from './product-configuration.manager';

@Injectable()
export class ContentfulService {
  constructor(
    private productConfigurationManager: ProductConfigurationManager,
    private priceManager: PriceManager,
    private cmsConfig: CMSConfig
  ) {}

  // TODO: Move this out of ContentfulService
  async fetchCMSData(offeringId: string, acceptLanguage: string) {
    const offeringResult =
      await this.productConfigurationManager.getPageContentForOffering(
        offeringId,
        acceptLanguage
      );

    return offeringResult.getOffering();
  }

  // TODO: Move this out of ContentfulService
  async retrieveStripePlanId(
    offeringConfigId: string,
    interval: SubplatInterval
  ) {
    const planIds = await this.productConfigurationManager.getOfferingPlanIds(
      offeringConfigId
    );
    // Temporary supported list of plans
    // CMS purchase.stripePlanChoices is currently not configured correctly
    // Unfortunately, currently the CMS is read-only and can't be updated
    // As a temporary work around provide a list of supported plans
    const supportedListOfPriceIds = this.cmsConfig.supportedPriceIds.split(',');
    const filteredPlanIds = planIds.filter((priceId) =>
      supportedListOfPriceIds.includes(priceId)
    );
    const plan = await this.priceManager.retrieveByInterval(
      filteredPlanIds,
      interval
    );
    if (!plan) throw new ContentfulServiceError('Plan not found');
    return plan.id;
  }
}
