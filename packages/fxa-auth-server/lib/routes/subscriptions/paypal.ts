/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import Container from 'typedi';

import { ConfigType } from '../../../config';
import { PayPalHelper } from '../../payments/paypal/helper';
import { StripeHelper } from '../../payments/stripe';
import { AuthLogger } from '../../types';
import { StripeWebhookHandler } from './stripe-webhook';

export class PayPalHandler extends StripeWebhookHandler {
  protected paypalHelper: PayPalHelper;
  subscriptionAccountReminders: any;
  unsupportedLocations: string[];

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
    this.subscriptionAccountReminders =
      require('../../subscription-account-reminders')(log, config);
    this.unsupportedLocations =
      (config.subscriptions.unsupportedLocations as string[]) || [];
  }
}
