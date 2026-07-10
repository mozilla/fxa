/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import type { ZodError } from 'zod';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { z } from 'zod';
import {
  offeringValidationSchema,
  purchaseValidationSchema,
  purchaseDetailValidationSchema,
  commonContentValidationSchema,
  capabilityValidationSchema,
  serviceValidationSchema,
  subgroupValidationSchema,
  iapValidationSchema,
  churnInterventionValidationSchema,
  cancelInterstitialOfferValidationSchema,
  couponConfigValidationSchema,
  validationOfferingsQuery,
  validationPurchasesQuery,
  validationPurchaseDetailsQuery,
  validationCommonContentsQuery,
  validationCapabilitiesQuery,
  validationServicesQuery,
  validationSubgroupsQuery,
  validationIapsQuery,
  validationChurnInterventionsQuery,
  validationCancelInterstitialOffersQuery,
  validationCouponConfigsQuery,
} from './queries/validation';
import { CmsValidationError } from './cms.error';
import { StrapiClient } from './strapi.client';

@Injectable()
export class CmsContentValidationManager {
  constructor(private strapiClient: StrapiClient) {}

  async validateAll(): Promise<CmsValidationError[]> {
    const errors: CmsValidationError[] = [];

    const results = await Promise.all([
      this.validateEntries(
        'offering',
        validationOfferingsQuery,
        'offerings',
        offeringValidationSchema
      ),
      this.validateEntries(
        'purchase',
        validationPurchasesQuery,
        'purchases',
        purchaseValidationSchema
      ),
      this.validateEntries(
        'purchase-detail',
        validationPurchaseDetailsQuery,
        'purchaseDetails',
        purchaseDetailValidationSchema
      ),
      this.validateEntries(
        'common-content',
        validationCommonContentsQuery,
        'commonContents',
        commonContentValidationSchema
      ),
      this.validateEntries(
        'capability',
        validationCapabilitiesQuery,
        'capabilities',
        capabilityValidationSchema
      ),
      this.validateEntries(
        'service',
        validationServicesQuery,
        'services',
        serviceValidationSchema
      ),
      this.validateEntries(
        'subgroup',
        validationSubgroupsQuery,
        'subgroups',
        subgroupValidationSchema
      ),
      this.validateEntries(
        'iap',
        validationIapsQuery,
        'iaps',
        iapValidationSchema
      ),
      this.validateEntries(
        'churn-intervention',
        validationChurnInterventionsQuery,
        'churnInterventions',
        churnInterventionValidationSchema
      ),
      this.validateEntries(
        'cancel-interstitial-offer',
        validationCancelInterstitialOffersQuery,
        'cancelInterstitialOffers',
        cancelInterstitialOfferValidationSchema
      ),
      this.validateEntries(
        'coupon-config',
        validationCouponConfigsQuery,
        'couponConfigs',
        couponConfigValidationSchema
      ),
    ]);

    for (const result of results) {
      if (result) {
        errors.push(result);
      }
    }

    return errors;
  }

  private async validateEntries<
    TKey extends string,
    TResult extends { [K in TKey]: (unknown | null)[] },
    TVariables extends Record<string, never>,
  >(
    model: string,
    query: TypedDocumentNode<TResult, TVariables>,
    resultKey: TKey,
    schema: z.ZodType
  ): Promise<CmsValidationError | null> {
    const result = await this.strapiClient.queryUncached(
      query,
      {} as TVariables
    );

    const entries = result[resultKey];
    if (!entries) {
      return null;
    }

    const zodErrors: ZodError[] = [];
    for (const entry of entries) {
      if (!entry) continue;
      const parseResult = schema.safeParse(entry);
      if (!parseResult.success) {
        zodErrors.push(parseResult.error);
      }
    }

    if (zodErrors.length > 0) {
      return new CmsValidationError(model, zodErrors);
    }

    return null;
  }
}
