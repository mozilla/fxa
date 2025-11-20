/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable, Logger, type LoggerService } from '@nestjs/common';
import { ChurnInterventionRecordManager, ChurnInterventionEntryNotFoundError } from '@fxa/payments/cart';
import {
  ProductConfigurationManager,
} from '@fxa/shared/cms';
import { SubscriptionManagementService } from './subscriptionManagement.service';
import {
  StatsDService,
} from '@fxa/shared/metrics/statsd';
import { StatsD } from 'hot-shots';

@Injectable()
export class ChurnInterventionService {
  constructor(
    private productConfigurationManager: ProductConfigurationManager,
    private churnInterventionRecordManager: ChurnInterventionRecordManager,
    private subscriptionManagementService: SubscriptionManagementService,
    @Inject(StatsDService) private statsd: StatsD,
    @Inject(Logger) private log: LoggerService,
  ) {}


  async getEntry(
    customerId: string,
    churnInterventionId: string
  ) {
    return this.churnInterventionRecordManager.getEntry(
      customerId,
      churnInterventionId
    );
  }

  async determineStaySubscribedEligibility(
    uid: string,
    subscriptionId: string,
    acceptLanguage?: string | null,
    selectedLanguage?: string,
  ) {
    try {
      const cmsChurnResult =
        await this.productConfigurationManager.getChurnInterventionBySubscription(
          subscriptionId,
          'stay_subscribed',
          acceptLanguage || undefined,
          selectedLanguage
        );

      const cmsChurnInterventionEntries = cmsChurnResult.getTransformedChurnInterventionByProductId();
      if (!cmsChurnInterventionEntries.length) {
        this.statsd.increment('stay_subscribed_eligibility', {
          eligibility: 'ineligible',
          reason: 'no_churn_intervention_found',
        });
        return {
          isEligible: false,
          reason: 'no_churn_intervention_found',
          cmsChurnInterventionEntry: null,
        }
      }

      const cmsChurnInterventionEntry = cmsChurnInterventionEntries[0];
      let redemptionCount = 0;
      try {
        const churnInterventionEntryData = await this.churnInterventionRecordManager.getEntry(
          uid,
          cmsChurnInterventionEntry.churnInterventionId
        );
        redemptionCount = churnInterventionEntryData.redemptionCount ?? 0;
      } catch (error) {
        if (error instanceof ChurnInterventionEntryNotFoundError) {
          redemptionCount = 0;
        } else {
          throw error
        }
      }

      if (cmsChurnInterventionEntry.redemptionLimit && redemptionCount >= cmsChurnInterventionEntry.redemptionLimit) {
        this.statsd.increment('stay_subscribed_eligibility', {
          eligibility: 'ineligible',
          reason: 'discount_already_applied',
        });
        return {
          isEligible: false,
          reason: 'discount_already_applied',
          cmsChurnInterventionEntry: null,
        }
      }

      const subscriptionStatus = await this.subscriptionManagementService.getSubscriptionStatus(
        uid,
        subscriptionId
      );
      if (!subscriptionStatus.active) {
        this.statsd.increment('stay_subscribed_eligibility', {
          eligibility: 'ineligible',
          reason: 'subscription_not_active',
        });
        return {
          isEligible: false,
          reason: 'subscription_not_active',
          cmsChurnInterventionEntry: null,
        }
      }
      if (!subscriptionStatus.cancel_at_period_end) {
        this.statsd.increment('stay_subscribed_eligibility', {
          eligibility: 'ineligible',
          reason: 'subscription_still_active',
        });
        return {
          isEligible: false,
          reason: 'subscription_still_active',
          cmsChurnInterventionEntry: null,
        };
      }

      this.statsd.increment('stay_subscribed_eligibility', {
        eligibility: 'eligible',
      });
      return {
        isEligible: true,
        reason: 'eligible',
        cmsChurnInterventionEntry,
      }
    } catch (error) {
      this.log.error(error);
      return {
        isEligible: false,
        reason: 'general_error',
        cmsChurnInterventionEntry: null,
      }
    }
  }
}
