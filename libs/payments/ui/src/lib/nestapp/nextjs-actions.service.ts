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
import { RecordEmitterEventArgs } from './validators/RecordEmitterEvent';
import { PaymentsEmitterService } from '../emitter/emitter.service';
import { FinalizeProcessingCartActionArgs } from './validators/finalizeProcessingCartActionArgs';
import { SubmitNeedsInputActionArgs } from './validators/SubmitNeedsInputActionArgs';
import { GetNeedsInputActionArgs } from './validators/GetNeedsInputActionArgs';

/**
 * ANY AND ALL methods exposed via this service should be considered publicly accessible and callable with any arguments.
 * ALL server actions must use this service as a proxy to other NestJS services.
 */

@Injectable()
export class NextJSActionsService {
  constructor(
    private cartService: CartService,
    private checkoutTokenManager: CheckoutTokenManager,
    private emitterService: PaymentsEmitterService,
    private productConfigurationManager: ProductConfigurationManager
  ) {}

  async getCart(args: GetCartActionArgs) {
    await new Validator().validateOrReject(args);

    const cart = await this.cartService.getCart(args.cartId);

    return cart;
  }

  async getSuccessCart(args: GetCartActionArgs) {
    await new Validator().validateOrReject(args);

    const cart = await this.cartService.getSuccessCart(args.cartId);

    return cart;
  }

  async updateCart(args: UpdateCartActionArgs) {
    await new Validator().validateOrReject(args);

    await this.cartService.updateCart(
      args.cartId,
      args.version,
      args.cartDetails
    );
  }

  async restartCart(args: RestartCartActionArgs) {
    await new Validator().validateOrReject(args);

    const cart = await this.cartService.restartCart(args.cartId);

    return cart;
  }

  async setupCart(args: SetupCartActionArgs) {
    await new Validator().validateOrReject(args);

    const cart = await this.cartService.setupCart({
      ...args,
    });

    return cart;
  }

  async finalizeCartWithError(args: FinalizeCartWithErrorArgs) {
    await new Validator().validateOrReject(args);

    await this.cartService.finalizeCartWithError(
      args.cartId,
      args.errorReasonId
    );
  }

  async finalizeProcessingCart(args: FinalizeProcessingCartActionArgs) {
    await new Validator().validateOrReject(args);

    await this.cartService.finalizeProcessingCart(args.cartId);
  }

  async getPayPalCheckoutToken(args: GetPayPalCheckoutTokenArgs) {
    await new Validator().validateOrReject(args);

    const token = await this.checkoutTokenManager.get(args.currencyCode);

    return token;
  }

  async checkoutCartWithPaypal(args: CheckoutCartWithPaypalActionArgs) {
    await new Validator().validateOrReject(args);

    await this.cartService.checkoutCartWithPaypal(
      args.cartId,
      args.version,
      args.customerData,
      args.token
    );
  }

  async checkoutCartWithStripe(args: CheckoutCartWithStripeActionArgs) {
    await new Validator().validateOrReject(args);

    await this.cartService.checkoutCartWithStripe(
      args.cartId,
      args.version,
      args.confirmationTokenId,
      args.customerData
    );
  }

  async fetchCMSData(args: FetchCMSDataArgs) {
    await new Validator().validateOrReject(args);

    const offering = await this.productConfigurationManager.fetchCMSData(
      args.offeringId,
      args.acceptLanguage
    );

    return offering;
  }

  async recordEmitterEvent(args: RecordEmitterEventArgs) {
    await new Validator().validateOrReject(args);

    const { eventName, requestArgs, paymentProvider } = args;

    switch (eventName) {
      case 'checkoutView':
      case 'checkoutEngage': {
        this.emitterService.getEmitter().emit(eventName, {
          ...requestArgs,
        });
        break;
      }
      case 'checkoutSubmit':
      case 'checkoutSuccess':
      case 'checkoutFail': {
        this.emitterService.getEmitter().emit(eventName, {
          ...requestArgs,
          paymentProvider: paymentProvider,
        });
        break;
      }
      default: {
        throw new Error(`Event ${args.eventName} not supported`);
      }
    }
  }

  async getNeedsInput(args: GetNeedsInputActionArgs) {
    await new Validator().validateOrReject(args);

    return await this.cartService.getNeedsInput(args.cartId);
  }

  async submitNeedsInput(args: SubmitNeedsInputActionArgs) {
    await new Validator().validateOrReject(args);

    return await this.cartService.submitNeedsInput(args.cartId);
  }
}
