/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable, Logger, type LoggerService } from '@nestjs/common';
import {
  ChurnInterventionConfig,
  ChurnInterventionManager,
} from '@fxa/payments/cart';
import {
  ChurnInterventionByProductIdResultUtil,
  ProductConfigurationManager,
} from '@fxa/shared/cms';
import {
  EligibilityService,
  EligibilityStatus,
} from '@fxa/payments/eligibility';
import { StatsDService } from '@fxa/shared/metrics/statsd';
import { StatsD } from 'hot-shots';
import { SubplatInterval, SubscriptionManager } from '@fxa/payments/customer';
import { AccountCustomerManager } from '@fxa/payments/stripe';
import { ProfileClient } from '@fxa/profile/client';
import { NotifierService } from '@fxa/shared/notifier';
import {
  ChurnInterventionProductIdentifierMissingError,
} from './churn-intervention.error';

@Injectable()
export class ChurnInterventionService {
  constructor(
    private accountCustomerManager: AccountCustomerManager,
    private productConfigurationManager: ProductConfigurationManager,
    private churnInterventionManager: ChurnInterventionManager,
    private eligibilityService: EligibilityService,
    private notifierService: NotifierService,
    private profileClient: ProfileClient,
    private subscriptionManager: SubscriptionManager,
    @Inject(StatsDService) private statsd: StatsD,
    @Inject(Logger) private log: LoggerService,
    private churnInterventionConfig: ChurnInterventionConfig
  ) {}

  private isFeatureEnabled(): boolean {
    return this.churnInterventionConfig.enabled ?? false;
  }

  /**
   * Reload the customer data to reflect a change.
   * NOTE: This is currently duplicated in subscriptionManagement.service.ts
   */
  private async customerChanged(uid: string) {
    await this.profileClient.deleteCache(uid);

    this.notifierService.send({
      event: 'profileDataChange',
      data: {
        ts: Date.now() / 1000,
        uid,
      },
    });
  }

