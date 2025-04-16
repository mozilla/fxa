/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';

import { GoogleManager } from '@fxa/google';
import {
  CartInvalidStateForActionError,
  CartService,
  CheckoutFailedError,
  SuccessCartDTO,
  TaxService,
} from '@fxa/payments/cart';
import { ContentServerManager } from '@fxa/payments/content-server';
import { CurrencyManager } from '@fxa/payments/currency';
import { CheckoutTokenManager } from '@fxa/payments/paypal';
import {
  ProductConfigError,
  ProductConfigurationManager,
} from '@fxa/shared/cms';
import {
  CartState,
  type CartErrorReasonId,
} from '@fxa/shared/db/mysql/account';
import { SanitizeExceptions } from '@fxa/shared/error';
import { GeoDBManager } from '@fxa/shared/geodb';

import { CheckoutCartWithPaypalActionArgs } from './validators/CheckoutCartWithPaypalActionArgs';
import { CheckoutCartWithStripeActionArgs } from './validators/CheckoutCartWithStripeActionArgs';
import { GetProductAvailabilityForLocationActionArgs } from './validators/GetProductAvailabilityForLocationActionArgs';
import { FetchCMSDataActionArgs } from './validators/FetchCMSDataActionArgs';
import { FinalizeCartWithErrorArgs } from './validators/FinalizeCartWithErrorArgs';
import { GetCartActionArgs } from './validators/GetCartActionArgs';
import { GetPayPalCheckoutTokenArgs } from './validators/GetPayPalCheckoutTokenArgs';
import { RestartCartActionArgs } from './validators/RestartCartActionArgs';
import { SetupCartActionArgs } from './validators/SetupCartActionArgs';
import { UpdateCartActionArgs } from './validators/UpdateCartActionArgs';
import { RecordEmitterEventArgs } from './validators/RecordEmitterEvent';
import { PaymentsEmitterService } from '@fxa/payments/events';
import { FinalizeProcessingCartActionArgs } from './validators/finalizeProcessingCartActionArgs';
import { SubmitNeedsInputActionArgs } from './validators/SubmitNeedsInputActionArgs';
import { GetNeedsInputActionArgs } from './validators/GetNeedsInputActionArgs';
import { ValidatePostalCodeActionArgs } from './validators/ValidatePostalCodeActionArgs';
import { DetermineCurrencyActionArgs } from './validators/DetermineCurrencyActionArgs';
import { NextIOValidator } from './NextIOValidator';
import type {
  CommonMetrics,
  PaymentProvidersType,
} from '@fxa/payments/metrics';
import { GetCartActionResult } from './validators/GetCartActionResult';
import { GetSuccessCartActionResult } from './validators/GetSuccessCartActionResult';
import {
  CouponErrorExpired,
  CouponErrorGeneric,
  CouponErrorLimitReached,
  TaxAddress,
  type SubplatInterval,
} from '@fxa/payments/customer';
import { EligibilityService } from '@fxa/payments/eligibility';
import { WithTypeCachableAsyncLocalStorage } from '@fxa/shared/db/type-cacheable';
import { GetProductAvailabilityForLocationActionResult } from './validators/GetProductAvailabilityForLocationActionResult';
import { GetPayPalCheckoutTokenResult } from './validators/GetPayPalCheckoutTokenResult';
import { FetchCMSDataActionResult } from './validators/FetchCMSDataActionResult';
import { getNeedsInputActionResult } from './validators/GetNeedsInputActionResult';
import { GetMetricsFlowActionResult } from './validators/GetMetricsFlowActionResult';
import { ValidatePostalCodeActionResult } from './validators/ValidatePostalCodeActionResult';
import { DetermineCurrencyActionResult } from './validators/DetermineCurrencyActionResult';
import { SetupCartActionResult } from './validators/SetupCartActionResult';
import { RestartCartActionResult } from './validators/RestartCartActionResult';
import { GetTaxAddressArgs } from './validators/GetTaxAddressArgs';
import { GetTaxAddressResult } from './validators/GetTaxAddressResult';
import { CartInvalidPromoCodeError } from 'libs/payments/cart/src/lib/cart.error';
import { GetIsTaxLockedArgs } from './validators/GetIsTaxLockedArgs';
import { GetIsTaxLockedResult } from './validators/GetIsTaxLockedResult';
/**
 * ANY AND ALL methods exposed via this service should be considered publicly accessible and callable with any arguments.
 * ALL server actions must use this service as a proxy to other NestJS services.
 */

