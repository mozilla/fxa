/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { getUidAndEmailByStripeCustomerId } from 'fxa-shared/db/models/auth';
import { commaSeparatedListToArray } from 'fxa-shared/lib/utils';
import { ALL_RPS_CAPABILITIES_KEY } from 'fxa-shared/subscriptions/configuration/base';
import { productUpgradeFromProductConfig } from 'fxa-shared/subscriptions/configuration/utils';
import { metadataFromPlan } from 'fxa-shared/subscriptions/metadata';
import {
  ACTIVE_SUBSCRIPTION_STATUSES,
  getSubscriptionUpdateEligibility,
} from 'fxa-shared/subscriptions/stripe';
import {
  AbbrevPlan,
  ClientIdCapabilityMap,
  SubscriptionChangeEligibility,
  SubscriptionEligibilityResult,
  SubscriptionUpdateEligibility,
} from 'fxa-shared/subscriptions/types';
import isEqual from 'lodash/isEqual';
import Stripe from 'stripe';
import Container from 'typedi';

import { CapabilityManager } from '@fxa/payments/capability';
import {
  EligibilityManager,
  IntervalComparison,
  intervalComparison,
  OfferingComparison,
} from '@fxa/payments/eligibility';
import * as Sentry from '@sentry/node';
import { SeverityLevel } from '@sentry/core';

import error from '../error';
import { authEvents } from '../events';
import { AppConfig, AuthLogger, AuthRequest } from '../types';
import { ConfigType } from '../../config';
import { PaymentConfigManager } from './configuration/manager';
import { AppleIAP } from './iap/apple-app-store/apple-iap';
import { AppStoreSubscriptionPurchase } from './iap/apple-app-store/subscription-purchase';
import { PlayBilling } from './iap/google-play/play-billing';
import { PlayStoreSubscriptionPurchase } from './iap/google-play/subscription-purchase';
import { PurchaseQueryError } from './iap/google-play/types';
import { StripeHelper } from './stripe';
import {
  clientIdCapabilityMapFromMetadata,
  sortClientCapabilities,
} from './utils';
import { ProfileClient } from '@fxa/profile/client';
import { reportSentryError, reportSentryMessage } from '../sentry';

function hex(blob: Buffer | string): string {
  if (Buffer.isBuffer(blob)) {
    return blob.toString('hex');
  }
  return blob;
}

// Flatten all the capabilities from a clientId to capability map into a single
// array of capabilities.
function allCapabilities(capabilityMap: ClientIdCapabilityMap): string[] {
  return [...new Set(Object.values(capabilityMap).flat())];
}

/**
 * Handles capability lookups, capability mapping between Stripe and IAP systems
 * and active subscription capability calculations and event emitting.
 */
export class CapabilityService {
  private log: AuthLogger;
  private appleIap?: AppleIAP;
  private playBilling?: PlayBilling;
  private stripeHelper: StripeHelper;
  private profileClient: ProfileClient;
  private paymentConfigManager?: PaymentConfigManager;
  private capabilityManager?: CapabilityManager;
  private eligibilityManager?: EligibilityManager;
  private config: ConfigType;

  constructor() {
    // TODO: the mock stripeHelper here fixes this specific instance when
    // stripe isn't configured, but we should have a better strategy
    // in general as this helper becomes more pervasive
    this.stripeHelper = Container.has(StripeHelper)
      ? Container.get(StripeHelper)
      : ({
          iapPurchasesToPriceIds: () => Promise.resolve([]),
          fetchCustomer: () => Promise.resolve(null),
          allAbbrevPlans: () => Promise.resolve([]),
        } as unknown as StripeHelper);
    this.profileClient = Container.get(ProfileClient);
    if (Container.has(PlayBilling)) {
      this.playBilling = Container.get(PlayBilling);
    }
    if (Container.has(AppleIAP)) {
      this.appleIap = Container.get(AppleIAP);
    }
    if (Container.has(PaymentConfigManager)) {
      this.paymentConfigManager = Container.get(PaymentConfigManager);
    }
    if (Container.has(CapabilityManager)) {
      this.capabilityManager = Container.get(CapabilityManager);
    }
    if (Container.has(EligibilityManager)) {
      this.eligibilityManager = Container.get(EligibilityManager);
    }

    this.config = Container.get(AppConfig);
    this.log = Container.get(AuthLogger);

    // Register the event handlers for capability changes.
    authEvents.on(
      'account:capabilitiesAdded',
      this.broadcastCapabilitiesAdded.bind(this)
    );
    authEvents.on(
      'account:capabilitiesRemoved',
      this.broadcastCapabilitiesRemoved.bind(this)
    );
  }

