/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import Stripe from 'stripe';
import joi from 'typesafe-joi';

import {
  MozillaSubscriptionTypes,
  SubscriptionTypes,
} from '../../../subscriptions/types';

export type IapExtraStripeInfo = {
  product_id: Stripe.Product['id'];
  product_name: Stripe.Product['name'];
  price_id: Stripe.Plan['id'];
};

export const iapExtraStripeInfoSchema = joi.object({
  price_id: joi.string().required(),
  product_id: joi.string().required(),
  product_name: joi.string().required(),
});

export type iapExtraStripeInfoSchema = joi.Literal<
  typeof iapExtraStripeInfoSchema
>;

export type PlayStoreSubscription = {
  auto_renewing: boolean;
  cancel_reason?: number;
  expiry_time_millis: number;
  package_name: string;
  sku: string;
  _subscription_type: SubscriptionTypes[1];
} & IapExtraStripeInfo;

export const playStoreSubscriptionSchema = joi
  .object({
    auto_renewing: joi.boolean().required(),
    cancel_reason: joi.number().optional(),
    expiry_time_millis: joi.number().required(),
    package_name: joi.string().required(),
    sku: joi.string().required(),
    _subscription_type: MozillaSubscriptionTypes.IAP_GOOGLE,
  })
  .concat(iapExtraStripeInfoSchema);

export type playStoreSubscriptionSchema = joi.Literal<
  typeof playStoreSubscriptionSchema
>;

export type AppStoreSubscription = {
  app_store_product_id: string;
  auto_renewing: boolean;
  bundle_id: string;
  expiry_time_millis?: number;
  is_in_billing_retry_period?: boolean;
  _subscription_type: SubscriptionTypes[2];
} & IapExtraStripeInfo;

export const appStoreSubscriptionSchema = joi
  .object({
    app_store_product_id: joi.string().required(),
    auto_renewing: joi.boolean().required(),
    bundle_id: joi.string().required(),
    expiry_time_millis: joi.number().optional(),
    is_in_billing_retry_period: joi.boolean().optional(),
    _subscription_type: MozillaSubscriptionTypes.IAP_APPLE,
  })
  .concat(iapExtraStripeInfoSchema);

export type appStoreSubscriptionSchema = joi.Literal<
  typeof appStoreSubscriptionSchema
>;
