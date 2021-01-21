/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ServerRoute } from '@hapi/hapi';
import Container from 'typedi';

import { ConfigType } from '../../../config';
import { PayPalHelper } from '../../payments/paypal';
import { StripeHelper } from '../../payments/stripe';
import { AuthLogger } from '../../types';
import { StripeHandler } from './stripe';

export class PayPalHandler extends StripeHandler {
  protected paypalHelper: PayPalHelper;

  constructor(
    log: AuthLogger,
    db: any,
    config: ConfigType,
    customs: any,
    push: any,
    mailer: any,
    profile: any,
    stripeHelper: StripeHelper
  ) {
    super(log, db, config, customs, push, mailer, profile, stripeHelper);
    this.paypalHelper = Container.get(PayPalHelper);
  }
}

export const paypalRoutes = (
  log: AuthLogger,
  db: any,
  config: ConfigType,
  customs: any,
  push: any,
  mailer: any,
  profile: any,
  stripeHelper: StripeHelper
): ServerRoute[] => {
  const paypalRoutes = new PayPalHandler(
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
  return [];
};