  /**
   * Create a price id changeset, by returning a priorPriceIds that is a disjoint
   * set from the currentPriceIds given the affectedPriceIds.
   *
   * Due to the asynchronous nature of Stripe, Google, and Apple, we have no method
   * that lets us know with certainty what price ids the user had active before the
   * incoming event that triggered this change. To compensate for this, we assume
   * that whatever the new current state of a users price ids are, that they were
   * different than before this event. This does imply that we may broadcast that a
   * user has had a capability removed or added multiple times even if they already
   * had it, but relying parties can handle this gracefully.
   */
  private createPriceIdChangeset({
    currentPriceIds,
    affectedPriceIds,
  }: {
    currentPriceIds: string[];
    affectedPriceIds: string[];
  }) {
    const priorPriceIds = new Set([...currentPriceIds, ...affectedPriceIds]);
    for (const affectedPriceId of affectedPriceIds) {
      if (currentPriceIds.includes(affectedPriceId)) {
        // Remove the price id from the prior list for processing to assume that it
        // was previously inactive and ensure we broadcast a change.
        priorPriceIds.delete(affectedPriceId);
      }
    }
    return [...priorPriceIds];
  }

  /**
   * Handle a Stripe Webhook subscription change.
   *
   * This handles broadcasting and refreshing the subscription capabilities for
   * the price ids that were possibly updated.
   *
   * Stripe supports aligned subscriptions such that a single subscription can
   * include multiple items for multiple products.
   */
  public async stripeUpdate({
    sub,
    uid,
  }: {
    sub: Stripe.Subscription;
    uid?: string | null;
  }) {
    if (typeof sub.customer !== 'string') {
      throw error.internalValidationError(
        'stripeUpdate',
        {
          subscriptionId: sub.id,
        },
        new Error('Subscription customer was not a string.')
      );
    }
    if (!uid) {
      ({ uid } = await getUidAndEmailByStripeCustomerId(sub.customer));
    }
    if (!uid) {
      // There's nothing to do if we can't find the user. We don't report it
      // as we expect this to occur in the case of a deleted user.
      return;
    }

    // Stripe subscriptions from events do not have price expanded, we filter
    // by price being the non-expanded string for type checks.
    const affectedPriceIds = sub.items.data.map((item) => item.price.id);
    if (affectedPriceIds.length === 0) {
      return;
    }
    const currentPriceIds = await this.subscribedPriceIds(uid);
    const priorPriceIds = this.createPriceIdChangeset({
      currentPriceIds,
      affectedPriceIds,
    });
    return Promise.all([
      this.profileClient.deleteCache(uid),
      this.processPriceIdDiff({
        uid,
        priorPriceIds,
        currentPriceIds,
      }),
    ]);
  }

  /**
   * Handle a Google Play or Apple App Store purchase change.
   *
   * This handles broadcasting and refreshing the subscription capabilities for
   * the price ids that were possibly updated.
   */
  public async iapUpdate(
    uid: string,
    purchase: PlayStoreSubscriptionPurchase | AppStoreSubscriptionPurchase
  ) {
    const affectedPriceId = (
      await this.stripeHelper.iapPurchasesToPriceIds([purchase])
    ).shift();
    if (!affectedPriceId) {
      // Purchase is not mapped to a price id.
      return;
    }
    const currentPriceIds = await this.subscribedPriceIds(uid);
    const priorPriceIds = this.createPriceIdChangeset({
      currentPriceIds,
      affectedPriceIds: [affectedPriceId],
    });
    return Promise.all([
      this.profileClient.deleteCache(uid),
      this.processPriceIdDiff({
        uid,
        priorPriceIds,
        currentPriceIds,
      }),
    ]);
  }

  /**
   * Return a map of capabilities to client ids for the user.
   */
  public async subscriptionCapabilities(
    uid: string
  ): Promise<ClientIdCapabilityMap> {
    const subscribedPrices = await this.subscribedPriceIds(uid);
    return this.planIdsToClientCapabilities(subscribedPrices);
  }

