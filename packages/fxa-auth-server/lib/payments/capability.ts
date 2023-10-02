/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { getUidAndEmailByStripeCustomerId } from 'fxa-shared/db/models/auth';
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
import Stripe from 'stripe';
import Container from 'typedi';

import error from '../error';
import { AppleIAP } from './iap/apple-app-store/apple-iap';
import { authEvents } from '../events';
import { AuthLogger, AuthRequest, ProfileClient } from '../types';
import { PlayBilling } from './iap/google-play/play-billing';
import { AppStoreSubscriptionPurchase } from './iap/apple-app-store/subscription-purchase';
import { PlayStoreSubscriptionPurchase } from './iap/google-play/subscription-purchase';
import { PurchaseQueryError } from './iap/google-play/types';
import { StripeHelper } from './stripe';
import { PaymentConfigManager } from './configuration/manager';
import { clientIdCapabilityMapFromMetadata } from './utils';
import { ALL_RPS_CAPABILITIES_KEY } from 'fxa-shared/subscriptions/configuration/base';
import { productUpgradeFromProductConfig } from 'fxa-shared/subscriptions/configuration/utils';

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
        'Subscription customer was not a string.'
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
    return this.priceIdsToClientCapabilities(subscribedPrices);
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

  /**
   * Determine the subscription eligibility path for a user for a given plan,
   * considering existing IAP subscriptions in the process.
   * Will throw an error if the targetPlanId does not match with a known plan
   */
  public async getPlanEligibility(
    uid: string,
    targetPlanId: string,
    useFirestoreProductConfigs = false
  ): Promise<SubscriptionChangeEligibility> {
    const allPlans = await this.stripeHelper.allAbbrevPlans();

    // Create a map of planId: abbrevPlan for speed/ease of lookup later without iterating
    const allPlansByPlanId: { [key: string]: AbbrevPlan } = allPlans.reduce(
      (acc, plan) => {
        return {
          ...acc,
          [plan.plan_id]: plan,
        };
      },
      {}
    );

    const targetPlan = allPlansByPlanId[targetPlanId];

    if (!targetPlan) throw error.unknownSubscriptionPlan(targetPlanId);

    const { productSet: targetProductSet } = productUpgradeFromProductConfig(
      targetPlan,
      useFirestoreProductConfigs
    );

    if (!targetProductSet) {
      return [SubscriptionEligibilityResult.INVALID, undefined];
    }

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

    // Lookup whether user holds an IAP subscription with a shared product set to the target
    const iapRoadblock = iapSubscribedPlans.some((abbrevPlan) => {
      const { productSet } = productUpgradeFromProductConfig(
        abbrevPlan,
        useFirestoreProductConfigs
      );

      return productSet?.some((name) => targetProductSet.includes(name));
    });

    // Users with an IAP subscription to the productSet that we're trying to subscribe
    // to should not be allowed to proceed
    if (iapRoadblock) {
      return [SubscriptionEligibilityResult.BLOCKED_IAP, undefined];
    }

    const isSubscribedToProductSet = stripeSubscribedPlans.some(
      (abbrevPlan) => {
        const { productSet } = productUpgradeFromProductConfig(
          abbrevPlan,
          useFirestoreProductConfigs
        );

        return productSet?.some((name) => targetProductSet.includes(name));
      }
    );

    if (!isSubscribedToProductSet) {
      return [SubscriptionEligibilityResult.CREATE, undefined];
    }

    // Use the upgradeEligibility helper to check if any of our existing plans are
    // elegible for an upgrade and if so the user can upgrade that existing plan to the desired plan
    for (const abbrevPlan of stripeSubscribedPlans) {
      const eligibility = getSubscriptionUpdateEligibility(
        abbrevPlan,
        targetPlan,
        useFirestoreProductConfigs
      );

      if (eligibility === SubscriptionUpdateEligibility.UPGRADE) {
        return [SubscriptionEligibilityResult.UPGRADE, abbrevPlan];
      }

      if (eligibility === SubscriptionUpdateEligibility.DOWNGRADE) {
        return [SubscriptionEligibilityResult.DOWNGRADE, abbrevPlan];
      }
    }

    return [SubscriptionEligibilityResult.INVALID, undefined];
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
        this.priceIdsToClientCapabilities(priorPriceIds),
        this.priceIdsToClientCapabilities(currentPriceIds),
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
   * Fetch the list of capabilities for the given price ids.
   */
  private async priceIdsToClientCapabilities(
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
}
