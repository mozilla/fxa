/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { Validator } from 'class-validator';

import { CartService } from '@fxa/payments/cart';
import { CheckoutTokenManager } from '@fxa/payments/paypal';
import { ProductConfigurationManager } from '@fxa/shared/cms';

import { CheckoutCartWithPaypalActionArgs } from './validators/CheckoutCartWithPaypalActionArgs';
import { CheckoutCartWithStripeActionArgs } from './validators/CheckoutCartWithStripeActionArgs';
import { FetchCMSDataArgs } from './validators/FetchCMSDataArgs';
import { FinalizeCartWithErrorArgs } from './validators/FinalizeCartWithErrorArgs';
import { GetCartActionArgs } from './validators/GetCartActionArgs';
import { GetPayPalCheckoutTokenArgs } from './validators/GetPayPalCheckoutTokenArgs';
import { RestartCartActionArgs } from './validators/RestartCartActionArgs';
import { SetupCartActionArgs } from './validators/SetupCartActionArgs';
import { UpdateCartActionArgs } from './validators/UpdateCartActionArgs';
import { EventName, RecordGleanEvent } from './validators/RecordGleanEvent';

/**
 * ANY AND ALL methods exposed via this service should be considered publicly accessible and callable with any arguments.
 * ALL server actions must use this service as a proxy to other NestJS services.
 */

@Injectable()
export class NextJSActionsService {
  constructor(
    private cartService: CartService,
    private checkoutTokenManager: CheckoutTokenManager,
    private productConfigurationManager: ProductConfigurationManager
  ) {}

  async getCart(args: GetCartActionArgs) {
    new Validator().validateOrReject(args);

    const cart = await this.cartService.getCart(args.cartId);

    return cart;
  }

  async updateCart(args: UpdateCartActionArgs) {
    new Validator().validateOrReject(args);

    await this.cartService.updateCart(
      args.cartId,
      args.version,
      args.cartDetails
    );
  }

  async restartCart(args: RestartCartActionArgs) {
    new Validator().validateOrReject(args);

    const cart = await this.cartService.restartCart(args.cartId);

    return cart;
  }

  async setupCart(args: SetupCartActionArgs) {
    new Validator().validateOrReject(args);

    const cart = await this.cartService.setupCart({
      ...args,
    });

    return cart;
  }

  async finalizeCartWithError(args: FinalizeCartWithErrorArgs) {
    new Validator().validateOrReject(args);

    await this.cartService.finalizeCartWithError(
      args.cartId,
      args.errorReasonId
    );
  }

  async getPayPalCheckoutToken(args: GetPayPalCheckoutTokenArgs) {
    new Validator().validateOrReject(args);

    const token = await this.checkoutTokenManager.get(args.currencyCode);

    return token;
  }

  async checkoutCartWithPaypal(args: CheckoutCartWithPaypalActionArgs) {
    new Validator().validateOrReject(args);

    await this.cartService.checkoutCartWithPaypal(
      args.cartId,
      args.version,
      args.customerData,
      args.token
    );
  }

  async checkoutCartWithStripe(args: CheckoutCartWithStripeActionArgs) {
    new Validator().validateOrReject(args);

    await this.cartService.checkoutCartWithStripe(
      args.cartId,
      args.version,
      args.paymentMethodId,
      args.customerData
    );
  }

  async fetchCMSData(args: FetchCMSDataArgs) {
    new Validator().validateOrReject(args);

    const offering = await this.productConfigurationManager.fetchCMSData(
      args.offeringId,
      args.acceptLanguage
    );

    return offering;
  }

  /**
   * @@todo: Emit event using Emittery. To be added as part of FXA-10087
   */
  async recordGleanEvent(args: RecordGleanEvent) {
    new Validator().validateOrReject(args);

    // Temporary ignore until Emittery logic is added
    //eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { eventName, commonMetrics, ...restOfArgs } = args;

    switch (eventName) {
      case EventName.PAY_SETUP_ENGAGE: {
        //Note: This is a dummy implementation and will likely be changed as part of a future ticket.
        //emitter.emit('pay_setup:engage', {
        //  commonMetrics,
        //  ...restOfArgs.paySetupEngageMetrics
        //});
        break;
      }
      default: {
        throw new Error(`Event ${args.eventName} not supported`);
      }
    }
  }
}