  /**
   * Return a list of all price ids with an active subscription.
   */
  async subscribedPriceIds(uid: string) {
    const [
      subscribedStripePrices,
      subscribedPlayPrices,
      subscribedAppStorePrices,
    ] = await Promise.all([
      this.fetchSubscribedPricesFromStripe(uid),
      this.fetchSubscribedPricesFromPlay(uid),
      this.fetchSubscribedPricesFromAppStore(uid),
    ]);
    return [
      ...new Set([
        ...subscribedStripePrices,
        ...subscribedPlayPrices,
        ...subscribedAppStorePrices,
      ]),
    ];
  }

  async allAbbrevPlansByPlanId(): Promise<Record<string, AbbrevPlan>> {
    const allPlans = await this.stripeHelper.allAbbrevPlans();
    // Create a map of planId: abbrevPlan for speed/ease of lookup later without iterating
    const allPlansByPlanId: Record<string, AbbrevPlan> = allPlans.reduce(
      (acc, plan) => {
        return {
          ...acc,
          [plan.plan_id]: plan,
        };
      },
      {}
    );
    return allPlansByPlanId;
  }

  async getAllSubscribedAbbrevPlans(
    uid: string,
    allPlansByPlanId: { [key: string]: AbbrevPlan }
  ) {
    // Fetch all user's subscriptions from all sources
    const [stripeSubscriptions, appleIapSubscriptions, playIapSubscriptions] =
      await Promise.all([
        this.fetchSubscribedPricesFromStripe(uid),
        this.fetchSubscribedPricesFromAppStore(uid),
        this.fetchSubscribedPricesFromPlay(uid),
      ]);

    const getAbbrevPlansFromPlanIds = (planIds: string[]) => {
      return planIds.map((planId) => allPlansByPlanId[planId]).filter(Boolean);
    };

    const stripeSubscribedPlans =
      getAbbrevPlansFromPlanIds(stripeSubscriptions);

    const iapSubscribedPlans = [
      ...getAbbrevPlansFromPlanIds(appleIapSubscriptions),
      ...getAbbrevPlansFromPlanIds(playIapSubscriptions),
    ];
    return [stripeSubscribedPlans, iapSubscribedPlans];
  }

  /**
   * Determine the subscription eligibility path for a user for a given plan,
   * considering existing IAP subscriptions in the process.
   *
   * This method compares the Stripe Metadata provided eligibility results with
   * the Eligibility Managers results if it is defined. Otherwise it returns the
   * Stripe Metadata results.
   *
   * Will throw an error if the targetPlanId does not match with a known plan
   */
  public async getPlanEligibility(
    uid: string,
    targetPlanId: string,
    useFirestoreProductConfigs = false
  ): Promise<SubscriptionChangeEligibility> {
    const allPlansByPlanId = await this.allAbbrevPlansByPlanId();

    const targetPlan = allPlansByPlanId[targetPlanId];
    if (!targetPlan) throw error.unknownSubscriptionPlan(targetPlanId);

    const [stripeSubscribedPlans, iapSubscribedPlans] =
      await this.getAllSubscribedAbbrevPlans(uid, allPlansByPlanId);

    return this.getSubscribedPlanEligibility(
      stripeSubscribedPlans,
      iapSubscribedPlans,
      targetPlan,
      useFirestoreProductConfigs,
      uid
    );
  }