@Injectable()
export class NextJSActionsService {
  constructor(
    private cartService: CartService,
    private taxService: TaxService,
    private checkoutTokenManager: CheckoutTokenManager,
    private contentServerManager: ContentServerManager,
    private emitterService: PaymentsEmitterService,
    private googleManager: GoogleManager,
    private geodbManager: GeoDBManager,
    private currencyManager: CurrencyManager,
    private eligibilityService: EligibilityService,
    private productConfigurationManager: ProductConfigurationManager
  ) {}

  @SanitizeExceptions()
  @NextIOValidator(GetCartActionArgs, GetCartActionResult)
  @WithTypeCachableAsyncLocalStorage()
  async getCart(args: { cartId: string }) {
    const cart = await this.cartService.getCart(args.cartId);

    return cart;
  }

  @SanitizeExceptions({
    allowlist: [CartInvalidStateForActionError],
  })
  @NextIOValidator(GetCartActionArgs, GetSuccessCartActionResult)
  @WithTypeCachableAsyncLocalStorage()
  async getSuccessCart(args: { cartId: string }): Promise<SuccessCartDTO> {
    const cart = await this.cartService.getCart(args.cartId);

    if (cart.state !== CartState.SUCCESS) {
      throw new Error('Cart is not in success state');
    }

    return cart;
  }

  @SanitizeExceptions({
    allowlist: [
      CouponErrorExpired,
      CouponErrorGeneric,
      CouponErrorLimitReached,
    ],
  })
  @NextIOValidator(UpdateCartActionArgs, undefined)
  @WithTypeCachableAsyncLocalStorage()
  async updateCart(args: {
    cartId: string;
    version: number;
    cartDetails: {
      uid?: string;
      taxAddress?: {
        countryCode: string;
        postalCode: string;
      };
      couponCode?: string;
    };
  }) {
    await this.cartService.updateCart(
      args.cartId,
      args.version,
      args.cartDetails
    );
  }

  @SanitizeExceptions()
  @NextIOValidator(RestartCartActionArgs, RestartCartActionResult)
  @WithTypeCachableAsyncLocalStorage()
  async restartCart(args: { cartId: string }) {
    const cart = await this.cartService.restartCart(args.cartId);

    return cart;
  }

  @SanitizeExceptions({
    allowlist: [CartInvalidPromoCodeError, ProductConfigError],
  })
  @NextIOValidator(SetupCartActionArgs, SetupCartActionResult)
  @WithTypeCachableAsyncLocalStorage()
  async setupCart(args: {
    interval: SubplatInterval;
    offeringConfigId: string;
    experiment?: string;
    promoCode?: string;
    uid?: string;
    taxAddress: TaxAddress;
  }) {
    const cart = await this.cartService.setupCart({
      ...args,
    });

    return cart;
  }

  @SanitizeExceptions()
  @NextIOValidator(FinalizeCartWithErrorArgs, undefined)
  @WithTypeCachableAsyncLocalStorage()
  async finalizeCartWithError(args: {
    cartId: string;
    errorReasonId: CartErrorReasonId;
  }) {
    await this.cartService.finalizeCartWithError(
      args.cartId,
      args.errorReasonId
    );
  }

  @SanitizeExceptions()
  @NextIOValidator(FinalizeProcessingCartActionArgs, undefined)
  @WithTypeCachableAsyncLocalStorage()
  async finalizeProcessingCart(args: { cartId: string }) {
    await this.cartService.finalizeProcessingCart(args.cartId);
  }

  @SanitizeExceptions()
  @NextIOValidator(GetPayPalCheckoutTokenArgs, GetPayPalCheckoutTokenResult)
  @WithTypeCachableAsyncLocalStorage()
  async getPayPalCheckoutToken(args: { currencyCode: string }) {
    const token = await this.checkoutTokenManager.get(args.currencyCode);

    return {
      token,
    };
  }

  @SanitizeExceptions()
  @NextIOValidator(GetTaxAddressArgs, GetTaxAddressResult)
  @WithTypeCachableAsyncLocalStorage()
  async getTaxAddress(args: { ipAddress: string; uid?: string }) {
    const result = await this.taxService.getTaxAddress(
      args.ipAddress,
      args.uid
    );

    return result;
  }

