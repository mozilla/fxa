/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable, type LoggerService, Logger } from '@nestjs/common';

import { GoogleManager } from '@fxa/google';
import {
  CartInvalidStateForActionError,
  CartManager,
  CartService,
  stripePaymentElementTypeToSubPlatPaymentType,
  SubscriptionAttributionParams,
  SuccessCartDTO,
  TaxChangeAllowedStatus,
  TaxService,
} from '@fxa/payments/cart';
import { ContentServerManager } from '@fxa/payments/content-server';
import { CurrencyManager } from '@fxa/payments/currency';
import {
  SubscriptionManagementService,
  ChurnInterventionService,
  ManagePaymentMethodIntentCardDeclinedError,
  ManagePaymentMethodIntentCardExpiredError,
  ManagePaymentMethodIntentFailedGenericError,
  ManagePaymentMethodIntentGetInTouchError,
  ManagePaymentMethodIntentTryAgainError,
  ManagePaymentMethodIntentInsufficientFundsError,
  ManagePaymentMethodTaxAddressRequiredError,
  CurrencyForCustomerNotFoundError,
} from '@fxa/payments/management';
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
import { GetInterstitialOfferContentActionArgs } from './validators/GetInterstitialOfferContentActionArgs'; //
import { GetInterstitialOfferContentActionResult } from './validators/GetInterstitialOfferContentActionResult';
import { RestartCartActionArgs } from './validators/RestartCartActionArgs';
import { SetupCartActionArgs } from './validators/SetupCartActionArgs';
import { UpdateCartActionArgs } from './validators/UpdateCartActionArgs';
import { RecordEmitterEventArgs } from './validators/RecordEmitterEvent';
import { GetCouponArgs } from './validators/GetCouponArgs';
import { GetCouponResult } from './validators/GetCouponResult';
import {
  GleanGenericEventNames,
  PaymentsEmitterService,
} from '@fxa/payments/events';
import { FinalizeProcessingCartActionArgs } from './validators/finalizeProcessingCartActionArgs';
import { RedeemChurnCouponActionArgs } from './validators/RedeemChurnCouponActionArgs';
import { SubmitNeedsInputActionArgs } from './validators/SubmitNeedsInputActionArgs';
import { GetNeedsInputActionArgs } from './validators/GetNeedsInputActionArgs';
import { ValidatePostalCodeActionArgs } from './validators/ValidatePostalCodeActionArgs';
import { DetermineCurrencyActionArgs } from './validators/DetermineCurrencyActionArgs';
import { DetermineChurnCancelEligibilityActionResult } from './validators/DetermineChurnCancelEligibilityActionResult';
import { DetermineChurnEligibilityActionArgs } from './validators/DetermineChurnEligibilityActionArgs';
import { DetermineCancellationInterventionActionArgs } from './validators/DetermineCancellationInterventionActionArgs';
import { NextIOValidator } from './NextIOValidator';
import { AssertCartOwnership } from './assertCartOwnership.decorator';
import { type CommonMetrics } from '@fxa/payments/metrics';
import { GetCartActionResult } from './validators/GetCartActionResult';
import { GetChurnInterventionDataActionResult } from './validators/GetChurnInterventionDataActionResult';
import { GetSuccessCartActionResult } from './validators/GetSuccessCartActionResult';
import {
  CouponErrorCannotRedeem,
  PromotionCodeSanitizedError,
  SubPlatPaymentMethodType,
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
import { GetCancelFlowContentActionResult } from './validators/GetCancelFlowContentActionResult';
import { GetStaySubscribedFlowContentActionResult } from './validators/GetStaySubscribedFlowContentActionResult';
import { GetSubscriptionPageContentActionArgs } from './validators/GetSubscriptionPageContentActionArgs';
import { GetTaxAddressArgs } from './validators/GetTaxAddressArgs';
import { GetTaxAddressResult } from './validators/GetTaxAddressResult';
import {
  CartUidMismatchError,
  CartVersionMismatchError,
  InvalidPromoCodeCartError,
  SetupCartAccountNotFoundError,
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
import { GetDbCartActionArgs } from './validators/GetDbCartActionArgs';
import { GetDbCartActionResult } from './validators/GetDbCartActionResult';
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
import { CancelSubscriptionImmediatelyActionArgs } from './validators/CancelSubscriptionImmediatelyActionArgs';
import { CancelSubscriptionImmediatelyActionResult } from './validators/CancelSubscriptionImmediatelyActionResult';
import { RedeemChurnCouponActionResult } from './validators/RedeemChurnCouponActionResult';
import { ResubscribeSubscriptionActionArgs } from './validators/ResubscribeSubscriptionActionArgs';
import { ResubscribeSubscriptionActionResult } from './validators/ResubscribeSubscriptionActionResult';
import { GetPaypalBillingAgreementActiveIdArgs } from './validators/GetPaypalBillingAgreementActiveIdArgs';
import { GetPaypalBillingAgreementActiveIdResult } from './validators/GetPaypalBillingAgreementActiveIdResult';
import { CreatePaypalBillingAgreementIdArgs } from './validators/CreatePaypalBillingAgreementIdArgs';
import { DetermineCurrencyForCustomerActionArgs } from './validators/DetermineCurrencyForCustomerActionArgs';
import { DetermineCurrencyForCustomerActionResult } from './validators/DetermineCurrencyForCustomerActionResult';
import { DetermineStaySubscribedEligibilityActionResult } from './validators/DetermineStaySubscribedEligibilityActionResult';
import { DetermineCancellationInterventionActionResult } from './validators/DetermineCancellationInterventionActionResult';
import { NimbusManager } from '@fxa/payments/experiments';
import { GetExperimentsActionArgs } from './validators/GetExperimentsActionArgs';
import { GetExperimentsActionResult } from './validators/GetExperimentsActionResult';
import { GetCMSChurnInterventionActionResult } from './validators/GetCMSChurnInterventionActionResult';
import { GetCMSChurnInterventionActionArgs } from './validators/GetCMSChurnInterventionActionArgs';

/**
 * ANY AND ALL methods exposed via this service should be considered publicly accessible and callable with any arguments.
 * ALL server actions must use this service as a proxy to other NestJS services.
 */

@Injectable()
export class NextJSActionsService {
  constructor(
    private cartService: CartService,
    private cartManager: CartManager,
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
    @Inject(Logger) public log: LoggerService
  ) {}

  @SanitizeExceptions()
  @CaptureTimingWithStatsD()
  @NextIOValidator(
    CancelSubscriptionAtPeriodEndActionArgs,
    CancelSubscriptionAtPeriodEndActionResult
  )
  @WithTypeCachableAsyncLocalStorage()
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
  @CaptureTimingWithStatsD()
  @NextIOValidator(
    CancelSubscriptionImmediatelyActionArgs,
    CancelSubscriptionImmediatelyActionResult
  )
  @WithTypeCachableAsyncLocalStorage()
  async cancelSubscriptionImmediately(args: {
    uid: string;
    subscriptionId: string;
  }) {
    try {
      await this.subscriptionManagementService.cancelSubscriptionImmediately(
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

  @SanitizeExceptions({ allowlist: [CartUidMismatchError] })
  @CaptureTimingWithStatsD()
  @NextIOValidator(GetDbCartActionArgs, GetDbCartActionResult)
  @WithTypeCachableAsyncLocalStorage()
  @AssertCartOwnership()
  async getDbCart(args: { cartId: string }) {
    const cart = await this.cartService.getDbCart(args.cartId);

    return cart;
  }

  @SanitizeExceptions({ allowlist: [CartUidMismatchError] })
  @CaptureTimingWithStatsD()
  @NextIOValidator(GetCartActionArgs, GetCartActionResult)
  @WithTypeCachableAsyncLocalStorage()
  @AssertCartOwnership()
  async getCart(args: { cartId: string }) {
    return this.cartService.getCart(args.cartId);
  }

  @SanitizeExceptions()
  @CaptureTimingWithStatsD()
  @NextIOValidator(GetExperimentsActionArgs, GetExperimentsActionResult)
  @WithTypeCachableAsyncLocalStorage()
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
  @CaptureTimingWithStatsD()
  @NextIOValidator(GetCartActionArgs, GetSuccessCartActionResult)
  @WithTypeCachableAsyncLocalStorage()
  @AssertCartOwnership()
  async getSuccessCart(args: { cartId: string }): Promise<SuccessCartDTO> {
    const cart = await this.cartService.getCart(args.cartId);

    if (cart.state !== CartState.SUCCESS) {
      throw new Error('Cart is not in success state');
    }

    return cart;
  }

  @SanitizeExceptions()
  @CaptureTimingWithStatsD()
  @NextIOValidator(
    GetChurnInterventionDataActionArgs,
    GetChurnInterventionDataActionResult
  )
  @WithTypeCachableAsyncLocalStorage()
  async getChurnInterventionEntryData(args: {
    customerId: string;
    churnInterventionId: string;
  }) {
    const data =
      await this.churnInterventionService.getChurnInterventionForCustomerId(
        args.customerId,
        args.churnInterventionId
      );
    return data;
  }

  @SanitizeExceptions()
  @CaptureTimingWithStatsD()
  @NextIOValidator(
    DetermineChurnEligibilityActionArgs,
    DetermineChurnCancelEligibilityActionResult
  )
  @WithTypeCachableAsyncLocalStorage()
  async determineChurnCancelEligibility(args: {
    uid: string;
    subscriptionId: string;
    acceptLanguage?: string | null;
    selectedLanguage?: string;
  }) {
    const churnCancelContentEligibility =
      await this.churnInterventionService.determineCancelChurnContentEligibility(
        {
          uid: args.uid,
          subscriptionId: args.subscriptionId,
          acceptLanguage: args.acceptLanguage,
          selectedLanguage: args.selectedLanguage,
        }
      );

    const cancelContent =
      await this.subscriptionManagementService.getCancelFlowContent(
        args.uid,
        args.subscriptionId,
        args.acceptLanguage || undefined,
        args.selectedLanguage
      );

    return {
      churnCancelContentEligibility,
      cancelContent,
    };
  }

  @SanitizeExceptions()
  @CaptureTimingWithStatsD()
  @NextIOValidator(
    DetermineChurnEligibilityActionArgs,
    DetermineStaySubscribedEligibilityActionResult
  )
  @WithTypeCachableAsyncLocalStorage()
  async determineStaySubscribedEligibility(args: {
    uid: string;
    subscriptionId: string;
    acceptLanguage?: string | null;
    selectedLanguage?: string;
  }) {
    const churnStaySubscribedEligibility =
      await this.churnInterventionService.determineStaySubscribedEligibility(
        args.uid,
        args.subscriptionId,
        args.acceptLanguage,
        args.selectedLanguage
      );

    const staySubscribedContent =
      await this.subscriptionManagementService.getStaySubscribedFlowContent(
        args.uid,
        args.subscriptionId,
        args.acceptLanguage || undefined,
        args.selectedLanguage
      );

    return {
      churnStaySubscribedEligibility,
      staySubscribedContent,
    };
  }

  @SanitizeExceptions()
  @CaptureTimingWithStatsD()
  @NextIOValidator(
    DetermineCancellationInterventionActionArgs,
    DetermineCancellationInterventionActionResult
  )
  @WithTypeCachableAsyncLocalStorage()
  async determineCancellationIntervention(args: {
    uid: string;
    subscriptionId: string;
    acceptLanguage?: string | null;
    selectedLanguage?: string;
  }) {
    const result =
      await this.churnInterventionService.determineCancellationIntervention({
        uid: args.uid,
        subscriptionId: args.subscriptionId,
        acceptLanguage: args.acceptLanguage,
        selectedLanguage: args.selectedLanguage,
      });

    return result;
  }

  @SanitizeExceptions()
  @CaptureTimingWithStatsD()
  @NextIOValidator(RedeemChurnCouponActionArgs, RedeemChurnCouponActionResult)
  @WithTypeCachableAsyncLocalStorage()
  async redeemChurnCoupon(args: {
    uid: string;
    subscriptionId: string;
    churnType: 'cancel' | 'stay_subscribed';
    acceptLanguage?: string | null;
    selectedLanguage?: string;
    requestArgs: CommonMetrics;
  }) {
    const result = await this.churnInterventionService.redeemChurnCoupon(
      args.uid,
      args.subscriptionId,
      args.churnType,
      args.acceptLanguage,
      args.selectedLanguage
    );

    let eventName;
    switch (args.churnType) {
      case 'cancel':
        eventName = GleanGenericEventNames.ChurnCancelRedeemed;
        break;
      case 'stay_subscribed':
        eventName = GleanGenericEventNames.ChurnStayRedeemed;
        break;
    }

    if (eventName) {
      this.emitterService.getEmitter().emit('genericGleanSubManageEvent', {
        eventName,
        commonMetrics: args.requestArgs,
        uid: args.uid,
        subscriptionId: args.subscriptionId,
      });
    }

    return result;
  }

  @SanitizeExceptions({
    allowlist: [PromotionCodeSanitizedError, CartVersionMismatchError],
  })
  @CaptureTimingWithStatsD()
  @NextIOValidator(UpdateCartActionArgs, UpdateCartActionResult)
  @WithTypeCachableAsyncLocalStorage()
  @AssertCartOwnership()
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
  @CaptureTimingWithStatsD()
  @NextIOValidator(GetCouponArgs, GetCouponResult)
  @WithTypeCachableAsyncLocalStorage()
  @AssertCartOwnership()
  async getCoupon(args: { cartId: string; version: number }) {
    const couponCode = await this.cartService.getCoupon({
      cartId: args.cartId,
      version: args.version,
    });
    return couponCode;
  }

  @SanitizeExceptions()
  @CaptureTimingWithStatsD()
  @NextIOValidator(RestartCartActionArgs, RestartCartActionResult)
  @WithTypeCachableAsyncLocalStorage()
  @AssertCartOwnership()
  async restartCart(args: { cartId: string }) {
    const cart = await this.cartService.restartCart(args.cartId);

    return cart;
  }

  @SanitizeExceptions({
    allowlist: [
      CouponErrorCannotRedeem,
      InvalidPromoCodeCartError,
      ProductConfigError,
      SetupCartAccountNotFoundError,
    ],
  })
  @CaptureTimingWithStatsD()
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
  @CaptureTimingWithStatsD()
  @NextIOValidator(FinalizeCartWithErrorArgs, undefined)
  @WithTypeCachableAsyncLocalStorage()
  @AssertCartOwnership()
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
  @CaptureTimingWithStatsD()
  @NextIOValidator(FinalizeProcessingCartActionArgs, undefined)
  @WithTypeCachableAsyncLocalStorage()
  @AssertCartOwnership()
  async finalizeProcessingCart(args: { cartId: string }) {
    await this.cartService.finalizeProcessingCart(args.cartId);
  }

  @SanitizeExceptions()
  @CaptureTimingWithStatsD()
  @NextIOValidator(GetPayPalCheckoutTokenArgs, GetPayPalCheckoutTokenResult)
  @WithTypeCachableAsyncLocalStorage()
  async getPayPalCheckoutToken(args: { currencyCode: string }) {
    const token = await this.checkoutTokenManager.get(args.currencyCode);

    return {
      token,
    };
  }

  @SanitizeExceptions()
  @CaptureTimingWithStatsD()
  @NextIOValidator(
    GetPaypalBillingAgreementActiveIdArgs,
    GetPaypalBillingAgreementActiveIdResult
  )
  async getPaypalBillingAgreementActiveId(args: { uid: string }) {
    const paypalBillingAgreementId =
      await this.paypalBillingAgreementManager.retrieveActiveId(args.uid);

    return {
      paypalBillingAgreementId,
    };
  }

  @SanitizeExceptions()
  @CaptureTimingWithStatsD()
  @NextIOValidator(CreatePaypalBillingAgreementIdArgs, undefined)
  @WithTypeCachableAsyncLocalStorage()
  async createPayPalBillingAgreementId(args: { uid: string; token: string }) {
    await this.subscriptionManagementService.createPaypalBillingAgreementId(
      args.uid,
      args.token
    );
  }

  @SanitizeExceptions()
  @CaptureTimingWithStatsD()
  @NextIOValidator(GetTaxAddressArgs, GetTaxAddressResult)
  @WithTypeCachableAsyncLocalStorage()
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
  @CaptureTimingWithStatsD()
  @NextIOValidator(CheckoutCartWithPaypalActionArgs, undefined)
  @WithTypeCachableAsyncLocalStorage()
  async checkoutCartWithPaypal(args: {
    cartId: string;
    version: number;
    attribution: SubscriptionAttributionParams;
    requestArgs: CommonMetrics;
    sessionUid?: string;
    token?: string;
  }) {
    this.emitterService.getEmitter().emit('checkoutSubmit', {
      ...args.requestArgs,
      paymentProvider: 'paypal',
      paymentMethod: SubPlatPaymentMethodType.PayPal,
    });

    await this.cartService.checkoutCartWithPaypal(
      args.cartId,
      args.version,
      args.attribution,
      args.requestArgs,
      args.sessionUid,
      args.token
    );
  }

  @SanitizeExceptions()
  @CaptureTimingWithStatsD()
  @NextIOValidator(CheckoutCartWithStripeActionArgs, undefined)
  @WithTypeCachableAsyncLocalStorage()
  async checkoutCartWithStripe(args: {
    cartId: string;
    version: number;
    confirmationTokenId: string;
    paymentMethod: string;
    attribution: SubscriptionAttributionParams;
    requestArgs: CommonMetrics;
    sessionUid?: string;
  }) {
    const mappedPaymentMethod =
      stripePaymentElementTypeToSubPlatPaymentType[args.paymentMethod];

    if (args.paymentMethod && !mappedPaymentMethod) {
      const safeToken = /^[a-z_]+$/.test(args.paymentMethod)
        ? args.paymentMethod
        : `<invalid:${args.paymentMethod.length}>`;
      this.log.warn('checkoutSubmit.unmappedPaymentMethod', {
        paymentMethod: safeToken,
      });
    }

    this.emitterService.getEmitter().emit('checkoutSubmit', {
      ...args.requestArgs,
      paymentProvider: 'stripe',
      paymentMethod: mappedPaymentMethod ?? SubPlatPaymentMethodType.Stripe,
    });

    await this.cartService.checkoutCartWithStripe(
      args.cartId,
      args.version,
      args.confirmationTokenId,
      args.attribution,
      args.requestArgs,
      args.sessionUid
    );
  }

  @SanitizeExceptions({ allowlist: [ProductConfigError] })
  @CaptureTimingWithStatsD()
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
  @CaptureTimingWithStatsD()
  @NextIOValidator(
    GetSubManPageContentActionArgs,
    GetSubManPageContentActionResult
  )
  @WithTypeCachableAsyncLocalStorage()
  async getSubManPageContent(args: {
    uid: string;
    requestArgs: CommonMetrics;
    acceptLanguage?: string | null;
    selectedLanguage?: string;
  }) {
    const result = await this.subscriptionManagementService.getPageContent(
      args.uid,
      args.acceptLanguage || undefined,
      args.selectedLanguage
    );

    result.subscriptions.forEach((subscription) => {
      let eventName: GleanGenericEventNames | undefined;
      const {
        canResubscribe,
        isEligibleForChurnStaySubscribed,
        isEligibleForChurnCancel,
        isEligibleForOffer,
      } = subscription;

      if (canResubscribe) {
        if (isEligibleForChurnStaySubscribed) {
          eventName = GleanGenericEventNames.StayRouteChurnContent;
        } else {
          eventName = GleanGenericEventNames.StayRouteStandard;
        }
      } else {
        if (isEligibleForChurnCancel) {
          eventName = GleanGenericEventNames.CancelRouteChurnContent;
        } else {
          if (isEligibleForOffer) {
            eventName = GleanGenericEventNames.CancelRouteInterstitialOffer;
          } else {
            eventName = GleanGenericEventNames.CancelRouteStandard;
          }
        }
      }

      this.emitterService.getEmitter().emit('genericGleanSubManageEvent', {
        eventName,
        uid: args.uid,
        commonMetrics: args.requestArgs,
        subscriptionId: subscription.id,
      });
    });

    return result;
  }

  @SanitizeExceptions()
  @CaptureTimingWithStatsD()
  @NextIOValidator(RecordEmitterEventArgs, undefined)
  @WithTypeCachableAsyncLocalStorage()
  async recordEmitterEvent(args: {
    eventName: 'checkoutView' | 'checkoutEngage';
    requestArgs: CommonMetrics;
  }) {
    const { eventName, requestArgs } = args;

    switch (eventName) {
      case 'checkoutView':
      case 'checkoutEngage': {
        this.emitterService.getEmitter().emit(eventName, {
          ...requestArgs,
        });
        break;
      }
      default: {
        throw new Error(`Event ${args.eventName} not supported`);
      }
    }
  }

  @SanitizeExceptions()
  @CaptureTimingWithStatsD()
  @NextIOValidator(GetNeedsInputActionArgs, getNeedsInputActionResult)
  @WithTypeCachableAsyncLocalStorage()
  @AssertCartOwnership()
  async getNeedsInput(args: { cartId: string }) {
    return await this.cartService.getNeedsInput(args.cartId);
  }

  @SanitizeExceptions()
  @CaptureTimingWithStatsD()
  @NextIOValidator(SubmitNeedsInputActionArgs, undefined)
  @WithTypeCachableAsyncLocalStorage()
  @AssertCartOwnership()
  async submitNeedsInput(args: {
    cartId: string;
    requestArgs: CommonMetrics;
  }) {
    await this.cartService.submitNeedsInput(args.cartId, args.requestArgs);
  }

  @SanitizeExceptions()
  @CaptureTimingWithStatsD()
  @NextIOValidator(undefined, GetMetricsFlowActionResult)
  async getMetricsFlow() {
    return this.contentServerManager.getMetricsFlow();
  }

  @SanitizeExceptions()
  @CaptureTimingWithStatsD()
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
  @CaptureTimingWithStatsD()
  @NextIOValidator(
    GetSubscriptionPageContentActionArgs,
    GetCancelFlowContentActionResult
  )
  @WithTypeCachableAsyncLocalStorage()
  async getCancelFlowContent(args: {
    uid: string;
    subscriptionId: string;
    acceptLanguage?: string | null;
    selectedLanguage?: string;
  }) {
    return await this.subscriptionManagementService.getCancelFlowContent(
      args.uid,
      args.subscriptionId,
      args.acceptLanguage || undefined,
      args.selectedLanguage
    );
  }

  @SanitizeExceptions()
  @CaptureTimingWithStatsD()
  @NextIOValidator(
    GetSubscriptionPageContentActionArgs,
    GetStaySubscribedFlowContentActionResult
  )
  @WithTypeCachableAsyncLocalStorage()
  async getStaySubscribedFlowContent(args: {
    uid: string;
    subscriptionId: string;
    acceptLanguage?: string | null;
    selectedLanguage?: string;
  }) {
    return this.subscriptionManagementService.getStaySubscribedFlowContent(
      args.uid,
      args.subscriptionId,
      args.acceptLanguage || undefined,
      args.selectedLanguage
    );
  }

  @SanitizeExceptions()
  @CaptureTimingWithStatsD()
  @NextIOValidator(
    GetInterstitialOfferContentActionArgs,
    GetInterstitialOfferContentActionResult
  )
  @WithTypeCachableAsyncLocalStorage()
  async getInterstitialOfferContent(args: {
    uid: string;
    subscriptionId: string;
    acceptLanguage?: string | null;
    selectedLanguage?: string;
  }) {
    const offerEligibility =
      await this.churnInterventionService.determineCancelInterstitialOfferEligibility(
        {
          uid: args.uid,
          subscriptionId: args.subscriptionId,
          acceptLanguage: args.acceptLanguage,
          selectedLanguage: args.selectedLanguage,
        }
      );

    const cancelContent =
      await this.subscriptionManagementService.getCancelFlowContent(
        args.uid,
        args.subscriptionId,
        args.acceptLanguage || undefined,
        args.selectedLanguage
      );

    if (
      offerEligibility.isEligible &&
      offerEligibility.cmsCancelInterstitialOfferResult &&
      offerEligibility.cmsCancelInterstitialOfferResult.offering.defaultPurchase
        .purchaseDetails
    ) {
      return {
        isEligible: true,
        reason: 'eligible',
        pageContent: {
          currentInterval:
            offerEligibility.cmsCancelInterstitialOfferResult.currentInterval,
          modalHeading1:
            offerEligibility.cmsCancelInterstitialOfferResult.modalHeading1,
          modalMessage:
            offerEligibility.cmsCancelInterstitialOfferResult.modalMessage,
          upgradeButtonLabel:
            offerEligibility.cmsCancelInterstitialOfferResult
              .upgradeButtonLabel,
          upgradeButtonUrl:
            offerEligibility.cmsCancelInterstitialOfferResult.upgradeButtonUrl,
          webIcon:
            offerEligibility.cmsCancelInterstitialOfferResult.offering
              .defaultPurchase.purchaseDetails.webIcon,
          productName:
            offerEligibility.cmsCancelInterstitialOfferResult.offering
              .defaultPurchase.purchaseDetails.productName,
          offeringId: offerEligibility.offeringId,
          supportUrl:
            offerEligibility.supportUrl ?? 'https://support.mozilla.org',
        },
        cancelContent,
      };
    } else {
      return {
        isEligible: false,
        reason: offerEligibility.reason,
        pageContent: null,
        cancelContent,
      };
    }
  }

  @SanitizeExceptions()
  @CaptureTimingWithStatsD()
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

  @SanitizeExceptions({
    allowlist: [AccountCustomerNotFoundError],
  })
  @CaptureTimingWithStatsD()
  @NextIOValidator(
    DetermineCurrencyForCustomerActionArgs,
    DetermineCurrencyForCustomerActionResult
  )
  @WithTypeCachableAsyncLocalStorage()
  async determineCurrencyForCustomer(args: { uid: string }) {
    const currency =
      await this.subscriptionManagementService.getCurrencyForCustomer(args.uid);

    return {
      currency,
    };
  }

  @SanitizeExceptions()
  @CaptureTimingWithStatsD()
  @NextIOValidator(
    ResubscribeSubscriptionActionArgs,
    ResubscribeSubscriptionActionResult
  )
  @WithTypeCachableAsyncLocalStorage()
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
  @CaptureTimingWithStatsD()
  @NextIOValidator(UpdateTaxAddressActionArgs, UpdateTaxAddressActionResult)
  @WithTypeCachableAsyncLocalStorage()
  @AssertCartOwnership()
  async updateTaxAddress(args: {
    cartId: string;
    version: number;
    offeringId: string;
    taxAddress: TaxAddress;
    uid?: string;
    interval?: string;
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
    const { cartId, version, offeringId, taxAddress, uid, interval } = args;

    // Validate Tax Address before updating
    const { isValid, status } = await this.validateLocation({
      offeringId,
      taxAddress,
      uid,
      interval,
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
  @CaptureTimingWithStatsD()
  @NextIOValidator(ValidateLocationActionArgs, ValidateLocationActionResult)
  @WithTypeCachableAsyncLocalStorage()
  async validateLocation(args: {
    offeringId: string;
    taxAddress?: TaxAddress;
    uid?: string;
    interval?: string;
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
        if (taxChangeStatus !== TaxChangeAllowedStatus.Allowed) {
          return {
            isValid: false,
            status: taxChangeStatus,
            currentCurrency,
          };
        }
      }
      if (args.interval && args.taxAddress?.countryCode) {
        const currency = this.currencyManager.getCurrencyForCountry(
          args.taxAddress.countryCode
        );
        if (currency) {
          const price =
            await this.productConfigurationManager.retrieveStripePrice(
              args.offeringId,
              args.interval as SubplatInterval
            );
          if (price && !price.currency_options?.[currency]) {
            return {
              isValid: false,
              status: TaxChangeAllowedStatus.PriceCurrencyNotAvailable,
            };
          }
        }
      }
      return {
        isValid: true,
        status: locationStatus,
      };
    } else {
      return {
        isValid: false,
        status: locationStatus,
      };
    }
  }

  @SanitizeExceptions()
  @CaptureTimingWithStatsD()
  @NextIOValidator(ServerLogActionArgs, undefined)
  @WithTypeCachableAsyncLocalStorage()
  async serverLog(args: { message: string; data?: any }) {
    this.log.log(args.message, args.data);
  }

  @SanitizeExceptions()
  @CaptureTimingWithStatsD()
  @NextIOValidator(GetUserinfoArgs, GetUserinfoResult)
  @WithTypeCachableAsyncLocalStorage()
  async getUserinfo(args: { accessToken: string; userinfoUrl: string }) {
    return await this.profileClient.getUserinfo(
      args.userinfoUrl,
      args.accessToken
    );
  }

  @SanitizeExceptions({
    allowlist: [AccountCustomerNotFoundError, CurrencyForCustomerNotFoundError],
  })
  @CaptureTimingWithStatsD()
  @NextIOValidator(
    GetStripePaymentManagementDetailsArgs,
    GetStripePaymentManagementDetailsResult
  )
  @WithTypeCachableAsyncLocalStorage()
  async getStripePaymentManagementDetails(args: { uid: string }) {
    return await this.subscriptionManagementService.getStripePaymentManagementDetails(
      args.uid
    );
  }

  @SanitizeExceptions({
    allowlist: [
      ManagePaymentMethodIntentCardDeclinedError,
      ManagePaymentMethodIntentCardExpiredError,
      ManagePaymentMethodIntentFailedGenericError,
      ManagePaymentMethodIntentGetInTouchError,
      ManagePaymentMethodIntentTryAgainError,
      ManagePaymentMethodIntentInsufficientFundsError,
      ManagePaymentMethodTaxAddressRequiredError,
    ],
  })
  @CaptureTimingWithStatsD()
  @NextIOValidator(
    UpdateStripePaymentDetailsArgs,
    UpdateStripePaymentDetailsResult
  )
  async updateStripePaymentDetails(args: {
    uid: string;
    confirmationTokenId: string;
    ipAddress: string;
  }) {
    try {
      const result =
        await this.subscriptionManagementService.updateStripePaymentDetails(
          args.uid,
          args.confirmationTokenId,
          args.ipAddress
        );
      return {
        ok: true,
        result,
        errorMessage: null,
      };
    } catch (error) {
      return {
        ok: false,
        result: null,
        errorMessage: error.message,
      };
    }
  }

  @SanitizeExceptions({
    allowlist: [ManagePaymentMethodTaxAddressRequiredError],
  })
  @CaptureTimingWithStatsD()
  @NextIOValidator(SetDefaultStripePaymentDetailsActionArgs, undefined)
  async setDefaultStripePaymentDetails(args: {
    uid: string;
    paymentMethodId: string;
    ipAddress: string;
  }) {
    return await this.subscriptionManagementService.setDefaultStripePaymentDetails(
      args.uid,
      args.paymentMethodId,
      args.ipAddress
    );
  }

  @SanitizeExceptions()
  @CaptureTimingWithStatsD()
  @NextIOValidator(
    GetCMSChurnInterventionActionArgs,
    GetCMSChurnInterventionActionResult
  )
  @WithTypeCachableAsyncLocalStorage()
  async getCMSChurnIntervention(args: {
    interval: SubplatInterval;
    churnType: 'cancel' | 'stay_subscribed';
    stripeProductId?: string;
    offeringApiIdentifier?: string;
    acceptLanguage?: string;
    selectedLanguage?: string;
  }) {
    return await this.churnInterventionService.getChurnInterventionForProduct(
      args.interval,
      args.churnType,
      args.stripeProductId,
      args.offeringApiIdentifier,
      args.acceptLanguage,
      args.selectedLanguage
    );
  }
}