  public async getSubscribedPlanEligibility(
    stripeSubscribedPlans: AbbrevPlan[],
    iapSubscribedPlans: AbbrevPlan[],
    targetPlan: AbbrevPlan,
    useFirestoreProductConfigs = false,
    uid: string | undefined = undefined
  ): Promise<SubscriptionChangeEligibility> {
    const cmsEnabled = this.config.cms.enabled;

    if (cmsEnabled) {
      if (!this.eligibilityManager) {
        throw error.internalValidationError(
          'eligibilityResult',
          {},
          new Error('CapabilityManager not found.')
        );
      } else {
        try {
          const eligibilityManagerResult =
            await this.eligibilityFromEligibilityManager(
              stripeSubscribedPlans,
              iapSubscribedPlans,
              targetPlan
            );

          return eligibilityManagerResult;
        } catch (err) {
          throw error.internalValidationError(
            'subscriptions.getPlanEligibility',
            {},
            err
          );
        }
      }
    }

    // TODO: will be removed in FXA-8918
    const stripeEligibilityResult = await this.eligibilityFromStripeMetadata(
      stripeSubscribedPlans,
      iapSubscribedPlans,
      targetPlan,
      useFirestoreProductConfigs
    );
    if (!this.eligibilityManager) return stripeEligibilityResult;

    try {
      const eligibilityManagerResult =
        await this.eligibilityFromEligibilityManager(
          stripeSubscribedPlans,
          iapSubscribedPlans,
          targetPlan
        );
      if (isEqual(stripeEligibilityResult, eligibilityManagerResult))
        return stripeEligibilityResult;

      this.log.error(`capability.getPlanEligibility.eligibilityMismatch`, {
        stripeSubscribedPlans,
        iapSubscribedPlans,
        eligibilityManagerResult,
        stripeEligibilityResult,
        uid,
        targetPlanId: targetPlan.plan_id,
      });
      Sentry.withScope((scope) => {
        scope.setContext('getPlanEligibility', {
          stripeSubscribedPlans,
          iapSubscribedPlans,
          eligibilityManagerResult,
          stripeEligibilityResult,
          uid,
          targetPlanId: targetPlan.plan_id,
        });
        reportSentryMessage(
          `Eligibility mismatch for ${uid} on ${targetPlan.plan_id}`,
          'error' as SeverityLevel
        );
      });
    } catch (err) {
      this.log.error('subscriptions.getPlanEligibility', { error: err });
      reportSentryError(err);
    }
    return stripeEligibilityResult;
    // END TODO: will be removed in FXA-8918
  }

  /**
   * Utilizes the EligibilityManager to determine if a user is eligible to
   * subscribe to a plan and then maps the evaluation to the same subscription
   * change eligilibity results as the Stripe Metadata based evaluation.
   */
  async eligibilityFromEligibilityManager(
    stripeSubscribedPlans: AbbrevPlan[],
    iapSubscribedPlans: AbbrevPlan[],
    targetPlan: AbbrevPlan
  ): Promise<SubscriptionChangeEligibility> {
    if (!this.eligibilityManager)
      return {
        subscriptionEligibilityResult: SubscriptionEligibilityResult.INVALID,
      };
    const stripePlanIds = stripeSubscribedPlans.map((p) => p.plan_id);
    const stripeOverlaps = await this.eligibilityManager.getOfferingOverlap(
      stripePlanIds,
      targetPlan.plan_id
    );
    const iapPlanIds = iapSubscribedPlans.map((p) => p.plan_id);
    const iapOverlaps = await this.eligibilityManager.getOfferingOverlap(
      iapPlanIds,
      targetPlan.plan_id
    );
    const overlaps = [...stripeOverlaps, ...iapOverlaps];

    // No overlap, we can create a new subscription
    if (!overlaps.length)
      return {
        subscriptionEligibilityResult: SubscriptionEligibilityResult.CREATE,
      };

    // Users with IAP Offering overlaps should not be allowed to proceed
    const iapRoadblockPlan = iapSubscribedPlans.find((plan) => {
      return iapOverlaps.some((overlap) => plan.plan_id === overlap.priceId);
    });

    if (iapRoadblockPlan)
      return {
        subscriptionEligibilityResult:
          SubscriptionEligibilityResult.BLOCKED_IAP,
        eligibleSourcePlan: iapRoadblockPlan,
      };

    // Multiple existing overlapping plans, we can't merge them
    if (overlaps.length > 1)
      return {
        subscriptionEligibilityResult: SubscriptionEligibilityResult.INVALID,
      };

    const overlap = overlaps[0];
    const overlapAbbrev = stripeSubscribedPlans.find(
      (p) => p.plan_id === overlap.priceId
    );

    if (overlap.comparison === OfferingComparison.DOWNGRADE)
      return {
        subscriptionEligibilityResult: SubscriptionEligibilityResult.DOWNGRADE,
        eligibleSourcePlan: overlapAbbrev,
      };

    if (!overlapAbbrev || overlapAbbrev.plan_id === targetPlan.plan_id)
      return {
        subscriptionEligibilityResult: SubscriptionEligibilityResult.INVALID,
      };

    // Any interval change that is lower than the existing plans interval is
    // a downgrade. Otherwise its considered an upgrade.
    if (
      intervalComparison(
        { unit: overlapAbbrev.interval, count: overlapAbbrev.interval_count },
        { unit: targetPlan.interval, count: targetPlan.interval_count }
      ) === IntervalComparison.SHORTER
    )
      return {
        subscriptionEligibilityResult: SubscriptionEligibilityResult.DOWNGRADE,
        eligibleSourcePlan: overlapAbbrev,
      };

    if (
      overlap.comparison === OfferingComparison.UPGRADE ||
      intervalComparison(
        { unit: overlapAbbrev.interval, count: overlapAbbrev.interval_count },
        { unit: targetPlan.interval, count: targetPlan.interval_count }
      ) === IntervalComparison.LONGER
    )
      return {
        subscriptionEligibilityResult: SubscriptionEligibilityResult.UPGRADE,
        eligibleSourcePlan: overlapAbbrev,
      };

    return {
      subscriptionEligibilityResult: SubscriptionEligibilityResult.INVALID,
    };
  }