  @SanitizeExceptions()
  @NextIOValidator(GetIsTaxLockedArgs, GetIsTaxLockedResult)
  @WithTypeCachableAsyncLocalStorage()
  async getIsTaxLocked(args: { uid: string }) {
    const result = await this.taxService.getIsTaxLocked(args.uid);

    return result;
  }

  @SanitizeExceptions()
  @NextIOValidator(CheckoutCartWithPaypalActionArgs, undefined)
  @WithTypeCachableAsyncLocalStorage()
  async checkoutCartWithPaypal(args: {
    cartId: string;
    version: number;
    customerData: { locale: string; displayName: string };
    token?: string;
  }) {
    await this.cartService.checkoutCartWithPaypal(
      args.cartId,
      args.version,
      args.customerData,
      args.token
    );
  }

  @SanitizeExceptions()
  @NextIOValidator(CheckoutCartWithStripeActionArgs, undefined)
  @WithTypeCachableAsyncLocalStorage()
  async checkoutCartWithStripe(args: {
    cartId: string;
    version: number;
    confirmationTokenId: string;
    customerData: { locale: string; displayName: string };
  }) {
    await this.cartService.checkoutCartWithStripe(
      args.cartId,
      args.version,
      args.confirmationTokenId,
      args.customerData
    );
  }

  @SanitizeExceptions({ allowlist: [ProductConfigError] })
  @NextIOValidator(FetchCMSDataActionArgs, FetchCMSDataActionResult)
  @WithTypeCachableAsyncLocalStorage()
  async fetchCMSData(args: {
    offeringId: string;
    acceptLanguage?: string | null;
    selectedLanguage?: string;
  }) {
    const offering = await this.productConfigurationManager.fetchCMSData(
      args.offeringId,
      args.acceptLanguage || undefined,
      args.selectedLanguage
    );

    return offering;
  }

  @SanitizeExceptions()
  @NextIOValidator(RecordEmitterEventArgs, undefined)
  @WithTypeCachableAsyncLocalStorage()
  async recordEmitterEvent(args: {
    eventName: string;
    requestArgs: CommonMetrics;
    paymentProvider: PaymentProvidersType | undefined;
  }) {
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

  @SanitizeExceptions()
  @NextIOValidator(GetNeedsInputActionArgs, getNeedsInputActionResult)
  @WithTypeCachableAsyncLocalStorage()
  async getNeedsInput(args: { cartId: string }) {
    return await this.cartService.getNeedsInput(args.cartId);
  }

  @SanitizeExceptions({
    allowlist: [CheckoutFailedError],
  })
  @NextIOValidator(SubmitNeedsInputActionArgs, undefined)
  @WithTypeCachableAsyncLocalStorage()
  async submitNeedsInput(args: { cartId: string }) {
    await this.cartService.submitNeedsInput(args.cartId);
  }

  @SanitizeExceptions()
  @NextIOValidator(undefined, GetMetricsFlowActionResult)
  async getMetricsFlow() {
    return this.contentServerManager.getMetricsFlow();
  }

  @SanitizeExceptions()
  @NextIOValidator(ValidatePostalCodeActionArgs, ValidatePostalCodeActionResult)
  @WithTypeCachableAsyncLocalStorage()
  async validateAndFormatPostalCode(args: {
    postalCode: string;
    countryCode: string;
  }) {
    return await this.googleManager.validateAndFormatPostalCode(
      args.postalCode,
      args.countryCode
    );
  }

  @SanitizeExceptions()
  @NextIOValidator(DetermineCurrencyActionArgs, DetermineCurrencyActionResult)
  @WithTypeCachableAsyncLocalStorage()
  async determineCurrency(args: { ip: string }) {
    const location = this.geodbManager.getTaxAddress(args.ip);

    if (!location?.countryCode) {
      return {};
    }

    const currency = this.currencyManager.getCurrencyForCountry(
      location.countryCode
    );

    return {
      currency,
    };
  }

  @SanitizeExceptions()
  @NextIOValidator(
    GetProductAvailabilityForLocationActionArgs,
    GetProductAvailabilityForLocationActionResult
  )
  @WithTypeCachableAsyncLocalStorage()
  async getProductAvailabilityForLocation(args: {
    offeringId: string;
    countryCode?: string;
  }) {
    return await this.eligibilityService.getProductAvailabilityForLocation(
      args.offeringId,
      args.countryCode
    );
  }
}
