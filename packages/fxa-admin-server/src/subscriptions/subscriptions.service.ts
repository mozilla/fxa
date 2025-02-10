/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AbbrevPlan } from 'fxa-shared/subscriptions/types';
import Stripe from 'stripe';
import { MozSubscription } from '../gql/model/moz-subscription.model';
import { AppStoreService } from './appstore.service';
import { PlayStoreService } from './playstore.service';
import { iapPurchaseToPlan, StripeService } from './stripe.service';
import {
  AppStoreFormatter,
  PlayStoreFormatter,
  StripeFormatter,
} from './subscriptions.formatters';
import { MozLoggerService } from '@fxa/shared/mozlog';

/**
 * List of valid of subscription statuses. This should be all known
 * stripe subscription types.
 */
export const VALID_SUBSCRIPTION_STATUSES: Stripe.Subscription.Status[] = [
  'active',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'past_due',
  'trialing',
  'unpaid',
];

/**
 * Provides access to account subscriptions
 */
@Injectable()
export class SubscriptionsService {
  /** Indicates Apple app store should be queried for subscriptions. */
  protected get isAppStoreEnabled() {
    return this.configService.get('featureFlags.subscriptions.appStore');
  }

  /** Indicates Google play should be queried for subscriptions. */
  protected get isPlayStoreEnabled() {
    return this.configService.get('featureFlags.subscriptions.playStore');
  }

  /** Indicates stripe should be queried for subscriptions. */
  protected get isStripeEnabled() {
    return this.configService.get('featureFlags.subscriptions.stripe');
  }

  /**
   * Create new SubscriptionService instance
   * @param logger - logging module
   * @param stripeService - stripe service
   * @param appStoreService - communicates with apple app store
   * @param playStoreService - communicates with google play
   */
  constructor(
    protected readonly configService: ConfigService,
    protected readonly logger: MozLoggerService,
    protected readonly stripeService: StripeService,
    protected readonly appStoreService: AppStoreService,
    protected readonly playStoreService: PlayStoreService
  ) {}

  /**
   * Provides list of subscriptions for a given account id
   * @param uid
   * @returns
   */
  public async getSubscriptions(uid: string) {
    const subs: MozSubscription[] = [];
    for await (const sub of this.getSubscriptionsGenerator(uid)) {
      subs.push(sub);
    }
    return subs;
  }

  /**
   * An async generator providing subscriptions for a given account id. This is preferred over
   * getSubscriptions when performance is of concern.
   * @param uid - the account id
   */
  public async *getSubscriptionsGenerator(uid: string) {
    const plans = await this.getAllStripeAbbrevPlans();
    await (yield* this.getStripeSubscriptions(uid, plans));
    await (yield* this.getAppStoreSubscriptions(uid, plans));
    await (yield* this.getPlayStoreSubscriptions(uid, plans));
  }

  private async getAllStripeAbbrevPlans() {
    if (!this.isStripeEnabled) {
      return [];
    }

    return await this.stripeService.allAbbrevPlans();
  }

  private async *getStripeSubscriptions(uid: string, plans: AbbrevPlan[]) {
    if (!this.isStripeEnabled) {
      return;
    }

    const customer = await this.stripeService.fetchCustomer(
      uid,
      ['subscriptions'],
      VALID_SUBSCRIPTION_STATUSES
    );

    for (const subscription of customer?.subscriptions?.data || []) {
      // Inspired by code in auth-server payments ;]
      const plan = plans.find(
        // @ts-ignore
        (p) => p.plan_id === subscription.plan.id
      );

      let invoice = subscription.latest_invoice;
      if (typeof invoice === 'string') {
        try {
          invoice = await this.stripeService.lookupLatestInvoice(invoice);
        } catch (err) {
          if (
            err instanceof Stripe.errors.StripeInvalidRequestError &&
            err.code === 'resource_missing'
          ) {
            // This should only happen if the firestore record is out of sync with stripe
            // and the invoice has been deleted from stripe
            this.logger.error('getStripeSubscriptions.lookupLatestInvoice', {
              msg: 'Failed to fetch invoice for subscription',
              subscriptionId: subscription.id,
              invoiceId: invoice,
              err,
            });
            return;
          } else {
            throw err;
          }
        }
      }

      const manageSubscriptionLink =
        await this.stripeService.createManageSubscriptionLink(
          subscription.customer
        );

      yield StripeFormatter.toMozSubscription(
        subscription,
        plan,
        invoice,
        manageSubscriptionLink
      );
    }
  }

  private async *getAppStoreSubscriptions(uid: string, plans: AbbrevPlan[]) {
    if (!this.isAppStoreEnabled) {
      return;
    }

    const subscriptions = await this.appStoreService.getSubscriptions(uid);
    for (const subscription of subscriptions || []) {
      const plan = iapPurchaseToPlan(
        subscription.productId,
        'iap_apple',
        plans
      );
      if (!plan)
        throw new Error(
          `No matching plan for IAP apple subscription productId: ${subscription.productId}`
        );
      yield AppStoreFormatter.toMozSubscription(subscription, plan);
    }
  }

  private async *getPlayStoreSubscriptions(uid: string, plans: AbbrevPlan[]) {
    if (!this.isPlayStoreEnabled) {
      return;
    }

    const subscriptions = await this.playStoreService.getSubscriptions(uid);
    for (const subscription of subscriptions || []) {
      const plan = iapPurchaseToPlan(subscription.sku, 'iap_google', plans);
      if (!plan)
        throw new Error(
          `No matching plan for IAP play subscription sku: ${subscription.sku}`
        );
      yield PlayStoreFormatter.toMozSubscription(subscription, plan);
    }
  }
}