  /**
   * Utilizes Stripe Metadata to determine if a user is eligible to subscribe to
   * a plan.
   */
  async eligibilityFromStripeMetadata(
    stripeSubscribedPlans: AbbrevPlan[],
    iapSubscribedPlans: AbbrevPlan[],
    targetPlan: AbbrevPlan,
    useFirestoreProductConfigs = false
  ): Promise<SubscriptionChangeEligibility> {
    const { productSet: targetProductSet } = productUpgradeFromProductConfig(
      targetPlan,
      useFirestoreProductConfigs
    );

    if (!targetProductSet)
      return {
        subscriptionEligibilityResult: SubscriptionEligibilityResult.INVALID,
      };

    // Lookup whether user holds an IAP subscription with a shared productSet to the target
    const iapRoadblockPlan = iapSubscribedPlans.find((abbrevPlan) => {
      const { productSet } = productUpgradeFromProductConfig(
        abbrevPlan,
        useFirestoreProductConfigs
      );

      return productSet?.some((name) => targetProductSet.includes(name));
    });

    // Users with an IAP subscription to the productSet that we're trying to subscribe
    // to should not be allowed to proceed
    if (iapRoadblockPlan)
      return {
        subscriptionEligibilityResult:
          SubscriptionEligibilityResult.BLOCKED_IAP,
        eligibleSourcePlan: iapRoadblockPlan,
      };

    const isSubscribedToProductSet = stripeSubscribedPlans.some(
      (abbrevPlan) => {
        const { productSet } = productUpgradeFromProductConfig(
          abbrevPlan,
          useFirestoreProductConfigs
        );

        return productSet?.some((name) => targetProductSet.includes(name));
      }
    );

    if (!isSubscribedToProductSet)
      return {
        subscriptionEligibilityResult: SubscriptionEligibilityResult.CREATE,
      };

    // Use the upgradeEligibility helper to check if any of our existing plans are
    // elegible for an upgrade and if so the user can upgrade that existing plan to the desired plan
    for (const abbrevPlan of stripeSubscribedPlans) {
      const eligibility = getSubscriptionUpdateEligibility(
        abbrevPlan,
        targetPlan,
        useFirestoreProductConfigs
      );

      if (eligibility === SubscriptionUpdateEligibility.UPGRADE)
        return {
          subscriptionEligibilityResult: SubscriptionEligibilityResult.UPGRADE,
          eligibleSourcePlan: abbrevPlan,
        };

      if (eligibility === SubscriptionUpdateEligibility.DOWNGRADE)
        return {
          subscriptionEligibilityResult:
            SubscriptionEligibilityResult.DOWNGRADE,
          eligibleSourcePlan: abbrevPlan,
        };
    }
    return {
      subscriptionEligibilityResult: SubscriptionEligibilityResult.INVALID,
    };
  }

