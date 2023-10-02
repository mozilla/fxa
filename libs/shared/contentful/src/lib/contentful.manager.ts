/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';

import { EligibilityContentByPlanIdsQuery } from '../__generated__/graphql';
import { ContentfulClient } from './contentful.client';
import {
  eligibilityContentByPlanIdsQuery,
  EligibilityContentByPlanIdsResultUtil,
} from './queries/eligibility-content-by-plan-ids';
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
        locale: 'en-US',
        stripePlanIds,
      }
    );

    return new EligibilityContentByPlanIdsResultUtil(
      queryResult.data as DeepNonNullable<EligibilityContentByPlanIdsQuery>
    );
  }
}