  async getChurnInterventionForCustomerId(
    customerId: string,
    churnInterventionId: string
  ) {
    return this.churnInterventionManager.getOrCreateEntry(
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
    if (!this.isFeatureEnabled()) {
      return { churnInterventions: [] };
    }

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

  /**
   * Determines whether a customer is eligible for churn intervention that encourages
   * them to stay subscribed.
   */
  async determineStaySubscribedEligibility(
    uid: string,
    subscriptionId: string,
    acceptLanguage?: string | null,
    selectedLanguage?: string
  ) {
    if (!this.isFeatureEnabled()) {
      return {
        isEligible: false,
        reason: 'feature_disabled',
        cmsChurnInterventionEntry: null,
        cmsOfferingContent: null,
      };
    }

    try {
      const [accountCustomer, subscription] = await Promise.all([
        this.accountCustomerManager.getAccountCustomerByUid(uid),
        this.subscriptionManager.retrieve(subscriptionId),
      ]);

      if (!subscription) {
        this.statsd.increment('stay_subscribed_eligibility', {
          eligibility: 'ineligible',
          reason: 'subscription_not_found',
        });
        return {
          isEligible: false,
          reason: 'subscription_not_found',
          cmsChurnInterventionEntry: null,
          cmsOfferingContent: null,
        };
      }

      if (subscription.customer !== accountCustomer.stripeCustomerId) {
        this.statsd.increment('stay_subscribed_eligibility', {
          eligibility: 'ineligible',
          reason: 'customer_mismatch',
        });
        return {
          isEligible: false,
          reason: 'customer_mismatch',
          cmsChurnInterventionEntry: null,
          cmsOfferingContent: null,
        };
      }

      const subscriptionStatus =
        await this.subscriptionManager.getSubscriptionStatus(
          subscription.customer,
          subscriptionId
        );

      try {
        const cmsChurnResult =
          await this.productConfigurationManager.getChurnInterventionBySubscription(
            subscriptionId,
            'stay_subscribed',
            acceptLanguage || undefined,
            selectedLanguage
          );

        const cmsContent = cmsChurnResult.cmsOfferingContent();

        if (!subscriptionStatus.active) {
          this.statsd.increment('stay_subscribed_eligibility', {
            eligibility: 'ineligible',
            reason: 'subscription_not_active',
          });
          return {
            isEligible: false,
            reason: 'subscription_not_active',
            cmsChurnInterventionEntry: null,
            cmsOfferingContent: cmsContent,
          };
        }

        const cmsChurnInterventionEntries =
          cmsChurnResult.getTransformedChurnInterventionByProductId();
        const cmsChurnInterventionEntry = cmsChurnInterventionEntries[0];

        if (!subscriptionStatus.cancelAtPeriodEnd) {
          this.statsd.increment('stay_subscribed_eligibility', {
            eligibility: 'ineligible',
            reason: 'subscription_still_active',
          });
          return {
            isEligible: false,
            reason: 'subscription_still_active',
            cmsChurnInterventionEntry,
            cmsOfferingContent: cmsContent,
          };
        }

        if (!cmsChurnInterventionEntries.length) {
          this.statsd.increment('stay_subscribed_eligibility', {
            eligibility: 'ineligible',
            reason: 'no_churn_intervention_found',
          });
          return {
            isEligible: false,
            reason: 'no_churn_intervention_found',
            cmsChurnInterventionEntry: null,
            cmsOfferingContent: cmsContent,
          };
        }

        const redemptionCount =
          await this.churnInterventionManager.getRedemptionCountForUid(
            uid,
            cmsChurnInterventionEntry.churnInterventionId
          );

        const limit = cmsChurnInterventionEntry.redemptionLimit;

        // redemptionLimit is allowed to be null/undefined but not 0
        // Coupon may be redeemed indefinitely
        const hasLimit = typeof limit === 'number';

        if (hasLimit && redemptionCount >= limit) {
          this.statsd.increment('stay_subscribed_eligibility', {
            eligibility: 'ineligible',
            reason: 'redemption_limit_exceeded',
          });
          return {
            isEligible: false,
            reason: 'redemption_limit_exceeded',
            cmsChurnInterventionEntry: null,
            cmsOfferingContent: cmsContent,
          };
        }

        const churnCouponId = cmsChurnInterventionEntry.stripeCouponId;
        const couponAlreadyApplied = await this.subscriptionManager.hasCouponId(
          subscriptionId,
          churnCouponId
        );

        if (couponAlreadyApplied) {
          this.statsd.increment('stay_subscribed_eligibility', {
            eligibility: 'ineligible',
            reason: 'discount_already_applied',
          });
          return {
            isEligible: false,
            reason: 'discount_already_applied',
            cmsChurnInterventionEntry: null,
            cmsOfferingContent: cmsContent,
          };
        }

        this.statsd.increment('stay_subscribed_eligibility', {
          eligibility: 'eligible',
        });
        return {
          isEligible: true,
          reason: 'eligible',
          cmsChurnInterventionEntry,
          cmsOfferingContent: null,
        };
      } catch (error) {
        this.log.error(error);
        return {
          isEligible: false,
          reason: 'general_error',
          cmsChurnInterventionEntry: null,
          cmsOfferingContent: null,
        };
      }
    } catch (error) {
      this.log.error(error);
      return {
        isEligible: false,
        reason: 'general_error',
        cmsChurnInterventionEntry: null,
        cmsOfferingContent: null,
      };
    }
  }

  async redeemChurnCoupon(
    uid: string,
    subscriptionId: string,
    churnType: 'cancel' | 'stay_subscribed',
    acceptLanguage?: string | null,
    selectedLanguage?: string
  ) {
    if (!this.isFeatureEnabled()) {
      return {
        redeemed: false,
        errorCode: 'feature_disabled',
      };
    }
    let eligibilityResult;
    if (churnType === 'cancel') {
      eligibilityResult = await this.determineCancelChurnContentEligibility({
        uid,
        subscriptionId,
        acceptLanguage,
        selectedLanguage,
      });
    }
    if (churnType === 'stay_subscribed') {
      eligibilityResult = await this.determineStaySubscribedEligibility(
        uid,
        subscriptionId,
        acceptLanguage,
        selectedLanguage
      );
    }

    if (
      !eligibilityResult ||
      !eligibilityResult.isEligible ||
      !eligibilityResult.cmsChurnInterventionEntry
    ) {
      return {
        redeemed: false,
        reason: eligibilityResult?.reason,
        updatedChurnInterventionEntryData: null,
        cmsChurnInterventionEntry: eligibilityResult?.cmsChurnInterventionEntry,
      };
    }

    try {
      const accountCustomer =
        await this.accountCustomerManager.getAccountCustomerByUid(uid);
      const subscription =
        await this.subscriptionManager.retrieve(subscriptionId);

      if (subscription.customer !== accountCustomer.stripeCustomerId) {
        return {
          redeemed: false,
          reason: 'customer_mismatch',
          updatedChurnInterventionEntryData: null,
          cmsChurnInterventionEntry:
            eligibilityResult.cmsChurnInterventionEntry,
        };
      }

      const updatedSubscription =
        await this.subscriptionManager.resubscribeWithCoupon({
          customerId: subscription.customer,
          subscriptionId,
          stripeCouponId:
            eligibilityResult.cmsChurnInterventionEntry.stripeCouponId,
        });
      await this.customerChanged(uid);

      if (
        !updatedSubscription ||
        updatedSubscription.cancel_at_period_end === true
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

  /**
   * Determines which cancellation intervention flow (either churn intervention
   * or cancel interstitial offer) should be presented to the customer
   * when attempting to cancel a subscription.
   */
  async determineCancellationIntervention(args: {
    uid: string;
    subscriptionId: string;
    acceptLanguage?: string | null;
    selectedLanguage?: string;
  }) {
    if (!this.isFeatureEnabled()) {
      return {
        cancelChurnInterventionType: 'none',
        cmsOfferContent: null,
      };
    }

    try {
      const cancelChurnContentEligiblityResult =
        await this.determineCancelChurnContentEligibility({
          uid: args.uid,
          subscriptionId: args.subscriptionId,
          acceptLanguage: args.acceptLanguage,
          selectedLanguage: args.selectedLanguage,
        });

      if (cancelChurnContentEligiblityResult.isEligible) {
        return {
          cancelChurnInterventionType: 'cancel_churn_intervention',
          reason: 'eligible',
          cmsOfferContent:
            cancelChurnContentEligiblityResult.cmsChurnInterventionEntry,
        };
      }

      const cancelInterstitialOfferEligiblityResult =
        await this.determineCancelInterstitialOfferEligibility(args);

      if (cancelInterstitialOfferEligiblityResult.isEligible) {
        return {
          cancelChurnInterventionType: 'cancel_interstitial_offer',
          reason: 'eligible',
          cmsOfferContent:
            cancelInterstitialOfferEligiblityResult.cmsCancelInterstitialOfferResult,
        };
      }

      return {
        cancelChurnInterventionType: 'none',
        reason: cancelChurnContentEligiblityResult.reason,
        cmsOfferContent: null,
      };
    } catch (error) {
      this.log.error(error);
      return {
        cancelChurnInterventionType: 'none',
        reason: 'general_error',
        cmsOfferContent: null,
      };
    }
  }

  /**
   * Determines whether a customer is eligible for a cancel interstitial offer
   * (e.g. switching from a monthly to a yearly plan) when attempting to cancel.
   */
  async determineCancelInterstitialOfferEligibility(args: {
    uid: string;
    subscriptionId: string;
    acceptLanguage?: string | null;
    selectedLanguage?: string;
  }) {
    if (!this.isFeatureEnabled()) {
      return {
        isEligible: false,
        reason: 'feature_disabled',
        cmsOfferContent: null,
        cmsOfferingContent: null,
        webIcon: null,
        productName: null,
      };
    }

    try {
      const [accountCustomer, subscription] = await Promise.all([
        this.accountCustomerManager.getAccountCustomerByUid(args.uid),
        this.subscriptionManager.retrieve(args.subscriptionId),
      ]);

      if (!subscription) {
        this.statsd.increment('cancel_intervention_decision', {
          type: 'none',
          reason: 'subscription_not_found',
        });
        return {
          isEligible: false,
          reason: 'subscription_not_found',
          cmsCancelInterstitialOfferResult: null,
          webIcon: null,
          productName: null,
        };
      }

      if (subscription.customer !== accountCustomer.stripeCustomerId) {
        this.statsd.increment('cancel_intervention_decision', {
          type: 'none',
          reason: 'customer_mismatch',
        });
        return {
          isEligible: false,
          reason: 'customer_mismatch',
          cmsCancelInterstitialOfferResult: null,
          webIcon: null,
          productName: null,
        };
      }

      const stripePriceId = subscription.items.data.at(0)?.price.id;

      if (!stripePriceId) {
        this.statsd.increment('cancel_intervention_decision', {
          type: 'none',
          reason: 'stripe_price_id_not_found',
        });
        return {
          isEligible: false,
          reason: 'stripe_price_id_not_found',
          cmsCancelInterstitialOfferResult: null,
          webIcon: null,
          productName: null,
        };
      }

      const result =
        await this.productConfigurationManager.getPageContentByPriceIds([
          stripePriceId,
        ]);
      const { offering, purchaseDetails } = result.purchaseForPriceId(stripePriceId);
      const offeringId = offering?.apiIdentifier;
      const { webIcon, productName } = purchaseDetails;

      const subscriptionStatus =
        await this.subscriptionManager.getSubscriptionStatus(
          subscription.customer,
          args.subscriptionId
        );

      if (!subscriptionStatus.active) {
        this.statsd.increment('cancel_intervention_decision', {
          type: 'none',
          reason: 'subscription_not_active',
        });
        return {
          isEligible: false,
          reason: 'subscription_not_active',
          cmsCancelInterstitialOfferResult: null,
          webIcon,
          productName,
        };
      }

      if (subscriptionStatus.cancelAtPeriodEnd) {
        this.statsd.increment('cancel_intervention_decision', {
          type: 'none',
          reason: 'already_canceling_at_period_end',
        });
        return {
          isEligible: false,
          reason: 'already_canceling_at_period_end',
          cmsCancelInterstitialOfferResult: null,
          webIcon,
          productName,
        };
      }

      const upgradeInterval = SubplatInterval.Yearly;

      let currentInterval;
      try {
        currentInterval =
          await this.productConfigurationManager.getSubplatIntervalBySubscription(
            subscription
          );
      } catch {
        this.statsd.increment('cancel_intervention_decision', {
          type: 'none',
          reason: 'current_interval_not_found',
        });
        return {
          isEligible: false,
          reason: 'current_interval_not_found',
          cmsCancelInterstitialOfferResult: null,
          webIcon,
          productName,
        };
      }

      if (!offeringId) {
        this.statsd.increment('cancel_intervention_decision', {
          type: 'none',
          reason: 'offering_id_not_found',
        });
        return {
          isEligible: false,
          reason: 'offering_id_not_found',
          cmsCancelInterstitialOfferResult: null,
          webIcon,
          productName,
        };
      }

      const cmsCancelInterstitialOffer =
        await this.productConfigurationManager.getCancelInterstitialOffer(
          offeringId,
          currentInterval,
          upgradeInterval,
          args.acceptLanguage || undefined,
          args.selectedLanguage
        );
      const cmsCancelInterstitialOfferResult =
        cmsCancelInterstitialOffer.getTransformedResult();

      if (!cmsCancelInterstitialOfferResult) {
        this.statsd.increment('cancel_intervention_decision', {
          type: 'none',
          reason: 'no_cancel_interstitial_offer_found',
        });
        return {
          isEligible: false,
          reason: 'no_cancel_interstitial_offer_found',
          cmsCancelInterstitialOfferResult: null,
          webIcon,
          productName,
        };
      }

      try {
        await this.productConfigurationManager.retrieveStripePrice(
          offeringId,
          upgradeInterval
        );
      } catch {
        this.statsd.increment('cancel_intervention_decision', {
          type: 'none',
          reason: 'no_upgrade_plan_found',
        });
        return {
          isEligible: false,
          reason: 'no_upgrade_plan_found',
          cmsCancelInterstitialOfferResult: null,
          webIcon,
          productName,
        };
      }

      const eligibility = await this.eligibilityService.checkEligibility(
        upgradeInterval,
        offeringId,
        args.uid,
        subscription.customer
      );

      if (
        eligibility.subscriptionEligibilityResult !== EligibilityStatus.UPGRADE
      ) {
        this.statsd.increment('cancel_intervention_decision', {
          type: 'none',
          reason: 'not_eligible_for_upgrade_interval',
        });
        return {
          isEligible: false,
          reason: 'not_eligible_for_upgrade_interval',
          cmsCancelInterstitialOfferResult: null,
          webIcon,
          productName,
        };
      }

      this.statsd.increment('cancel_intervention_decision', {
        type: 'cancel_interstitial_offer',
      });
      return {
        isEligible: true,
        reason: 'eligible',
        cmsCancelInterstitialOfferResult,
        webIcon,
        productName,
      };
    } catch (error) {
      this.log.error(error);
      return {
        isEligible: false,
        reason: 'general_error',
        cmsCancelInterstitialOfferResult: null,
        webIcon: null,
        productName: null,
      };
    }
  }

  /**
   * Determines whether a customer is eligible for churn intervention
   * when attempting to cancel a subscription.
   */
  async determineCancelChurnContentEligibility(args: {
    uid: string;
    subscriptionId: string;
    acceptLanguage?: string | null;
    selectedLanguage?: string;
  }) {
    if (!this.isFeatureEnabled()) {
      return {
        isEligible: false,
        reason: 'feature_disabled',
        cmsChurnInterventionEntry: null,
      };
    }

    try {
      const [accountCustomer, subscription] = await Promise.all([
        this.accountCustomerManager.getAccountCustomerByUid(args.uid),
        this.subscriptionManager.retrieve(args.subscriptionId),
      ]);

      if (!subscription) {
        this.statsd.increment('cancel_intervention_decision', {
          type: 'none',
          reason: 'subscription_not_found',
        });
        return {
          isEligible: false,
          reason: 'subscription_not_found',
          cmsChurnInterventionEntry: null,
          cmsOfferingContent: null,
        };
      }

      if (subscription.customer !== accountCustomer.stripeCustomerId) {
        this.statsd.increment('cancel_intervention_decision', {
          type: 'none',
          reason: 'customer_mismatch',
        });
        return {
          isEligible: false,
          reason: 'customer_mismatch',
          cmsChurnInterventionEntry: null,
          cmsOfferingContent: null,
        }
      }

      const subscriptionStatus =
        await this.subscriptionManager.getSubscriptionStatus(
          subscription.customer,
          args.subscriptionId
        );

      const cmsChurnResult =
        await this.productConfigurationManager.getChurnInterventionBySubscription(
          args.subscriptionId,
          'cancel',
          args.acceptLanguage || undefined,
          args.selectedLanguage
        );

      const cmsContent = cmsChurnResult.cmsOfferingContent();

      if (!subscriptionStatus.active) {
        this.statsd.increment('cancel_intervention_decision', {
          type: 'none',
          reason: 'subscription_not_active',
        });
        return {
          isEligible: false,
          reason: 'subscription_not_active',
          cmsChurnInterventionEntry: null,
          cmsOfferingContent: cmsContent,
        };
      }

      const cmsChurnInterventionEntries =
        cmsChurnResult.getTransformedChurnInterventionByProductId();
      const cmsChurnInterventionEntry = cmsChurnInterventionEntries[0];

      if (subscriptionStatus.cancelAtPeriodEnd) {
        this.statsd.increment('cancel_intervention_decision', {
          type: 'none',
          reason: 'already_canceling_at_period_end',
        });
        return {
          isEligible: false,
          reason: 'already_canceling_at_period_end',
          cmsChurnInterventionEntry: cmsChurnInterventionEntry,
          cmsOfferingContent: cmsContent,
        };
      }

      if (!cmsChurnInterventionEntries.length) {
        this.statsd.increment('cancel_intervention_decision', {
          type: 'none',
          reason: 'no_churn_intervention_found',
        });
        return {
          isEligible: false,
          reason: 'no_churn_intervention_found',
          cmsChurnInterventionEntry: null,
          cmsOfferingContent: cmsContent,
        };
      }

      const redemptionCount =
        await this.churnInterventionManager.getRedemptionCountForUid(
          args.uid,
          cmsChurnInterventionEntry.churnInterventionId
        );

      const limit = cmsChurnInterventionEntry.redemptionLimit;

      // redemptionLimit is allowed to be null/undefined but not 0
      // Coupon may be redeemed indefinitely
      const hasLimit = typeof limit === 'number';

      if (hasLimit && redemptionCount >= limit) {
        this.statsd.increment('cancel_intervention_decision', {
          type: 'none',
          reason: 'redemption_limit_exceeded',
        });
        return {
          isEligible: false,
          reason: 'redemption_limit_exceeded',
          cmsChurnInterventionEntry: null,
          cmsOfferingContent: cmsContent,
        };
      }

      const churnCouponId = cmsChurnInterventionEntry.stripeCouponId;
      const couponAlreadyApplied = await this.subscriptionManager.hasCouponId(
        args.subscriptionId,
        churnCouponId
      );

      if (couponAlreadyApplied) {
        this.statsd.increment('cancel_intervention_decision', {
          type: 'none',
          reason: 'discount_already_applied',
        });
        return {
          isEligible: false,
          reason: 'discount_already_applied',
          cmsChurnInterventionEntry,
          cmsOfferingContent: cmsContent,
        };
      }

      this.statsd.increment('cancel_intervention_decision', {
        type: 'cancel_churn_intervention',
      });
      return {
        isEligible: true,
        reason: 'eligible',
        cmsChurnInterventionEntry,
        cmsOfferingContent: null,
      };
    } catch (error) {
      this.log.error(error);
      return {
        isEligible: false,
        reason: 'general_error',
        cmsChurnInterventionEntry: null,
        cmsOfferingContent: null,
      };
    }
  }
}