  /**
   * Diff a list of prior price ids to the list of current price ids
   * and emit the necessary events for added/removed capabilities.
   */
  public async processPriceIdDiff(options: {
    uid: string;
    priorPriceIds: string[];
    currentPriceIds: string[];
  }) {
    const { uid, priorPriceIds, currentPriceIds } = options;

    // Calculate and announce capability changes.
    const [priorClientCapabilities, currentClientCapabilities] =
      await Promise.all([
        this.planIdsToClientCapabilities(priorPriceIds),
        this.planIdsToClientCapabilities(currentPriceIds),
      ]);
    const [priorCapabilities, currentCapabilities] = [
      allCapabilities(priorClientCapabilities),
      allCapabilities(currentClientCapabilities),
    ];

    const newCapabilities = currentCapabilities.filter(
      (capability) => !priorCapabilities.includes(capability)
    );
    const removedCapabilities = priorCapabilities.filter(
      (capability) => !currentCapabilities.includes(capability)
    );
    if (newCapabilities.length > 0) {
      this.broadcastCapabilitiesAdded({
        uid,
        capabilities: newCapabilities,
      });
    }
    if (removedCapabilities.length > 0) {
      this.broadcastCapabilitiesRemoved({
        uid,
        capabilities: removedCapabilities,
      });
    }
    return {
      newCapabilities,
      removedCapabilities,
    };
  }

  /**
   * Broadcast the capabilities that are active via SQS.
   */
  private broadcastCapabilitiesAdded(options: {
    uid: string;
    capabilities: string[];
    request?: AuthRequest;
    eventCreatedAt?: number;
  }) {
    const { uid, capabilities, request, eventCreatedAt } = options;
    this.log.notifyAttachedServices(
      'subscription:update',
      request ?? ({} as AuthRequest),
      {
        uid,
        // This number needs to be in seconds.
        eventCreatedAt: eventCreatedAt ?? Math.floor(Date.now() / 1000),
        isActive: true,
        productCapabilities: capabilities,
      }
    );
  }

  /**
   * Broadcast the capabilities that are not active via SQS.
   */
  private broadcastCapabilitiesRemoved(options: {
    uid: string;
    capabilities: string[];
    request?: AuthRequest;
    eventCreatedAt?: number;
  }) {
    const { uid, capabilities, request, eventCreatedAt } = options;
    this.log.notifyAttachedServices(
      'subscription:update',
      request ?? ({} as AuthRequest),
      {
        uid,
        // This number needs to be in seconds.
        eventCreatedAt: eventCreatedAt ?? Math.floor(Date.now() / 1000),
        isActive: false,
        productCapabilities: capabilities,
      }
    );
  }

  /**
   * Given a `ClientIdCapabilityMap`, return an array of the capabilities
   * for the provided client id.
   */
  public determineClientVisibleSubscriptionCapabilities(
    clientIdRaw: Buffer | string | null,
    allCapabilities: Record<string, string[]>
  ) {
    if (!allCapabilities) {
      return undefined;
    }
    const clientId =
      clientIdRaw === null ? null : hex(clientIdRaw).toLowerCase();
    let capabilitiesToReveal;
    if (clientId === null) {
      capabilitiesToReveal = new Set(
        Object.values(allCapabilities).reduce(
          (acc, curr) => [...curr, ...acc],
          []
        )
      );
    } else {
      capabilitiesToReveal = new Set([
        ...(allCapabilities[ALL_RPS_CAPABILITIES_KEY] || []),
        ...(allCapabilities[clientId] || []),
      ]);
    }
    return capabilitiesToReveal.size > 0
      ? Array.from(capabilitiesToReveal).sort()
      : undefined;
  }

  /**
   * Fetch the list of subscription purchases from Google Play and return
   * the ids of the products purchased.
   */
  private async fetchSubscribedPricesFromPlay(uid: string): Promise<string[]> {
    if (!this.playBilling) {
      return [];
    }
    try {
      const allPurchases =
        await this.playBilling.userManager.queryCurrentSubscriptions(uid);
      const purchases = allPurchases.filter((purchase) =>
        purchase.isEntitlementActive()
      );
      return purchases.length === 0
        ? []
        : this.stripeHelper.iapPurchasesToPriceIds(purchases);
    } catch (err) {
      if (err.name === PurchaseQueryError.OTHER_ERROR) {
        this.log.error('Failed to query purchases from Google Play', {
          uid,
          err,
        });
      }
      return [];
    }
  }

