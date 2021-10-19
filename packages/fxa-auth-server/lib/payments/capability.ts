/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { getUidAndEmailByStripeCustomerId } from 'fxa-shared/db/models/auth';
import { metadataFromPlan } from 'fxa-shared/subscriptions/metadata';
import { ACTIVE_SUBSCRIPTION_STATUSES } from 'fxa-shared/subscriptions/stripe';
import { ClientIdCapabilityMap } from 'fxa-shared/subscriptions/types';
import Stripe from 'stripe';
import Container from 'typedi';

import { authEvents } from '../events';
import { AuthLogger, AuthRequest, ProfileClient } from '../types';
import { PlayBilling } from './google-play/play-billing';
import { SubscriptionPurchase } from './google-play/subscription-purchase';
import { StripeHelper } from './stripe';
import error from '../error';

function hex(blob: Buffer | string): string {
  if (Buffer.isBuffer(blob)) {
    return blob.toString('hex');
  }
  return blob;
}

// Parse a comma-separated list of capabilities with allowance for varied whitespace
export function splitCapabilities(s: string) {
  return (s || '')
    .trim()
    .split(',')
    .map((c) => c.trim())
    .filter((c) => !!c);
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
          purchasesToProductIds: () => Promise.resolve([]),
          customer: () => Promise.resolve(null),
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
   * Handle a Stripe Webhook subscription change.
   *
   * This handles broadcasting and refreshing the subscription capabilities for
   * the product ids that were possibly updated.
   *
   * Stripe supports aligned subscriptions such that a single subscription can
   * include multiple items for multiple products. We iterate through this list
   * comparing the current and prior product ids to determine which products
   * have been added or removed.
   */
  public async stripeUpdate({
    sub,
    uid,
    email,
  }: {
    sub: Stripe.Subscription;
    uid?: string | null;
    email?: string | null;
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
    if (!uid || !email) {
      ({ uid, email } = await getUidAndEmailByStripeCustomerId(sub.customer));
    }
    if (!uid || !email) {
      // There's nothing to do if we can't find the user. We don't report it
      // as we expect this to occur in the case of a deleted user.
      return;
    }

    // Stripe subscriptions from events do not have product expanded, we filter
    // by product being the non-expanded string for type checks.
    const affectedProductIds = sub.items.data
      .map((item) => item.price.product)
      .filter((product) => typeof product === 'string') as string[];
    if (affectedProductIds.length === 0) {
      return;
    }
    const currentProductIds = await this.subscribedProductIds({
      uid,
      email,
      forceRefresh: true,
    });
    let priorProductIds = new Set([
      ...currentProductIds,
      ...affectedProductIds,
    ]);
    for (const affectedProductId of affectedProductIds) {
      if (currentProductIds.includes(affectedProductId)) {
        // Remove the product id from the prior list for processing to assume that it
        // was previously inactive and ensure we broadcast a change.
        priorProductIds.delete(affectedProductId);
      }
    }
    return Promise.all([
      this.profileClient.deleteCache(uid),
      this.processProductIdDiff({
        uid,
        priorProductIds: [...priorProductIds],
        currentProductIds,
      }),
    ]);
  }

  /**
   * Handle a Google Play purchase change.
   *
   * This handles broadcasting and refreshing the subscription capabilities for
   * the product ids that were possibly updated.
   *
   * Note that due to the asynchronous nature of Real-Time Developer Notifications
   * and possible concurrent cached purchase updates we cannot with certainty determine
   * the prior state of the Google Play purchase. Therefore for the purpose of ensuring
   * relying parties get notified of changes we assume the prior state was the opposite
   * of the current state and broadcast the changes appropriately. This can result in
   * duplicate broadcasts telling RPs to turn on/off the user capability, but ensures
   * the user always has proper access to the purchased products.
   */
  public async playUpdate(
    uid: string,
    email: string,
    purchase: SubscriptionPurchase
  ) {
    const affectedProductId = (
      await this.stripeHelper.purchasesToProductIds([purchase])
    ).shift();
    if (!affectedProductId) {
      // Purchase is not mapped to a product id.
      return;
    }
    const currentProductIds = await this.subscribedProductIds({
      uid,
      email,
      forceRefresh: true,
    });
    let priorProductIds;
    if (currentProductIds.includes(affectedProductId)) {
      // Remove the product id from the prior list for processing to assume that it
      // was previously inactive and ensure we broadcast a change.
      priorProductIds = currentProductIds.filter(
        (id) => id !== affectedProductId
      );
    } else {
      // Its not a current product. Make sure we broadcast that the capabilities
      // associates with this product are gone by adding it to a prior product list.
      priorProductIds = [...currentProductIds, affectedProductId];
    }
    return Promise.all([
      this.profileClient.deleteCache(uid),
      this.processProductIdDiff({
        uid,
        priorProductIds,
        currentProductIds,
      }),
    ]);
  }

  /**
   * Return a map of capabilities to client ids for the user.
   */
  public async subscriptionCapabilities(
    uid: string,
    email: string
  ): Promise<ClientIdCapabilityMap> {
    const subscribedProducts = await this.subscribedProductIds({ uid, email });
    return this.productIdsToClientCapabilities(subscribedProducts);
  }

  /**
   * Return a list of all product ids with an active subscription.
   */
  private async subscribedProductIds({
    uid,
    email,
    forceRefresh = false,
  }: {
    uid: string;
    email: string;
    forceRefresh?: boolean;
  }) {
    const [subscribedStripeProducts, subscribedPlayProducts] =
      await Promise.all([
        this.fetchSubscribedProductsFromStripe({ uid, email, forceRefresh }),
        this.fetchSubscribedProductsFromPlay(uid),
      ]);
    return [
      ...new Set([...subscribedStripeProducts, ...subscribedPlayProducts]),
    ];
  }

  /**
   * Diff a list of prior product ids to the list of current product ids
   * and emit the necessary events for added/removed products as well as
   * added/removed capabilities.
   */
  public async processProductIdDiff(options: {
    uid: string;
    priorProductIds: string[];
    currentProductIds: string[];
  }) {
    const { uid, priorProductIds, currentProductIds } = options;

    // Calculate and announce capability changes.
    const [priorClientCapabilities, currentClientCapabilities] =
      await Promise.all([
        this.productIdsToClientCapabilities(priorProductIds),
        this.productIdsToClientCapabilities(currentProductIds),
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
  public async fetchSubscribedProductsFromPlay(uid: string): Promise<string[]> {
    if (!this.playBilling) {
      return [];
    }
    const allPurchases =
      await this.playBilling.userManager.queryCurrentSubscriptions(uid);
    const purchases = allPurchases.filter((purchase) =>
      purchase.isEntitlementActive()
    );
    return purchases.length === 0
      ? []
      : this.stripeHelper.purchasesToProductIds(purchases);
  }

  /**
   * Fetch the list of ids of products purchased from Stripe.
   */
  private async fetchSubscribedProductsFromStripe({
    uid,
    email,
    forceRefresh = false,
  }: {
    uid: string;
    email: string;
    forceRefresh?: boolean;
  }): Promise<string[]> {
    const customer = await this.stripeHelper.customer({
      uid,
      email,
      forceRefresh,
    });
    if (!customer || !customer.subscriptions!.data) {
      return [];
    }
    const subscribedProducts = customer
      .subscriptions!.data.filter((sub) =>
        ACTIVE_SUBSCRIPTION_STATUSES.includes(sub.status)
      )
      .flatMap((sub) => sub.items.data)
      .map(({ price: { product: productId } }) => productId as string);
    return subscribedProducts;
  }

  /**
   * Fetch the list of capabilities for the given product ids.
   */
  private async productIdsToClientCapabilities(
    subscribedProducts: string[]
  ): Promise<ClientIdCapabilityMap> {
    const allCapabilities: Record<string, Set<string>> = {};

    // Run through all plans and collect capabilities for subscribed products
    const plans = await this.stripeHelper.allAbbrevPlans();
    for (const plan of plans) {
      if (!subscribedProducts.includes(plan.product_id)) {
        continue;
      }
      const metadata = metadataFromPlan(plan);
      const capabilityKeys = Object.keys(metadata).filter((key) =>
        key.startsWith('capabilities')
      );
      for (const key of capabilityKeys) {
        const capabilities = splitCapabilities((metadata as any)[key]);
        const clientId = key === 'capabilities' ? '*' : key.split(':')[1];
        for (const capability of capabilities) {
          (allCapabilities[clientId] ??= new Set()).add(capability);
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
