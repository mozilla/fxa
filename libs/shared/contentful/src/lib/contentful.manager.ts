/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { Injectable } from '@nestjs/common';

import { ContentfulClient } from './contentful.client';
import { ContentfulResultProcessingError } from './contentful.error';
import {
  eligibilityContentByPlanIdsQuery,
  EligibilityContentByPlanIdsResult,
} from './queries/eligibility-content-by-plan-ids';

@Injectable()
export class ContentfulManager {
  constructor(private client: ContentfulClient) {}

  async getPurchaseDetailsForEligibility(
    stripePlanIds: string[]
  ): Promise<EligibilityContentByPlanIdsResult> {
    const queryResult = await this.client.query(
      eligibilityContentByPlanIdsQuery,
      {
        skip: 0,
        limit: 100,
        locale: 'en-US',
        stripePlanIds,
      }
    );
    if (!queryResult) {
      return { purchases: [] };
    }

    const result = plainToClass(
      EligibilityContentByPlanIdsResult,
      queryResult.data
    );
    const validationErrors = await validate(result);
    if (validationErrors.length > 0) {
      throw new ContentfulResultProcessingError(validationErrors);
    }

    return result;
  }
}
