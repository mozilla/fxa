/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ServerRoute } from '@hapi/hapi';
import isA from 'joi';
import { AbbrevPlan } from 'fxa-shared/subscriptions/types';
import {
  ACTIVE_SUBSCRIPTION_STATUSES,
  singlePlan,
} from 'fxa-shared/subscriptions/stripe';
import omitBy from 'lodash/omitBy';
import { Logger } from 'mozlog';
import { Stripe } from 'stripe';

import { ConfigType } from '../../../config';
import { AppError as error } from '@fxa/accounts/errors';
import { StripeHelper } from '../../payments/stripe';
import { AuthLogger, AuthRequest } from '../../types';
import validators from '../validators';
import { handleAuth } from './utils';
import SUBSCRIPTIONS_DOCS from '../../../docs/swagger/subscriptions-api';
import DESCRIPTIONS from '../../../docs/swagger/shared/descriptions';
import { CapabilityService } from '../../payments/capability';
import Container from 'typedi';

/**
 * Delete any metadata keys prefixed by `capabilities:` and promotion codes
 * before sending response. We don't need to reveal those.
 * https://github.com/mozilla/fxa/issues/3273#issuecomment-552637420
 * https://github.com/mozilla/fxa/issues/12181
 */
export function sanitizePlans(plans: AbbrevPlan[]) {
  return plans.map((planIn) => {
    // Try not to mutate the original in case we cache plans in memory.
    const plan = { ...planIn };
    const isCapabilityKey = (value: string, key: string) =>
      key.startsWith('capabilities');
    const isPromotionCodes = (value: string, key: string) =>
      key.toLowerCase() === 'promotioncodes';
    const isOmittable = (value: string, key: string) =>
      isCapabilityKey(value, key) || isPromotionCodes(value, key);
    plan.plan_metadata = omitBy(plan.plan_metadata, isOmittable);
    plan.product_metadata = omitBy(plan.product_metadata, isOmittable);
    return plan;
  });
}

export class StripeHandler {
  subscriptionAccountReminders: any;
  capabilityService: CapabilityService;
  unsupportedLocations: string[];

  constructor(
    // FIXME: For some reason Logger methods were not being detected in
    //        inheriting classes thus this interface join.
    protected log: AuthLogger & Logger,
    protected db: any,
    protected config: ConfigType,
    protected customs: any,
    protected push: any,
    protected mailer: any,
    protected profile: any,
    protected stripeHelper: StripeHelper
  ) {
    this.subscriptionAccountReminders =
      require('../../subscription-account-reminders')(log, config);
    this.capabilityService = Container.get(CapabilityService);
    this.unsupportedLocations =
      (config.subscriptions.unsupportedLocations as string[]) || [];
  }

  async getClients(request: AuthRequest) {
    this.log.begin('subscriptions.getClients', request);

    return this.capabilityService.getClients();
  }

  async listPlans(request: AuthRequest) {
    this.log.begin('subscriptions.listPlans', request);
    const plans = await this.stripeHelper.allAbbrevPlans(
      request?.headers?.['accept-language']
    );
    return sanitizePlans(plans);
  }

  async listActive(request: AuthRequest) {
    this.log.begin('subscriptions.listActive', request);
    const { uid } = await handleAuth(this.db, request.auth, true);
    const customer = await this.stripeHelper.fetchCustomer(uid, [
      'subscriptions',
    ]);
    const activeSubscriptions = new Array<{
      uid: string;
      productId: string | Stripe.Product | Stripe.DeletedProduct | null;
      subscriptionId: string;
      createdAt: number;
      cancelledAt: number | null;
    }>();

    if (customer && customer.subscriptions) {
      for (const subscription of customer.subscriptions.data) {
        const plan = singlePlan(subscription);
        if (!plan) {
          throw error.internalValidationError(
            'listActive',
            { subscription: subscription.id },
            'Subscriptions with multiple plans not supported.'
          );
        }

        const productId = plan.product;
        const { id: subscriptionId, created, canceled_at } = subscription;
        if (ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status)) {
          activeSubscriptions.push({
            uid,
            subscriptionId,
            productId,
            createdAt: created * 1000,
            cancelledAt: canceled_at ? canceled_at * 1000 : null,
          });
        }
      }
    }
    return activeSubscriptions;
  }

}

export const stripeRoutes = (
  log: AuthLogger,
  db: any,
  config: ConfigType,
  customs: any,
  push: any,
  mailer: any,
  profile: any,
  stripeHelper: StripeHelper
): ServerRoute[] => {
  const stripeHandler = new StripeHandler(
    log,
    db,
    config,
    customs,
    push,
    mailer,
    profile,
    stripeHelper
  );

  // FIXME: All of these need to be wrapped in Stripe error handling
  // FIXME: Many of these stripe calls need retries with careful thought about
  //        overall request deadline. Stripe retries must include a idempotency_key.
  return [
    {
      method: 'GET',
      path: '/oauth/subscriptions/clients',
      options: {
        ...SUBSCRIPTIONS_DOCS.OAUTH_SUBSCRIPTIONS_CLIENTS_GET,
        auth: {
          payload: false,
          strategy: 'subscriptionsSecret',
        },
        response: {
          schema: isA.array().items(
            isA.object().keys({
              clientId: isA.string().description(DESCRIPTIONS.clientId),
              capabilities: isA
                .array()
                .items(isA.string())
                .description(DESCRIPTIONS.capabilities),
            })
          ) as any,
        },
      },
      handler: (request: AuthRequest) => stripeHandler.getClients(request),
    },
    {
      method: 'GET',
      path: '/oauth/subscriptions/plans',
      options: {
        ...SUBSCRIPTIONS_DOCS.OAUTH_SUBSCRIPTIONS_PLANS_GET,
        response: {
          schema: isA
            .array()
            .items(
              validators.subscriptionsPlanWithProductConfigValidator,
              validators.subscriptionsPlanWithMetaDataValidator
            ) as any,
        },
      },
      handler: (request: AuthRequest) => stripeHandler.listPlans(request),
    },
    {
      method: 'GET',
      path: '/oauth/subscriptions/active',
      options: {
        ...SUBSCRIPTIONS_DOCS.OAUTH_SUBSCRIPTIONS_ACTIVE_GET,
        auth: {
          payload: false,
          strategy: 'oauthToken',
        },
        response: {
          schema: isA
            .array()
            .items(validators.activeSubscriptionValidator) as any,
        },
      },
      handler: (request: AuthRequest) => stripeHandler.listActive(request),
    },
  ];
};
