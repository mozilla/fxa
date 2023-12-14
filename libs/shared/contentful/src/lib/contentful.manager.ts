/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';

import {
  EligibilityContentByPlanIdsQuery,
  PurchaseWithDetailsOfferingContentQuery,
  ServicesWithCapabilitiesQuery,
  CapabilityServiceByPlanIdsQuery,
} from '../__generated__/graphql';
import { DEFAULT_LOCALE } from './constants';
import { ContentfulClient } from './contentful.client';

import {
  capabilityServiceByPlanIdsQuery,
  CapabilityServiceByPlanIdsResultUtil,
} from './queries/capability-service-by-plan-ids';
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

  async getPurchaseDetailsForCapabilityServiceByPlanIds(
    stripePlanIds: string[]
  ): Promise<CapabilityServiceByPlanIdsResultUtil> {
    let total: number | undefined;
    let count = 0;
    const queryResults: DeepNonNullable<CapabilityServiceByPlanIdsQuery>[] = [];
    const pageSize = 20;

    while (!total || count < total) {
      const queryResult = (await this.client.query(
        capabilityServiceByPlanIdsQuery,
        {
          skip: count,
          limit: pageSize,
          locale: DEFAULT_LOCALE,
          stripePlanIds,
        }
      )) as DeepNonNullable<CapabilityServiceByPlanIdsQuery>;

      queryResults.push(queryResult);
      count += pageSize;
      total = queryResult.purchaseCollection.total;
    }

    return new CapabilityServiceByPlanIdsResultUtil(queryResults);
  }

  async getPurchaseDetailsForEligibility(
    stripePlanIds: string[]
  ): Promise<EligibilityContentByPlanIdsResultUtil> {
    const queryResult = await this.client.query(
      eligibilityContentByPlanIdsQuery,
      {
        skip: 0,
        limit: 100,
        locale: DEFAULT_LOCALE,
        stripePlanIds,
      }
    );

    return new EligibilityContentByPlanIdsResultUtil(
      queryResult as DeepNonNullable<EligibilityContentByPlanIdsQuery>
    );
  }

  async getServicesWithCapabilities(): Promise<ServicesWithCapabilitiesResultUtil> {
    const queryResult = await this.client.query(servicesWithCapabilitiesQuery, {
      skip: 0,
      limit: 100,
      locale: DEFAULT_LOCALE,
    });

    return new ServicesWithCapabilitiesResultUtil(
      queryResult as DeepNonNullable<ServicesWithCapabilitiesQuery>
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
      queryResult as DeepNonNullable<PurchaseWithDetailsOfferingContentQuery>
    );
  }
}
