/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable, type LoggerService, Logger } from '@nestjs/common';

import { GoogleManager } from '@fxa/google';
import {
  CartInvalidStateForActionError,
  CartService,
  SuccessCartDTO,
  TaxChangeAllowedStatus,
  TaxService,
} from '@fxa/payments/cart';
import { ContentServerManager } from '@fxa/payments/content-server';
import { CurrencyManager } from '@fxa/payments/currency';
import { SubscriptionManagementService, ChurnInterventionService } from '@fxa/payments/management';
import {
  CheckoutTokenManager,
  PaypalBillingAgreementManager,
} from '@fxa/payments/paypal';
import {
  ProductConfigError,
  ProductConfigurationManager,
} from '@fxa/shared/cms';
import { CartErrorReasonId, CartState } from '@fxa/shared/db/mysql/account';
import { SanitizeExceptions } from '@fxa/shared/error';
import { GeoDBManager } from '@fxa/shared/geodb';
import { AccountCustomerNotFoundError } from '@fxa/payments/stripe';

import { CheckoutCartWithPaypalActionArgs } from './validators/CheckoutCartWithPaypalActionArgs';
import { CheckoutCartWithStripeActionArgs } from './validators/CheckoutCartWithStripeActionArgs';
import { FetchCMSDataActionArgs } from './validators/FetchCMSDataActionArgs';
import { FinalizeCartWithErrorArgs } from './validators/FinalizeCartWithErrorArgs';
import { GetCartActionArgs } from './validators/GetCartActionArgs';
import { GetChurnInterventionDataActionArgs } from './validators/GetChurnInterventionDataActionArgs';
import { GetPayPalCheckoutTokenArgs } from './validators/GetPayPalCheckoutTokenArgs';
import { GetSubManPageContentActionArgs } from './validators/GetSubManPageContentActionArgs';
import { GetSubManPageContentActionResult } from './validators/GetSubManPageContentActionResult';
import { RestartCartActionArgs } from './validators/RestartCartActionArgs';
import { SetupCartActionArgs } from './validators/SetupCartActionArgs';
import { UpdateCartActionArgs } from './validators/UpdateCartActionArgs';
import { RecordEmitterEventArgs } from './validators/RecordEmitterEvent';
import { GetCouponArgs } from './validators/GetCouponArgs';
import { GetCouponResult } from './validators/GetCouponResult';
import { PaymentsEmitterService } from '@fxa/payments/events';
import { FinalizeProcessingCartActionArgs } from './validators/finalizeProcessingCartActionArgs';
import { SubmitNeedsInputActionArgs } from './validators/SubmitNeedsInputActionArgs';
import { GetNeedsInputActionArgs } from './validators/GetNeedsInputActionArgs';
import { ValidatePostalCodeActionArgs } from './validators/ValidatePostalCodeActionArgs';
import { DetermineCurrencyActionArgs } from './validators/DetermineCurrencyActionArgs';
import { DetermineStaySubscribedEligibilityActionArgs } from './validators/DetermineStaySubscribedEligibilityActionArgs';
import { NextIOValidator } from './NextIOValidator';
import type {
  CommonMetrics,
  PaymentProvidersType,
} from '@fxa/payments/metrics';
import { GetCartActionResult } from './validators/GetCartActionResult';
import { GetChurnInterventionDataActionResult } from './validators/GetChurnInterventionDataActionResult';
import { GetSuccessCartActionResult } from './validators/GetSuccessCartActionResult';
import {
  CouponErrorCannotRedeem,
  PromotionCodeSanitizedError,
  TaxAddress,
  type SubplatInterval,
} from '@fxa/payments/customer';
import { EligibilityService, LocationStatus } from '@fxa/payments/eligibility';
import { WithTypeCachableAsyncLocalStorage } from '@fxa/shared/db/type-cacheable';
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
import {
  CartVersionMismatchError,
  InvalidPromoCodeCartError,
} from 'libs/payments/cart/src/lib/cart.error';
import { UpdateCartActionResult } from './validators/UpdateCartActionResult';
import { ValidateLocationActionResult } from './validators/ValidateLocationActionResult';
import { ValidateLocationActionArgs } from './validators/ValidateLocationActionArgs';
import { UpdateTaxAddressActionArgs } from './validators/UpdateTaxAddressActionArgs';
import { UpdateTaxAddressActionResult } from './validators/UpdateTaxAddressActionResult';
import {
  CaptureTimingWithStatsD,
  StatsDService,
  type StatsD,
} from '@fxa/shared/metrics/statsd';
import { GetCartStateActionArgs } from './validators/GetCartStateActionArgs';
import { GetCartStateActionResult } from './validators/GetCartStateActionResult';
import type { SubscriptionAttributionParams } from '@fxa/payments/cart';
import { ServerLogActionArgs } from './validators/ServerLogActionArgs';
import { ProfileClient } from '@fxa/profile/client';
import { GetUserinfoResult } from './validators/GetUserinfoResult';
import { GetUserinfoArgs } from './validators/GetUserinfoArgs';
import { GetStripePaymentManagementDetailsArgs } from './validators/GetStripeClientSessionActionArgs';
import { GetStripePaymentManagementDetailsResult } from './validators/GetStripePaymentManagementDetailsResult';
import { UpdateStripePaymentDetailsArgs } from './validators/UpdateStripePaymentDetailsActionArgs';
import { UpdateStripePaymentDetailsResult } from './validators/UpdateStripePaymentDetailsActionResult';
import { SetDefaultStripePaymentDetailsActionArgs } from './validators/SetDefaultStripePaymentDetailsActionArgs';
import { CancelSubscriptionAtPeriodEndActionArgs } from './validators/CancelSubscriptionAtPeriodEndActionArgs';
import { CancelSubscriptionAtPeriodEndActionResult } from './validators/CancelSubscriptionAtPeriodEndActionResult';
import { ResubscribeSubscriptionActionArgs } from './validators/ResubscribeSubscriptionActionArgs';
import { ResubscribeSubscriptionActionResult } from './validators/ResubscribeSubscriptionActionResult';
import { GetPaypalBillingAgreementActiveIdArgs } from './validators/GetPaypalBillingAgreementActiveIdArgs';
import { GetPaypalBillingAgreementActiveIdResult } from './validators/GetPaypalBillingAgreementActiveIdResult';
import { CreatePaypalBillingAgreementIdArgs } from './validators/CreatePaypalBillingAgreementIdArgs';
import { DetermineCurrencyForCustomerActionArgs } from './validators/DetermineCurrencyForCustomerActionArgs';
import { DetermineCurrencyForCustomerActionResult } from './validators/DetermineCurrencyForCustomerActionResult';
import { DetermineStaySubscribedEligibilityActionResult } from './validators/DetermineStaySubscribedEligibilityActionResult';
import { NimbusManager } from '@fxa/payments/experiments';
import { GetExperimentsActionArgs } from './validators/GetExperimentsActionArgs';
import { GetExperimentsActionResult } from './validators/GetExperimentsActionResult';

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
    private churnInterventionService: ChurnInterventionService,
    private contentServerManager: ContentServerManager,
    private emitterService: PaymentsEmitterService,
    private googleManager: GoogleManager,
    private geodbManager: GeoDBManager,
    private currencyManager: CurrencyManager,
    private eligibilityService: EligibilityService,
    private productConfigurationManager: ProductConfigurationManager,
    private profileClient: ProfileClient,
    private subscriptionManagementService: SubscriptionManagementService,
    private paypalBillingAgreementManager: PaypalBillingAgreementManager,
    private nimbusManager: NimbusManager,
    @Inject(StatsDService) public statsd: StatsD,
    @Inject(Logger) private log: LoggerService
  ) {}

  @SanitizeExceptions()
  @NextIOValidator(
    CancelSubscriptionAtPeriodEndActionArgs,
    CancelSubscriptionAtPeriodEndActionResult
  )
  @WithTypeCachableAsyncLocalStorage()
  @CaptureTimingWithStatsD()
  async cancelSubscriptionAtPeriodEnd(args: {
    uid: string;
    subscriptionId: string;
  }) {
    try {
      await this.subscriptionManagementService.cancelSubscriptionAtPeriodEnd(
        args.uid,
        args.subscriptionId
      );

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
      };
    }
  }

  @SanitizeExceptions()
  @NextIOValidator(GetCartStateActionArgs, GetCartStateActionResult)
  @WithTypeCachableAsyncLocalStorage()
  @CaptureTimingWithStatsD()
  async getCartState(args: { cartId: string }) {
    const cart = await this.cartService.getCartState(args.cartId);

    return cart;
  }

  @SanitizeExceptions()
  @NextIOValidator(GetCartActionArgs, GetCartActionResult)
  @WithTypeCachableAsyncLocalStorage()
  @CaptureTimingWithStatsD()
  async getCart(args: { cartId: string }) {
    return this.cartService.getCart(args.cartId);
  }

  @SanitizeExceptions()
  @NextIOValidator(GetExperimentsActionArgs, GetExperimentsActionResult)
  @WithTypeCachableAsyncLocalStorage()
  @CaptureTimingWithStatsD()
  async getExperiments(args: {
    language: string;
    ip: string;
    experimentationPreview: boolean;
    fxaUid?: string;
    experimentationId?: string;
  }) {
    const nimbusUserId = this.nimbusManager.generateNimbusId(
      args.fxaUid,
      args.experimentationId
    );
    const location = this.geodbManager.getTaxAddress(args.ip);
    const experiments = await this.nimbusManager.fetchExperiments({
      nimbusUserId,
      language: args.language,
      region: location?.countryCode,
      preview: args.experimentationPreview,
    });

    if (experiments) {
      return {
        experiments,
      };
    } else {
      return undefined;
    }
  }

  @SanitizeExceptions({
    allowlist: [CartInvalidStateForActionError],
  })
  @NextIOValidator(GetCartActionArgs, GetSuccessCartActionResult)
  @WithTypeCachableAsyncLocalStorage()
  @CaptureTimingWithStatsD()
  async getSuccessCart(args: { cartId: string }): Promise<SuccessCartDTO> {
    const cart = await this.cartService.getCart(args.cartId);

    if (cart.state !== CartState.SUCCESS) {
      throw new Error('Cart is not in success state');
    }

    return cart;
  }

  @SanitizeExceptions()
  @NextIOValidator(
    GetChurnInterventionDataActionArgs,
    GetChurnInterventionDataActionResult
  )
  @WithTypeCachableAsyncLocalStorage()
  @CaptureTimingWithStatsD()
  async getChurnInterventionEntryData(args: {
    customerId: string;
    churnInterventionId: string;
  }) {
    const data = await this.churnInterventionService.getEntry(
      args.customerId,
      args.churnInterventionId
    );
    return data;
  }

  @SanitizeExceptions()
  @NextIOValidator(
    DetermineStaySubscribedEligibilityActionArgs,
    DetermineStaySubscribedEligibilityActionResult
  )
  @WithTypeCachableAsyncLocalStorage()
  @CaptureTimingWithStatsD()
  async determineStaySubscribedEligibility(args: {
    uid: string;
    subscriptionId: string;
    acceptLanguage?: string | null;
    selectedLanguage?: string;
  }) {
    return await this.churnInterventionService.determineStaySubscribedEligibility(
      args.uid,
      args.subscriptionId,
      args.acceptLanguage,
      args.selectedLanguage,
    );
  }

  @SanitizeExceptions({
    allowlist: [PromotionCodeSanitizedError, CartVersionMismatchError],
  })
  @NextIOValidator(UpdateCartActionArgs, UpdateCartActionResult)
  @WithTypeCachableAsyncLocalStorage()
  @CaptureTimingWithStatsD()
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
    return this.cartService.updateCart(
      args.cartId,
      args.version,
      args.cartDetails
    );
  }

  @SanitizeExceptions()
  @NextIOValidator(GetCouponArgs, GetCouponResult)
  @WithTypeCachableAsyncLocalStorage()
  @CaptureTimingWithStatsD()
  async getCoupon(args: { cartId: string; version: number }) {
    const couponCode = await this.cartService.getCoupon({
      cartId: args.cartId,
      version: args.version,
    });
    return couponCode;
  }

  @SanitizeExceptions()
  @NextIOValidator(RestartCartActionArgs, RestartCartActionResult)
  @WithTypeCachableAsyncLocalStorage()
  @CaptureTimingWithStatsD()
  async restartCart(args: { cartId: string }) {
    const cart = await this.cartService.restartCart(args.cartId);

    return cart;
  }

  @SanitizeExceptions({
    allowlist: [
      CouponErrorCannotRedeem,
      InvalidPromoCodeCartError,
      ProductConfigError,
    ],
  })
  @NextIOValidator(SetupCartActionArgs, SetupCartActionResult)
  @WithTypeCachableAsyncLocalStorage()
  @CaptureTimingWithStatsD()
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
  @CaptureTimingWithStatsD()
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
  @CaptureTimingWithStatsD()
  async finalizeProcessingCart(args: { cartId: string }) {
    await this.cartService.finalizeProcessingCart(args.cartId);
  }

  @SanitizeExceptions()
  @NextIOValidator(GetPayPalCheckoutTokenArgs, GetPayPalCheckoutTokenResult)
  @WithTypeCachableAsyncLocalStorage()
  @CaptureTimingWithStatsD()
  async getPayPalCheckoutToken(args: { currencyCode: string }) {
    const token = await this.checkoutTokenManager.get(args.currencyCode);

    return {
      token,
    };
  }

  @SanitizeExceptions()
  @NextIOValidator(
    GetPaypalBillingAgreementActiveIdArgs,
    GetPaypalBillingAgreementActiveIdResult
  )
  @CaptureTimingWithStatsD()
  async getPaypalBillingAgreementActiveId(args: { uid: string }) {
    const paypalBillingAgreementId =
      await this.paypalBillingAgreementManager.retrieveActiveId(args.uid);

    return {
      paypalBillingAgreementId,
    };
  }

  @SanitizeExceptions()
  @NextIOValidator(CreatePaypalBillingAgreementIdArgs, undefined)
  @WithTypeCachableAsyncLocalStorage()
  @CaptureTimingWithStatsD()
  async createPayPalBillingAgreementId(args: { uid: string; token: string }) {
    await this.subscriptionManagementService.createPaypalBillingAgreementId(
      args.uid,
      args.token
    );
  }

  @SanitizeExceptions()
  @NextIOValidator(GetTaxAddressArgs, GetTaxAddressResult)
  @WithTypeCachableAsyncLocalStorage()
  @CaptureTimingWithStatsD()
  async getTaxAddress(args: { ipAddress: string; uid?: string }) {
    const result = await this.taxService.getTaxAddress(
      args.ipAddress,
      args.uid
    );

    return {
      result,
    };
  }

  @SanitizeExceptions()
  @NextIOValidator(CheckoutCartWithPaypalActionArgs, undefined)
  @WithTypeCachableAsyncLocalStorage()
  @CaptureTimingWithStatsD()
  async checkoutCartWithPaypal(args: {
    cartId: string;
    version: number;
    customerData: { locale: string; displayName: string };
    attribution: SubscriptionAttributionParams;
    sessionUid?: string;
    token?: string;
  }) {
    await this.cartService.checkoutCartWithPaypal(
      args.cartId,
      args.version,
      args.customerData,
      args.attribution,
      args.sessionUid,
      args.token
    );
  }

  @SanitizeExceptions()
  @NextIOValidator(CheckoutCartWithStripeActionArgs, undefined)
  @WithTypeCachableAsyncLocalStorage()
  @CaptureTimingWithStatsD()
  async checkoutCartWithStripe(args: {
    cartId: string;
    version: number;
    confirmationTokenId: string;
    customerData: { locale: string; displayName: string };
    attribution: SubscriptionAttributionParams;
    sessionUid?: string;
  }) {
    await this.cartService.checkoutCartWithStripe(
      args.cartId,
      args.version,
      args.confirmationTokenId,
      args.customerData,
      args.attribution,
      args.sessionUid
    );
  }

  @SanitizeExceptions({ allowlist: [ProductConfigError] })
  @NextIOValidator(FetchCMSDataActionArgs, FetchCMSDataActionResult)
  @WithTypeCachableAsyncLocalStorage()
  @CaptureTimingWithStatsD()
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
  @NextIOValidator(
    GetSubManPageContentActionArgs,
    GetSubManPageContentActionResult
  )
  @WithTypeCachableAsyncLocalStorage()
  @CaptureTimingWithStatsD()
  async getSubManPageContent(args: {
    uid: string;
    acceptLanguage?: string | null;
    selectedLanguage?: string;
  }) {
    const result = await this.subscriptionManagementService.getPageContent(
      args.uid,
      args.acceptLanguage || undefined,
      args.selectedLanguage
    );

    return result;
  }

  @SanitizeExceptions()
  @NextIOValidator(RecordEmitterEventArgs, undefined)
  @WithTypeCachableAsyncLocalStorage()
  @CaptureTimingWithStatsD()
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
  @CaptureTimingWithStatsD()
  async getNeedsInput(args: { cartId: string }) {
    return await this.cartService.getNeedsInput(args.cartId);
  }

  @SanitizeExceptions()
  @NextIOValidator(SubmitNeedsInputActionArgs, undefined)
  @WithTypeCachableAsyncLocalStorage()
  @CaptureTimingWithStatsD()
  async submitNeedsInput(args: { cartId: string }) {
    await this.cartService.submitNeedsInput(args.cartId);
  }

  @SanitizeExceptions()
  @NextIOValidator(undefined, GetMetricsFlowActionResult)
  @CaptureTimingWithStatsD()
  async getMetricsFlow() {
    return this.contentServerManager.getMetricsFlow();
  }

  @SanitizeExceptions()
  @NextIOValidator(ValidatePostalCodeActionArgs, ValidatePostalCodeActionResult)
  @WithTypeCachableAsyncLocalStorage()
  @CaptureTimingWithStatsD()
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
  @CaptureTimingWithStatsD()
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
    DetermineCurrencyForCustomerActionArgs,
    DetermineCurrencyForCustomerActionResult
  )
  @WithTypeCachableAsyncLocalStorage()
  @CaptureTimingWithStatsD()
  async determineCurrencyForCustomer(args: { uid: string }) {
    const currency =
      await this.subscriptionManagementService.getCurrencyForCustomer(args.uid);

    return {
      currency,
    };
  }

  @SanitizeExceptions()
  @NextIOValidator(
    ResubscribeSubscriptionActionArgs,
    ResubscribeSubscriptionActionResult
  )
  @WithTypeCachableAsyncLocalStorage()
  @CaptureTimingWithStatsD()
  async resubscribeSubscription(args: {
    uid: string;

    subscriptionId: string;
  }) {
    try {
      await this.subscriptionManagementService.resubscribeSubscription(
        args.uid,
        args.subscriptionId
      );

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
      };
    }
  }

  @SanitizeExceptions()
  @NextIOValidator(UpdateTaxAddressActionArgs, UpdateTaxAddressActionResult)
  @WithTypeCachableAsyncLocalStorage()
  @CaptureTimingWithStatsD()
  async updateTaxAddress(args: {
    cartId: string;
    version: number;
    offeringId: string;
    taxAddress: TaxAddress;
    uid?: string;
  }): Promise<
    | {
        ok: true;
        taxAddress: TaxAddress;
      }
    | {
        ok: false;
        error: string;
      }
  > {
    const { cartId, version, offeringId, taxAddress, uid } = args;

    // Validate Tax Address before updating
    const { isValid, status } = await this.validateLocation({
      offeringId,
      taxAddress,
      uid,
    });
    if (!isValid) {
      return {
        ok: false,
        error: status,
      };
    }

    try {
      const { taxAddress: cartTaxAddress } = await this.cartService.updateCart(
        cartId,
        version,
        {
          taxAddress,
        }
      );

      if (!cartTaxAddress) {
        return {
          ok: false,
          error: 'cart_tax_address_not_updated',
        };
      }
    } catch (error) {
      if (
        error instanceof CartVersionMismatchError ||
        error instanceof CartInvalidStateForActionError
      ) {
        return {
          ok: false,
          error: 'cart_tax_address_not_updated',
        };
      } else {
        throw error;
      }
    }

    return {
      ok: true,
      taxAddress,
    };
  }

  @SanitizeExceptions()
  @NextIOValidator(ValidateLocationActionArgs, ValidateLocationActionResult)
  @WithTypeCachableAsyncLocalStorage()
  @CaptureTimingWithStatsD()
  async validateLocation(args: {
    offeringId: string;
    taxAddress?: TaxAddress;
    uid?: string;
  }) {
    const { status: locationStatus } =
      await this.eligibilityService.getProductAvailabilityForLocation(
        args.offeringId,
        args.taxAddress?.countryCode
      );

    if (locationStatus === LocationStatus.Valid) {
      if (args.uid && args.taxAddress) {
        const { status: taxChangeStatus, currentCurrency } =
          await this.taxService.getTaxChangeStatus(args.uid, args.taxAddress);
        return {
          isValid: taxChangeStatus === TaxChangeAllowedStatus.Allowed,
          status: taxChangeStatus,
          currentCurrency,
        };
      } else {
        return {
          isValid: true,
          status: locationStatus,
        };
      }
    } else {
      return {
        isValid: false,
        status: locationStatus,
      };
    }
  }

  @SanitizeExceptions()
  @NextIOValidator(ServerLogActionArgs, undefined)
  @WithTypeCachableAsyncLocalStorage()
  @CaptureTimingWithStatsD()
  async serverLog(args: { message: string; data?: any }) {
    this.log.log(args.message, args.data);
  }

  @SanitizeExceptions()
  @NextIOValidator(GetUserinfoArgs, GetUserinfoResult)
  @WithTypeCachableAsyncLocalStorage()
  @CaptureTimingWithStatsD()
  async getUserinfo(args: { accessToken: string; userinfoUrl: string }) {
    return await this.profileClient.getUserinfo(
      args.userinfoUrl,
      args.accessToken
    );
  }

  @SanitizeExceptions({ allowlist: [AccountCustomerNotFoundError] })
  @NextIOValidator(
    GetStripePaymentManagementDetailsArgs,
    GetStripePaymentManagementDetailsResult
  )
  @WithTypeCachableAsyncLocalStorage()
  @CaptureTimingWithStatsD()
  async getStripePaymentManagementDetails(args: { uid: string }) {
    return await this.subscriptionManagementService.getStripePaymentManagementDetails(
      args.uid
    );
  }

  @SanitizeExceptions()
  @NextIOValidator(
    UpdateStripePaymentDetailsArgs,
    UpdateStripePaymentDetailsResult
  )
  @CaptureTimingWithStatsD()
  async updateStripePaymentDetails(args: {
    uid: string;
    confirmationTokenId: string;
  }) {
    return await this.subscriptionManagementService.updateStripePaymentDetails(
      args.uid,
      args.confirmationTokenId
    );
  }

  @SanitizeExceptions()
  @NextIOValidator(SetDefaultStripePaymentDetailsActionArgs, undefined)
  @CaptureTimingWithStatsD()
  async setDefaultStripePaymentDetails(args: {
    uid: string;
    paymentMethodId: string;
    fullName: string;
  }) {
    return await this.subscriptionManagementService.setDefaultStripePaymentDetails(
      args.uid,
      args.paymentMethodId,
      args.fullName
    );
  }
}
