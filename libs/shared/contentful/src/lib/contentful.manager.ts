/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getOperationName } from '@apollo/client/utilities';
import { Inject, Injectable } from '@nestjs/common';
import { StatsD } from 'hot-shots';

import { StatsDService } from '@fxa/shared/metrics/statsd';
import {
  EligibilityContentByPlanIdsQuery,
  PurchaseWithDetailsOfferingContentQuery,
  ServicesWithCapabilitiesQuery,
  CapabilityServiceByPlanIdsQuery,
  EligibilityContentByOfferingQuery,
  PageContentForOfferingQuery,
} from '../__generated__/graphql';
import { DEFAULT_LOCALE } from './constants';
import { ContentfulClient } from './contentful.client';

import {
  capabilityServiceByPlanIdsQuery,
  CapabilityServiceByPlanIdsResultUtil,
} from './queries/capability-service-by-plan-ids';
import {
  eligibilityContentByOfferingQuery,
  EligibilityContentByOfferingResultUtil,
} from './queries/eligibility-content-by-offering';
import {
  EligibilityContentByPlanIdsResultUtil,
  eligibilityContentByPlanIdsQuery,
} from './queries/eligibility-content-by-plan-ids';
import {
  PageContentForOfferingResultUtil,
  pageContentForOfferingQuery,
} from './queries/page-content-for-offering';
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
  constructor(
    private client: ContentfulClient,
    @Inject(StatsDService) private statsd: StatsD
  ) {
    this.client.on('response', (response) => {
      const defaultTags = {
        method: response.method,
        error: response.error ? 'true' : 'false',
        cache: `${response.cache}`,
      };
      const operationName = response.query && getOperationName(response.query);
      const tags = operationName
        ? { ...defaultTags, operationName }
        : defaultTags;
      this.statsd.timing(
        'contentful_request',
        response.elapsed,
        undefined,
        tags
      );
    });
  }

  async getEligibilityContentByOffering(
    offering: string
  ): Promise<EligibilityContentByOfferingResultUtil> {
    const queryResult = await this.client.query(
      eligibilityContentByOfferingQuery,
      {
        offering,
      }
    );

    return new EligibilityContentByOfferingResultUtil(
      queryResult as DeepNonNullable<EligibilityContentByOfferingQuery>
    );
  }

  async getPageContentForOffering(
    apiIdentifier: string,
    acceptLanguage: string
  ): Promise<PageContentForOfferingResultUtil> {
    const locale = await this.client.getLocale(acceptLanguage);

    const queryResult = await this.client.query(pageContentForOfferingQuery, {
      locale,
      apiIdentifier,
    });

    return new PageContentForOfferingResultUtil(
      queryResult as DeepNonNullable<PageContentForOfferingQuery>
    );
  }

  async getPurchaseDetailsForCapabilityServiceByPlanIds(
    stripePlanIds: string[]
  ): Promise<CapabilityServiceByPlanIdsResultUtil> {
    let total: number | undefined;
    let count = 0;
    const queryResults: DeepNonNullable<CapabilityServiceByPlanIdsQuery>[] = [];
    const pageSize = 20;

    while (total === undefined || count < total) {
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
    let total: number | undefined;
    let count = 0;
    const queryResults: DeepNonNullable<EligibilityContentByPlanIdsQuery>[] =
      [];
    const pageSize = 20;

    while (total === undefined || count < total) {
      const queryResult = (await this.client.query(
        eligibilityContentByPlanIdsQuery,
        {
          skip: count,
          limit: pageSize,
          locale: DEFAULT_LOCALE,
          stripePlanIds,
        }
      )) as DeepNonNullable<EligibilityContentByPlanIdsQuery>;

      queryResults.push(queryResult);
      count += pageSize;
      total = queryResult.purchaseCollection.total;
    }

    return new EligibilityContentByPlanIdsResultUtil(queryResults);
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
    const queryResults: DeepNonNullable<PurchaseWithDetailsOfferingContentQuery>[] =
      [];
    const stripePlans: string[][] = [];

    // reduce query size by making multiple calls to Contentful
    for (let i = 0; i < stripePlanIds.length; i += 150) {
      stripePlans.push(stripePlanIds.slice(i, i + 150));
    }

    while (stripePlans.length > 0) {
      const queryResult = (await this.client.query(
        purchaseWithDetailsOfferingContentQuery,
        {
          skip: 0,
          limit: 100,
          locale,
          stripePlanIds: stripePlans[0],
        }
      )) as DeepNonNullable<PurchaseWithDetailsOfferingContentQuery>;
      queryResults.push(queryResult);
      stripePlans.shift();
    }

    return new PurchaseWithDetailsOfferingContentUtil(queryResults);
  }
}
