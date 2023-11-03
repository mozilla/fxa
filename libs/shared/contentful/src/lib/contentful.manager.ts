/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';

import {
  EligibilityContentByPlanIdsQuery,
  PurchaseWithDetailsOfferingContentQuery,
  ServicesWithCapabilitiesQuery,
} from '../__generated__/graphql';
import { ContentfulClient } from './contentful.client';
import {
  EligibilityContentByPlanIdsResultUtil,
  eligibilityContentByPlanIdsQuery,
} from './queries/eligibility-content-by-plan-ids';
import {
  PurchaseWithDetailsOfferingContentUtil,
  purchaseWithDetailsOfferingContentQuery,
} from './queries/purchase-with-details-offering-content';
import {
  ServicesWithCapabilitiesResultUtil,
  servicesWithCapabilitiesQuery,
} from './queries/services-with-capabilities';
import { DeepNonNullable } from './types';

@Injectable()
export class ContentfulManager {
  constructor(private client: ContentfulClient) {}

  async getPurchaseDetailsForEligibility(
    stripePlanIds: string[]
  ): Promise<EligibilityContentByPlanIdsResultUtil> {
    const queryResult = await this.client.query(
      eligibilityContentByPlanIdsQuery,
      {
        skip: 0,
        limit: 100,
        locale: 'en',
        stripePlanIds,
      }
    );

    return new EligibilityContentByPlanIdsResultUtil(
      queryResult.data as DeepNonNullable<EligibilityContentByPlanIdsQuery>
    );
  }

  async getServicesWithCapabilities(): Promise<ServicesWithCapabilitiesResultUtil> {
    const queryResult = await this.client.query(servicesWithCapabilitiesQuery, {
      skip: 0,
      limit: 100,
      locale: 'en',
    });

    return new ServicesWithCapabilitiesResultUtil(
      queryResult.data as DeepNonNullable<ServicesWithCapabilitiesQuery>
    );
  }

  async getPurchaseWithDetailsOfferingContentByPlanIds(
    stripePlanIds: string[],
    acceptLanguage: string
  ): Promise<PurchaseWithDetailsOfferingContentUtil> {
    const locale = await this.client.getLocale(acceptLanguage);
    const queryResult = await this.client.query(
      purchaseWithDetailsOfferingContentQuery,
      {
        skip: 0,
        limit: 100,
        locale,
        stripePlanIds,
      }
    );

    return new PurchaseWithDetailsOfferingContentUtil(
      queryResult.data as DeepNonNullable<PurchaseWithDetailsOfferingContentQuery>
    );
  }
}
