/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ServerRoute } from '@hapi/hapi';
import isA from '@hapi/joi';
import Container from 'typedi';

import { ConfigType } from '../../../config';
import { PayPalHelper } from '../../payments/paypal';
import { StripeHelper } from '../../payments/stripe';
import { AuthLogger, AuthRequest } from '../../types';
import { StripeHandler } from './stripe';
import { handleAuth } from './utils';

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

  /**
   * Get PayPal Checkout Token.
   */
  async getCheckoutToken(request: AuthRequest) {
    this.log.begin('subscriptions.getCheckoutToken', request);
    const { uid, email } = await handleAuth(this.db, request.auth, true);
    await this.customs.check(request, email, 'getCheckoutToken');
    const token = await this.paypalHelper.getCheckoutToken();
    const responseObject = { token };
    this.log.info('subscriptions.getCheckoutToken.success', responseObject);
    return responseObject;
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
  const paypalHandler = new PayPalHandler(
    log,
    db,
    config,
    customs,
    push,
    mailer,
    profile,
    stripeHelper
  );

  return [
    {
      method: 'POST',
      path: '/oauth/subscriptions/paypal-checkout',
      options: {
        auth: {
          payload: false,
          strategy: 'oauthToken',
        },
        response: {
          schema: isA.object({
            token: isA.string().required(),
          }),
        },
      },
      handler: (request: AuthRequest) =>
        paypalHandler.getCheckoutToken(request),
    },
  ];
};
