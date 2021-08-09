/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { metadataFromPlan } from 'fxa-shared/subscriptions/metadata';
import { ACTIVE_SUBSCRIPTION_STATUSES } from 'fxa-shared/subscriptions/stripe';
import { ClientIdCapabilityMap } from 'fxa-shared/subscriptions/types';
import Container from 'typedi';

import { authEvents } from '../events';
import { AuthLogger, AuthRequest } from '../types';
import { PlayBilling } from './google-play/play-billing';
import { StripeHelper } from './stripe';

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
  private stripeHelper: StripeHelper;
  private playBilling?: PlayBilling;
  private log: AuthLogger;

  constructor() {
    this.stripeHelper = Container.get(StripeHelper);
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
   * Return a map of capabilities to client ids for the user.
   */
  public async subscriptionCapabilities(
    uid: string,
    email: string
  ): Promise<ClientIdCapabilityMap> {
    const subscribedProducts = await this.subscribedProductIds(uid, email);
    return this.productIdsToClientCapabilities(subscribedProducts);
  }

  /**
   * Return a list of subscribed product ids for the user.
   */
  public async subscribedProductIds(uid: string, email: string) {
    let subscribedProducts = await this.fetchSubscribedProductsFromStripe(
      uid,
      email
    );
    subscribedProducts = subscribedProducts.concat(
      await this.fetchSubscribedProductsFromPlay(uid)
    );
    return [...new Set(subscribedProducts)];
  }

  /**
   * Diff a list of prior product ids to the list of current product ids
   * and emit the necessary events for added/removed products as well as
   * added/removed capabilities.
   */
  public async processProductDiff(options: {
    uid: string;
    priorProductIds: string[];
    currentProductIds: string[];
  }) {
    const { uid } = options;

    // Calculate the product changes.
    const newProducts = options.currentProductIds.filter(
      (id) => !options.priorProductIds.includes(id)
    );
    const removedProducts = options.priorProductIds.filter(
      (id) => !options.currentProductIds.includes(id)
    );
    for (const product of newProducts) {
      authEvents.emit('account:productAdded', {
        uid,
        productId: product,
      });
    }
    for (const product of removedProducts) {
      authEvents.emit('account:productRemoved', {
        uid,
        productId: product,
      });
    }

    // Calculate and announce capability changes.
    const priorCapabilities = allCapabilities(
      await this.productIdsToClientCapabilities(options.priorProductIds)
    );
    const currentCapabilities = allCapabilities(
      await this.productIdsToClientCapabilities(options.currentProductIds)
    );
    const newCapabilities = currentCapabilities.filter(
      (capability) => !priorCapabilities.includes(capability)
    );
    const removedCapabilities = priorCapabilities.filter(
      (capability) => !currentCapabilities.includes(capability)
    );
    if (newCapabilities.length > 0) {
      this.broadcastCapabilitiesAdded({ uid, capabilities: newCapabilities });
    }
    if (removedCapabilities.length > 0) {
      this.broadcastCapabilitiesRemoved({
        uid,
        capabilities: removedCapabilities,
      });
    }
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
  private async fetchSubscribedProductsFromPlay(
    uid: string
  ): Promise<string[]> {
    if (!this.playBilling) {
      return [];
    }
    const purchases =
      await this.playBilling.userManager.queryCurrentSubscriptions(uid);
    return purchases.length === 0
      ? []
      : this.stripeHelper.purchasesToSubscribedProductIds(purchases);
  }

  /**
   * Fetch the list of ids of products purchased from Stripe.
   */
  private async fetchSubscribedProductsFromStripe(uid: string, email: string) {
    const customer = await this.stripeHelper.customer({
      uid,
      email,
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
    const plans = await this.stripeHelper.allPlans();
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
