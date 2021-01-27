/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ServerRoute } from '@hapi/hapi';

import { ConfigType } from '../../../config';
import { IpnMerchPmtType, isIpnMerchPmt } from '../../payments/paypal-client';
import { StripeHelper } from '../../payments/stripe';
import { reportSentryError } from '../../sentry';
import { AuthLogger, AuthRequest } from '../../types';
import { PayPalHandler } from './paypal';

export class PayPalNotificationHandler extends PayPalHandler {
  private async handleMerchPayment(message: IpnMerchPmtType) {}

  private async handleMpCancel(message: IpnMerchPmtType) {}

  /**
   * Verify and dispatch IPN events from PayPal
   *
   * Run as a fire-and-forget so the execution is wrapped to capture
   * any errors with the original request context.
   *
   * @param request
   */
  private async verifyAndDispatchEvent(request: AuthRequest) {
    try {
      const verified = await this.paypalHelper.verifyIpnMessage(
        request.payload as string
      );
      if (!verified) {
        throw new Error('Invalid payload on PayPal IPN Handler.');
      }
      const payload = this.paypalHelper.extractIpnMessage(
        request.payload as string
      );
      if (isIpnMerchPmt(payload)) {
        this.log.debug('Handling Ipn message', { payload });
        if (payload.txn_type === 'merch_pmt') {
          return this.handleMerchPayment(payload);
        } else {
          return this.handleMpCancel(payload);
        }
      }
      this.log.debug('Unhandled Ipn message', { payload });
    } catch (err) {
      reportSentryError(err, request);
      this.log.error('verifyAndDispatchEvent', {
        payload: request.payload,
        err,
      });
    }
    return false;
  }

  /**
   * Hand the request off to be verified and dispatched so that we can
   * return immediately to PayPal.
   *
   * @param request
   */
  public handleIpnEvent(request: AuthRequest) {
    // Note we intentionally do not wait before returning a 200 per
    // PayPal recommended IPN handling.
    this.verifyAndDispatchEvent(request);
    return {};
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
  const paypalNotificationHandler = new PayPalNotificationHandler(
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
      path: '/oauth/subscriptions/paypal/event',
      options: {
        // We'll use the PayPals verification to authenticate.
        auth: false,
        // The raw payload is needed for authentication.
        payload: {
          output: 'data',
          parse: false,
        },
      },
      handler: (request: AuthRequest) =>
        paypalNotificationHandler.handleIpnEvent(request),
    },
  ];
};