  public async fetchSubscribedPricesFromAppStore(
    uid: string
  ): Promise<string[]> {
    if (!this.appleIap) {
      return [];
    }
    try {
      const allPurchases =
        await this.appleIap.purchaseManager.queryCurrentSubscriptionPurchases(
          uid
        );
      const purchases = allPurchases.filter((purchase) =>
        purchase.isEntitlementActive()
      );
      return purchases.length === 0
        ? []
        : this.stripeHelper.iapPurchasesToPriceIds(purchases);
    } catch (err) {
      if (err.name === PurchaseQueryError.OTHER_ERROR) {
        this.log.error('Failed to query purchases from Apple App Store', {
          uid,
          err,
        });
      }
      return [];
    }
  }

  /**
   * Fetch the list of ids of prices purchased from Stripe.
   */
  private async fetchSubscribedPricesFromStripe(
    uid: string
  ): Promise<string[]> {
    const customer = await this.stripeHelper.fetchCustomer(uid, [
      'subscriptions',
    ]);
    const subscriptions = customer?.subscriptions?.data;
    if (!subscriptions) {
      return [];
    }
    const subscribedPrices = subscriptions
      .filter((sub) => ACTIVE_SUBSCRIPTION_STATUSES.includes(sub.status))
      .flatMap((sub) => sub.items.data)
      .map(({ price: { id: priceId } }) => priceId as string);
    return subscribedPrices;
  }

  /**
   * Fetch the mergedConfig of plans that are configured and subscribed to.
   */
  private async configuredSubscribedMergedConfigs(subscribedPrices: string[]) {
    if (!this.paymentConfigManager) return [];
    const allPlans = (await this.paymentConfigManager.allPlans()).filter(
      (plan) => subscribedPrices.includes(plan.stripePriceId ?? '')
    );
    return allPlans.map(this.paymentConfigManager.getMergedConfig);
  }

  /**
   * Fetch the list of capabilities for the given plan ids from Stripe.
   */
  // TODO: will be removed in FXA-8918
  private async planIdsToClientCapabilitiesFromStripe(
    subscribedPrices: string[]
  ): Promise<ClientIdCapabilityMap> {
    let result: ClientIdCapabilityMap = {};
    // Run through all plans and collect capabilities for subscribed products
    for (const price of await this.stripeHelper.allAbbrevPlans()) {
      if (!subscribedPrices.includes(price.plan_id)) {
        continue;
      }
      // Add the capabilities for this price's plan and product
      result = ClientIdCapabilityMap.merge(
        result,
        clientIdCapabilityMapFromMetadata(price.product_metadata)
      );
      result = ClientIdCapabilityMap.merge(
        result,
        clientIdCapabilityMapFromMetadata(price.plan_metadata || {})
      );
    }

    for (const mergedConfigPlan of await this.configuredSubscribedMergedConfigs(
      subscribedPrices
    )) {
      // Add the capabilities for this price
      result = ClientIdCapabilityMap.merge(
        result,
        mergedConfigPlan.capabilities || {}
      );
    }

    return result;
  }

  /**
   * Retrieve the client capabilities from Stripe
   */
  // TODO: will be removed in FXA-8918
  async getClientsFromStripe() {
    let result: ClientIdCapabilityMap = {};

    const planConfigs = await this.stripeHelper.allMergedPlanConfigs();
    const capabilitiesForAll: string[] = [];
    for (const plan of await this.stripeHelper.allAbbrevPlans()) {
      const metadata = metadataFromPlan(plan);
      const pConfig = planConfigs?.[plan.plan_id] || {};

      capabilitiesForAll.push(
        ...commaSeparatedListToArray(metadata.capabilities || ''),
        ...(pConfig.capabilities?.[ALL_RPS_CAPABILITIES_KEY] || [])
      );

      result = ClientIdCapabilityMap.merge(
        result,
        clientIdCapabilityMapFromMetadata(metadata || {}, 'capabilities:')
      );

      if (pConfig.capabilities) {
        Object.keys(pConfig.capabilities)
          .filter((x) => x !== ALL_RPS_CAPABILITIES_KEY)
          .forEach(
            (clientId) =>
              (result[clientId] = (result[clientId] || []).concat(
                pConfig.capabilities?.[clientId]
              ))
          );
      }
    }

    return Object.entries(result).map(([clientId, capabilities]) => {
      // Merge dupes with Set
      const capabilitySet = new Set([...capabilitiesForAll, ...capabilities]);
      const sortedCapabilities = Array.from(capabilitySet).sort();
      return {
        clientId,
        capabilities: sortedCapabilities,
      };
    });
  }

