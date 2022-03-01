/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { getUidAndEmailByStripeCustomerId } from 'fxa-shared/db/models/auth';
import { ACTIVE_SUBSCRIPTION_STATUSES } from 'fxa-shared/subscriptions/stripe';
import { ClientIdCapabilityMap } from 'fxa-shared/subscriptions/types';
import Stripe from 'stripe';
import Container from 'typedi';

import { commaSeparatedListToArray } from './utils';
import error from '../error';
import { authEvents } from '../events';
import { AuthLogger, AuthRequest, ProfileClient } from '../types';
import { PlayBilling } from './google-play/play-billing';
import { SubscriptionPurchase } from './google-play/subscription-purchase';
import { PurchaseQueryError } from './google-play/types';
import { StripeHelper } from './stripe';

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
  private playBilling?: PlayBilling;
  private stripeHelper: StripeHelper;
  private profileClient: ProfileClient;

  constructor() {
    // TODO: the mock stripeHelper here fixes this specific instance when
    // stripe isn't configured, but we should have a better strategy
    // in general as this helper becomes more pervasive
    this.stripeHelper = Container.has(StripeHelper)
      ? Container.get(StripeHelper)
      : ({
          purchasesToPriceIds: () => Promise.resolve([]),
          fetchCustomer: () => Promise.resolve(null),
          allAbbrevPlans: () => Promise.resolve([]),
        } as unknown as StripeHelper);
    this.profileClient = Container.get(ProfileClient);
    if (Container.has(PlayBilling)) {
      this.playBilling = Container.get(PlayBilling);
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
   * Handle a Google Play purchase change.
   *
   * This handles broadcasting and refreshing the subscription capabilities for
   * the price ids that were possibly updated.
   */
  public async playUpdate(uid: string, purchase: SubscriptionPurchase) {
    const affectedPriceId = (
      await this.stripeHelper.purchasesToPriceIds([purchase])
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
  private async subscribedPriceIds(uid: string) {
    const [subscribedStripePrices, subscribedPlayPrices] = await Promise.all([
      this.fetchSubscribedPricesFromStripe(uid),
      this.fetchSubscribedPricesFromPlay(uid),
    ]);
    return [...new Set([...subscribedStripePrices, ...subscribedPlayPrices])];
  }

  /**
   * Diff a list of prior price ids to the list of current price ids
   * and emit the necessary events for added/removed prices as well as
   * added/removed capabilities.
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
        ...(allCapabilities['*'] || []),
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
        : this.stripeHelper.purchasesToPriceIds(purchases);
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

  /**
   * Fetch the list of ids of prices purchased from Stripe.
   */
  private async fetchSubscribedPricesFromStripe(
    uid: string
  ): Promise<string[]> {
    const customer = await this.stripeHelper.fetchCustomer(uid, [
      'subscriptions',
    ]);
    if (!customer || !customer.subscriptions!.data) {
      return [];
    }
    const subscribedPrices = customer
      .subscriptions!.data.filter((sub) =>
        ACTIVE_SUBSCRIPTION_STATUSES.includes(sub.status)
      )
      .flatMap((sub) => sub.items.data)
      .map(({ price: { id: priceId } }) => priceId as string);
    return subscribedPrices;
  }

  /**
   * Fetch the list of capabilities for the given price ids.
   */
  private async priceIdsToClientCapabilities(
    subscribedPrices: string[]
  ): Promise<ClientIdCapabilityMap> {
    const allCapabilities: Record<string, Set<string>> = {};
    // Run through all plans and collect capabilities for subscribed products
    const prices = await this.stripeHelper.allAbbrevPlans();
    for (const price of prices) {
      if (!subscribedPrices.includes(price.plan_id)) {
        continue;
      }
      // Add the capabilities for this price and product
      for (const metadata of [price.plan_metadata, price.product_metadata]) {
        if (!metadata) {
          continue;
        }
        const capabilityKeys = Object.keys(metadata).filter((key) =>
          key.startsWith('capabilities')
        );
        for (const key of capabilityKeys) {
          const capabilities = commaSeparatedListToArray(
            (metadata as any)[key]
          );
          const clientId =
            key === 'capabilities' ? '*' : key.split(':')[1].trim();
          for (const capability of capabilities) {
            (allCapabilities[clientId] ??= new Set()).add(capability);
          }
        }
      }
    }

    const resultCapabilities: Record<string, string[]> = {};
    for (const key of Object.keys(allCapabilities)) {
      resultCapabilities[key] = Array.from(allCapabilities[key]);
    }

    return resultCapabilities;
  }
}
