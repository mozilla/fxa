/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getOperationName } from '@apollo/client/utilities';
import { Inject, Injectable } from '@nestjs/common';
import { StatsD } from 'hot-shots';

import { PriceManager, SubplatInterval } from '@fxa/payments/customer';
import { StatsDService } from '@fxa/shared/metrics/statsd';
import {
  EligibilityContentByPlanIdsQuery,
  PurchaseWithDetailsOfferingContentQuery,
  ServicesWithCapabilitiesQuery,
  CapabilityServiceByPlanIdsQuery,
  EligibilityContentByOfferingQuery,
  PageContentForOfferingQuery,
  type IapOfferingsByStoreIDsQuery,
} from '../__generated__/graphql';
import {
  FetchCmsInvalidOfferingError,
  QueriesUtilError,
  RetrieveStripePriceInvalidOfferingError,
  RetrieveStripePriceNotFoundError,
} from './cms.error';
import { DEFAULT_LOCALE } from './constants';
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
import { StrapiClient, StrapiClientEventResponse } from './strapi.client';
import { DeepNonNullable } from './types';
import {
  iapOfferingsByStoreIDsQuery,
  IapOfferingsByStoreIDsResultUtil,
} from './queries/iap-offerings-by-storeids';

@Injectable()
export class ProductConfigurationManager {
  constructor(
    private strapiClient: StrapiClient,
    private priceManager: PriceManager,
    @Inject(StatsDService) private statsd: StatsD
  ) {
    this.strapiClient.on('response', this.onStrapiClientResponse.bind(this));
  }

  onStrapiClientResponse(response: StrapiClientEventResponse) {
    const defaultTags = {
      method: response.method,
      error: response.error ? 'true' : 'false',
      cache: `${response.cache}`,
      cacheType: `${response.cacheType}`,
    };
    const operationName = response.query && getOperationName(response.query);
    const tags = operationName
      ? { ...defaultTags, operationName }
      : defaultTags;
    this.statsd.timing('cms_request', response.elapsed, undefined, tags);
  }

  async fetchCMSData(
    offeringId: string,
    acceptLanguage?: string,
    selectedLanguage?: string
  ) {
    const offeringResult = await this.getPageContentForOffering(
      offeringId,
      acceptLanguage,
      selectedLanguage
    );

    try {
      return offeringResult.getOffering();
    } catch (error) {
      if (error instanceof QueriesUtilError) {
        throw new FetchCmsInvalidOfferingError(error, offeringId);
      } else {
        throw error;
      }
    }
  }

  async getEligibilityContentByOffering(
    apiIdentifier: string
  ): Promise<EligibilityContentByOfferingResultUtil> {
    const queryResult = await this.strapiClient.query(
      eligibilityContentByOfferingQuery,
      {
        apiIdentifier,
      }
    );

    return new EligibilityContentByOfferingResultUtil(
      queryResult as DeepNonNullable<EligibilityContentByOfferingQuery>
    );
  }

  async getPageContentForOffering(
    apiIdentifier: string,
    acceptLanguage?: string,
    selectedLanguage?: string
  ): Promise<PageContentForOfferingResultUtil> {
    const locale = await this.strapiClient.getLocale(
      acceptLanguage,
      selectedLanguage
    );

    const queryResult = await this.strapiClient.query(
      pageContentForOfferingQuery,
      {
        locale,
        apiIdentifier,
      }
    );

    return new PageContentForOfferingResultUtil(
      queryResult as DeepNonNullable<PageContentForOfferingQuery>
    );
  }

  async getPurchaseDetailsForCapabilityServiceByPlanIds(
    stripePlanIds: string[]
  ): Promise<CapabilityServiceByPlanIdsResultUtil> {
    const queryResult = await this.strapiClient.query(
      capabilityServiceByPlanIdsQuery,
      {
        locale: DEFAULT_LOCALE,
        stripePlanIds,
      }
    );

    return new CapabilityServiceByPlanIdsResultUtil(
      queryResult as DeepNonNullable<CapabilityServiceByPlanIdsQuery>
    );
  }

  async getPurchaseDetailsForEligibility(
    stripePlanIds: string[]
  ): Promise<EligibilityContentByPlanIdsResultUtil> {
    const queryResult = await this.strapiClient.query(
      eligibilityContentByPlanIdsQuery,
      {
        locale: DEFAULT_LOCALE,
        stripePlanIds,
      }
    );

    return new EligibilityContentByPlanIdsResultUtil(
      queryResult as DeepNonNullable<EligibilityContentByPlanIdsQuery>
    );
  }

  async getIapOfferings(
    storeIDs: string[]
  ): Promise<IapOfferingsByStoreIDsResultUtil> {
    const queryResult = await this.strapiClient.query(
      iapOfferingsByStoreIDsQuery,
      {
        storeIDs,
      }
    );

    return new IapOfferingsByStoreIDsResultUtil(
      queryResult as DeepNonNullable<IapOfferingsByStoreIDsQuery>
    );
  }

  async getServicesWithCapabilities(): Promise<ServicesWithCapabilitiesResultUtil> {
    const queryResult = await this.strapiClient.query(
      servicesWithCapabilitiesQuery,
      {}
    );

    return new ServicesWithCapabilitiesResultUtil(
      queryResult as DeepNonNullable<ServicesWithCapabilitiesQuery>
    );
  }

  async getPurchaseWithDetailsOfferingContentByPlanIds(
    stripePlanIds: string[],
    acceptLanguage: string
  ): Promise<PurchaseWithDetailsOfferingContentUtil> {
    const locale = await this.strapiClient.getLocale(acceptLanguage);

    const queryResult = await this.strapiClient.query(
      purchaseWithDetailsOfferingContentQuery,
      {
        locale,
        stripePlanIds,
      }
    );

    return new PurchaseWithDetailsOfferingContentUtil(
      queryResult as DeepNonNullable<PurchaseWithDetailsOfferingContentQuery>
    );
  }

  async getOfferingPlanIds(apiIdentifier: string) {
    const offeringResult =
      await this.getEligibilityContentByOffering(apiIdentifier);
    const offering = offeringResult.getOffering();
    const planIds = offering.defaultPurchase.stripePlanChoices.map(
      (el) => el.stripePlanChoice
    );
    return planIds;
  }

  async getSupportedLocale(acceptLanguage: string) {
    return this.strapiClient.getLocale(acceptLanguage);
  }

  async retrieveStripePrice(
    offeringConfigId: string,
    interval: SubplatInterval
  ) {
    try {
      const priceIds = await this.getOfferingPlanIds(offeringConfigId);
      const price = await this.priceManager.retrieveByInterval(
        priceIds,
        interval
      );
      if (!price) {
        throw new RetrieveStripePriceNotFoundError(offeringConfigId, interval);
      }
      return price;
    } catch (error) {
      if (error instanceof QueriesUtilError) {
        throw new RetrieveStripePriceInvalidOfferingError(
          error,
          offeringConfigId
        );
      } else {
        throw error;
      }
    }
  }
}