  /**
   * Retrieve the client capabilities
   */
  async getClients() {
    const cmsEnabled = this.config.cms.enabled;

    if (cmsEnabled) {
      if (!this.capabilityManager) {
        throw error.internalValidationError(
          'getClients',
          {},
          new Error('CapabilityManager not found.')
        );
      } else {
        try {
          const clientsFromCMS = await this.capabilityManager.getClients();

          return clientsFromCMS;
        } catch (err) {
          throw error.internalValidationError(
            'subscriptions.getClients',
            {},
            err
          );
        }
      }
    }

    // TODO: will be removed in FXA-8918
    const clientsFromStripe = await this.getClientsFromStripe();

    if (!this.capabilityManager) return clientsFromStripe;

    try {
      const clientsFromCMS = await this.capabilityManager.getClients();

      clientsFromCMS.sort((a, b) => a.clientId.localeCompare(b.clientId));
      clientsFromStripe.sort((a, b) => a.clientId.localeCompare(b.clientId));

      if (isEqual(clientsFromCMS, clientsFromStripe)) return clientsFromCMS;

      this.log.error(`capability.getClients.clientsMismatch`, {
        cms: clientsFromCMS,
        stripe: clientsFromStripe,
      });
      Sentry.withScope((scope) => {
        scope.setContext('getClients', {
          cms: clientsFromCMS,
          stripe: clientsFromStripe,
        });
        reportSentryMessage(
          `CapabilityService.getClients - Returned Stripe as clients did not match.`,
          'error' as SeverityLevel
        );
      });
    } catch (err) {
      this.log.error('subscriptions.getClients', { error: err });
      reportSentryError(err);
    }
    return clientsFromStripe;
    // END TODO: will be removed in FXA-8918
  }

  /**
   * Fetch the list of capabilities for the given plan ids
   */
  async planIdsToClientCapabilities(
    subscribedPrices: string[]
  ): Promise<ClientIdCapabilityMap> {
    const cmsEnabled = this.config.cms.enabled;

    if (cmsEnabled) {
      if (!this.capabilityManager) {
        throw error.internalValidationError(
          'planIdsToClientCapabilities',
          {},
          new Error('CapabilityManager not found.')
        );
      } else {
        try {
          const cmsCapabilities =
            await this.capabilityManager.priceIdsToClientCapabilities(
              subscribedPrices
            );

          return cmsCapabilities;
        } catch (err) {
          throw error.internalValidationError(
            'subscriptions.planIdsToClientCapabilities',
            {},
            err
          );
        }
      }
    }

    // TODO: will be removed in FXA-8918
    const stripeCapabilities = await this.planIdsToClientCapabilitiesFromStripe(
      subscribedPrices
    );

    if (!this.capabilityManager) return stripeCapabilities;

    try {
      const cmsCapabilities =
        await this.capabilityManager.priceIdsToClientCapabilities(
          subscribedPrices
        );

      if (
        isEqual(
          sortClientCapabilities(cmsCapabilities),
          sortClientCapabilities(stripeCapabilities)
        )
      ) {
        return cmsCapabilities;
      }

      this.log.error(`capability.planIdsToClientCapabilities.mismatch`, {
        subscribedPrices,
        cms: cmsCapabilities,
        stripe: stripeCapabilities,
      });
      Sentry.withScope((scope) => {
        scope.setContext('planIdsToClientCapabilities', {
          subscribedPrices,
          cms: cmsCapabilities,
          stripe: stripeCapabilities,
        });
        reportSentryMessage(
          `CapabilityService.planIdsToClientCapabilities - Returned Stripe as plan ids to client capabilities did not match.`,
          'error' as SeverityLevel
        );
      });
    } catch (err) {
      this.log.error('subscriptions.planIdsToClientCapabilities', {
        error: err,
      });
      reportSentryError(err);
    }

    return stripeCapabilities;
    // END TODO: will be removed in FXA-8918
  }
}
