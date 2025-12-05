/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable, Logger, type LoggerService } from '@nestjs/common';
import { ChurnInterventionManager } from '@fxa/payments/cart';
import {
  ChurnInterventionByProductIdResultUtil,
  ProductConfigurationManager,
} from '@fxa/shared/cms';
import { SubscriptionManagementService } from './subscriptionManagement.service';
import { StatsDService } from '@fxa/shared/metrics/statsd';
import { StatsD } from 'hot-shots';
import { SubplatInterval } from '@fxa/payments/customer';
import { ChurnInterventionProductIdentifierMissingError } from './churn-intervention.error';

@Injectable()
export class ChurnInterventionService {
  constructor(
    private productConfigurationManager: ProductConfigurationManager,
    private churnInterventionManager: ChurnInterventionManager,
    private subscriptionManagementService: SubscriptionManagementService,
    @Inject(StatsDService) private statsd: StatsD,
    @Inject(Logger) private log: LoggerService
  ) {}

  async getChurnInterventionForCustomerId(
    customerId: string,
    churnInterventionId: string
  ) {
    return this.churnInterventionManager.getEntry(
      customerId,
      churnInterventionId
    );
  }

  async getChurnInterventionForProduct(
    interval: SubplatInterval,
    churnType: 'cancel' | 'stay_subscribed',
    stripeProductId?: string,
    offeringApiIdentifier?: string,
    acceptLanguage?: string,
    selectedLanguage?: string
  ) {
    let util: ChurnInterventionByProductIdResultUtil;
    if (stripeProductId) {
      util = await this.productConfigurationManager.getChurnIntervention(
        interval,
        churnType,
        stripeProductId,
        null,
        acceptLanguage,
        selectedLanguage
      );
    } else if (offeringApiIdentifier) {
      util = await this.productConfigurationManager.getChurnIntervention(
        interval,
        churnType,
        null,
        offeringApiIdentifier,
        acceptLanguage,
        selectedLanguage
      );
    } else {
      throw new ChurnInterventionProductIdentifierMissingError();
    }

    return {
      churnInterventions: util.getTransformedChurnInterventionByProductId(),
    };
  }

  async determineStaySubscribedEligibility(
    uid: string,
    subscriptionId: string,
    acceptLanguage?: string | null,
    selectedLanguage?: string
  ) {
    try {
      const cmsChurnResult =
        await this.productConfigurationManager.getChurnInterventionBySubscription(
          subscriptionId,
          'stay_subscribed',
          acceptLanguage || undefined,
          selectedLanguage
        );

      const cmsChurnInterventionEntries =
        cmsChurnResult.getTransformedChurnInterventionByProductId();
      if (!cmsChurnInterventionEntries.length) {
        this.statsd.increment('stay_subscribed_eligibility', {
          eligibility: 'ineligible',
          reason: 'no_churn_intervention_found',
        });
        return {
          isEligible: false,
          reason: 'no_churn_intervention_found',
          cmsChurnInterventionEntry: null,
        };
      }

      const cmsChurnInterventionEntry = cmsChurnInterventionEntries[0];
      const redemptionCount =
        await this.churnInterventionManager.getRedemptionCountForUid(
          uid,
          cmsChurnInterventionEntry.churnInterventionId
        );

      if (
        cmsChurnInterventionEntry.redemptionLimit &&
        redemptionCount >= cmsChurnInterventionEntry.redemptionLimit
      ) {
        this.statsd.increment('stay_subscribed_eligibility', {
          eligibility: 'ineligible',
          reason: 'discount_already_applied',
        });
        return {
          isEligible: false,
          reason: 'discount_already_applied',
          cmsChurnInterventionEntry: null,
        };
      }

      const subscriptionStatus =
        await this.subscriptionManagementService.getSubscriptionStatus(
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
        };
      }
      if (!subscriptionStatus.cancelAtPeriodEnd) {
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
      };
    } catch (error) {
      this.log.error(error);
      return {
        isEligible: false,
        reason: 'general_error',
        cmsChurnInterventionEntry: null,
      };
    }
  }

  async redeemChurnCoupon(
    uid: string,
    subscriptionId: string,
    acceptLanguage?: string | null,
    selectedLanguage?: string
  ) {
    const eligibilityResult = await this.determineStaySubscribedEligibility(
      uid,
      subscriptionId,
      acceptLanguage,
      selectedLanguage
    );

    if (
      !eligibilityResult.isEligible ||
      !eligibilityResult.cmsChurnInterventionEntry
    ) {
      return {
        redeemed: false,
        reason: eligibilityResult.reason,
        updatedChurnInterventionEntryData: null,
        cmsChurnInterventionEntry: eligibilityResult.cmsChurnInterventionEntry,
      };
    }

    try {
      const updatedSubscription =
        await this.subscriptionManagementService.applyStripeCouponToSubscription(
          {
            uid,
            subscriptionId,
            stripeCouponId:
              eligibilityResult.cmsChurnInterventionEntry.stripeCouponId,
            setCancelAtPeriodEnd: true,
          }
        );
      if (
        !updatedSubscription ||
        updatedSubscription.cancel_at_period_end !== true
      ) {
        return {
          redeemed: false,
          reason: 'stripe_subscription_update_failed',
          updatedChurnInterventionEntryData: null,
          cmsChurnInterventionEntry:
            eligibilityResult.cmsChurnInterventionEntry,
        };
      }

      const updatedEntry = await this.churnInterventionManager.updateEntry(
        uid,
        eligibilityResult.cmsChurnInterventionEntry.churnInterventionId,
        1
      );

      return {
        redeemed: true,
        reason: 'successfully_redeemed',
        updatedChurnInterventionEntryData: updatedEntry,
        cmsChurnInterventionEntry: eligibilityResult.cmsChurnInterventionEntry,
      };
    } catch (error) {
      this.log.error(error);
      return {
        redeemed: false,
        reason: 'failed_to_redeem_coupon',
        updatedChurnInterventionEntryData: null,
        cmsChurnInterventionEntry: eligibilityResult.cmsChurnInterventionEntry,
      };
    }
  }
}
