/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ServerRoute } from '@hapi/hapi';
import isA from 'joi';
import * as Sentry from '@sentry/node';
import { SeverityLevel } from '@sentry/types';
import {
  PaymentsCustomerError,
  PromotionCodeManager,
} from '@fxa/payments/customer';
import { getAccountCustomerByUid } from 'fxa-shared/db/models/auth';
import {
  AbbrevPlan,
  SubscriptionChangeEligibility,
  SubscriptionEligibilityResult,
  SubscriptionUpdateEligibility,
} from 'fxa-shared/subscriptions/types';
import * as invoiceDTO from 'fxa-shared/dto/auth/payments/invoice';
import * as couponDTO from 'fxa-shared/dto/auth/payments/coupon';
import {
  ACTIVE_SUBSCRIPTION_STATUSES,
  DeepPartial,
  filterCustomer,
  filterIntent,
  filterInvoice,
  filterSubscription,
  singlePlan,
} from 'fxa-shared/subscriptions/stripe';
import omitBy from 'lodash/omitBy';
import { Logger } from 'mozlog';
import { Stripe } from 'stripe';

import { ConfigType } from '../../../config';
import error from '../../error';
import {
  COUNTRIES_LONG_NAME_TO_SHORT_NAME_MAP,
  StripeHelper,
} from '../../payments/stripe';
import {
  stripeInvoiceToFirstInvoicePreviewDTO,
  stripeInvoicesToSubsequentInvoicePreviewsDTO,
} from '../../payments/stripe-formatter';
import { AuthLogger, AuthRequest, TaxAddress } from '../../types';
import { sendFinishSetupEmailForStubAccount } from '../subscriptions/account';
import validators from '../validators';
import { handleAuth } from './utils';
import { generateIdempotencyKey } from '../../payments/utils';
import { deleteAccountIfUnverified } from '../utils/account';
import SUBSCRIPTIONS_DOCS from '../../../docs/swagger/subscriptions-api';
import DESCRIPTIONS from '../../../docs/swagger/shared/descriptions';
import { CapabilityService } from '../../payments/capability';
import Container from 'typedi';

// List of countries for which we need to look up the province/state of the
// customer.
const addressLookupCountries = Object.values(
  COUNTRIES_LONG_NAME_TO_SHORT_NAME_MAP
);

const METRICS_CONTEXT_SCHEMA = require('../../metrics/context').schema;

/**
 * Delete any metadata keys prefixed by `capabilities:` and promotion codes
 * before sending response. We don't need to reveal those.
 * https://github.com/mozilla/fxa/issues/3273#issuecomment-552637420
 * https://github.com/mozilla/fxa/issues/12181
 */
export function sanitizePlans(plans: AbbrevPlan[]) {
  return plans.map((planIn) => {
    // Try not to mutate the original in case we cache plans in memory.
    const plan = { ...planIn };
    const isCapabilityKey = (value: string, key: string) =>
      key.startsWith('capabilities');
    const isPromotionCodes = (value: string, key: string) =>
      key.toLowerCase() === 'promotioncodes';
    const isOmittable = (value: string, key: string) =>
      isCapabilityKey(value, key) || isPromotionCodes(value, key);
    plan.plan_metadata = omitBy(plan.plan_metadata, isOmittable);
    plan.product_metadata = omitBy(plan.product_metadata, isOmittable);
    return plan;
  });
}

export class StripeHandler {
  subscriptionAccountReminders: any;
  capabilityService: CapabilityService;
  promotionCodeManager: PromotionCodeManager;

  constructor(
    // FIXME: For some reason Logger methods were not being detected in
    //        inheriting classes thus this interface join.
    protected log: AuthLogger & Logger,
    protected db: any,
    protected config: ConfigType,
    protected customs: any,
    protected push: any,
    protected mailer: any,
    protected profile: any,
    protected stripeHelper: StripeHelper
  ) {
    this.subscriptionAccountReminders =
      require('../../subscription-account-reminders')(log, config);
    this.capabilityService = Container.get(CapabilityService);
    this.promotionCodeManager = Container.get(PromotionCodeManager);
  }

  /**
   * Extracts a promotion code from the request, while verifying its
   * validity for this priceId and returns a promotionCode if valid, or
   * throws an invalidPromoCode error if not.
   */
  protected async extractPromotionCode(
    promotionCodeFromRequest: string,
    priceId: string
  ) {
    let promotionCode: Stripe.PromotionCode | undefined;

    if (promotionCodeFromRequest) {
      promotionCode = await this.stripeHelper.findValidPromoCode(
        promotionCodeFromRequest,
        priceId
      );
      if (!promotionCode) {
        throw error.invalidPromoCode(promotionCode);
      }
    }
    return promotionCode;
  }

  /**
   * Reload the customer data to reflect a change.
   */
  async customerChanged(request: AuthRequest, uid: string, email: string) {
    const [devices] = await Promise.all([
      request.app.devices,
      this.profile.deleteCache(uid),
    ]);
    await this.push.notifyProfileUpdated(uid, devices);
    this.log.notifyAttachedServices('profileDataChange', request, {
      uid,
    });
  }

  async getClients(request: AuthRequest) {
    this.log.begin('subscriptions.getClients', request);

    return this.capabilityService.getClients();
  }

  async deleteSubscription(request: AuthRequest) {
    this.log.begin('subscriptions.deleteSubscription', request);

    const { uid, email } = await handleAuth(this.db, request.auth, true);

    await this.customs.check(request, email, 'deleteSubscription');

    const subscriptionId = request.params.subscriptionId;

    await this.stripeHelper.cancelSubscriptionForCustomer(
      uid,
      email,
      subscriptionId
    );

    await this.customerChanged(request, uid, email);

    this.log.info('subscriptions.deleteSubscription.success', {
      uid,
      subscriptionId,
    });

    return { subscriptionId };
  }

  async reactivateSubscription(request: AuthRequest) {
    this.log.begin('subscriptions.reactivateSubscription', request);

    const { uid, email } = await handleAuth(this.db, request.auth, true);

    await this.customs.check(request, email, 'reactivateSubscription');

    const { subscriptionId } = request.payload as Record<string, string>;

    await this.stripeHelper.reactivateSubscriptionForCustomer(
      uid,
      email,
      subscriptionId
    );

    await this.customerChanged(request, uid, email);

    this.log.info('subscriptions.reactivateSubscription.success', {
      uid,
      subscriptionId,
    });

    return {};
  }

  async updateSubscription(request: AuthRequest) {
    this.log.begin('subscriptions.updateSubscription', request);

    const { uid, email } = await handleAuth(this.db, request.auth, true);

    await this.customs.check(request, email, 'updateSubscription');

    const { subscriptionId } = request.params;
    const { planId } = request.payload as Record<string, string>;

    const subscription = await this.stripeHelper.subscriptionForCustomer(
      uid,
      email,
      subscriptionId
    );
    if (!subscription) {
      throw error.unknownSubscription();
    }

    const currentPlan = singlePlan(subscription);
    if (!currentPlan) {
      throw error.internalValidationError(
        'updateSubscription',
        { subscription: subscription.id },
        'Subscriptions with multiple plans not supported.'
      );
    }

    const result: SubscriptionChangeEligibility =
      await this.capabilityService.getPlanEligibility(uid, planId);

    const eligibleForUpgrade =
      result.subscriptionEligibilityResult ===
      SubscriptionEligibilityResult.UPGRADE;
    const isUpgradeForCurrentPlan =
      result.eligibleSourcePlan?.plan_id === currentPlan.id;
    if (!eligibleForUpgrade || !isUpgradeForCurrentPlan) {
      throw error.invalidPlanUpdate();
    }

    // Verify the new plan currency and customer currency are compatible.
    // Stripe does not allow customers to change currency after a currency is set, which
    // occurs on initial subscription. (https://stripe.com/docs/billing/customer#payment)
    const customer = await this.stripeHelper.fetchCustomer(uid);
    const planCurrency = (await this.stripeHelper.findAbbrevPlanById(planId))
      .currency;
    if (customer && customer.currency !== planCurrency) {
      throw error.currencyCurrencyMismatch(customer.currency, planCurrency);
    }

    // Update the plan
    await this.stripeHelper.changeSubscriptionPlan(subscription, planId);

    await this.customerChanged(request, uid, email);

    return { subscriptionId };
  }

  async listPlans(request: AuthRequest) {
    this.log.begin('subscriptions.listPlans', request);
    const plans = await this.stripeHelper.allAbbrevPlans(
      request?.headers?.['accept-language']
    );
    return sanitizePlans(plans);
  }

  async getProductName(request: AuthRequest) {
    this.log.begin('subscriptions.getProductName', request);
    const { productId } = request.query as Record<string, string>;
    const plans = await this.stripeHelper.allAbbrevPlans();
    const planForProduct = plans.find((plan) => plan.product_id === productId);
    if (!planForProduct) {
      throw error.unknownSubscriptionPlan();
    }
    this.log.info('subscriptions.getProductName', {
      productId,
    });
    return { product_name: planForProduct.product_name };
  }

  async listActive(request: AuthRequest) {
    this.log.begin('subscriptions.listActive', request);
    const { uid } = await handleAuth(this.db, request.auth, true);
    const customer = await this.stripeHelper.fetchCustomer(uid, [
      'subscriptions',
    ]);
    const activeSubscriptions = new Array<{
      uid: string;
      productId: string | Stripe.Product | Stripe.DeletedProduct | null;
      subscriptionId: string;
      createdAt: number;
      cancelledAt: number | null;
    }>();

    if (customer && customer.subscriptions) {
      for (const subscription of customer.subscriptions.data) {
        const plan = singlePlan(subscription);
        if (!plan) {
          throw error.internalValidationError(
            'listActive',
            { subscription: subscription.id },
            'Subscriptions with multiple plans not supported.'
          );
        }

        const productId = plan.product;
        const { id: subscriptionId, created, canceled_at } = subscription;
        if (ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status)) {
          activeSubscriptions.push({
            uid,
            subscriptionId,
            productId,
            createdAt: created * 1000,
            cancelledAt: canceled_at ? canceled_at * 1000 : null,
          });
        }
      }
    }
    return activeSubscriptions;
  }

  /**
   * Create a customer.
   */
  async createCustomer(
    request: AuthRequest
  ): Promise<DeepPartial<Stripe.Customer>> {
    this.log.begin('subscriptions.createCustomer', request);
    const { uid, email } = await handleAuth(this.db, request.auth, true);
    await this.customs.check(request, email, 'createCustomer');

    let customer = await this.stripeHelper.fetchCustomer(uid);
    if (customer) {
      return filterCustomer(customer);
    }

    const { displayName } = request.payload as Record<string, string>;

    const taxAddress = this.buildTaxAddress(
      request.app.clientAddress,
      request.app.geo.location
    );

    const idempotencyKey = generateIdempotencyKey([uid]);
    customer = await this.stripeHelper.createPlainCustomer({
      uid,
      email,
      displayName,
      idempotencyKey,
      taxAddress,
    });
    return filterCustomer(customer);
  }

  /**
   * Retry an invoice by attaching a new payment method id for use.
   */
  async retryInvoice(request: AuthRequest) {
    this.log.begin('subscriptions.retryInvoice', request);
    const { uid, email } = await handleAuth(this.db, request.auth, true);
    await this.customs.check(request, email, 'retryInvoice');

    const { stripeCustomerId } = (await getAccountCustomerByUid(uid)) || {};
    if (!stripeCustomerId) {
      throw error.unknownCustomer(uid);
    }

    const { invoiceId, paymentMethodId, idempotencyKey } =
      request.payload as Record<string, string>;
    const retryIdempotencyKey = `${idempotencyKey}-retryInvoice`;
    const invoice = await this.stripeHelper.retryInvoiceWithPaymentId(
      stripeCustomerId,
      invoiceId,
      paymentMethodId,
      retryIdempotencyKey
    );

    await this.customerChanged(request, uid, email);

    return filterInvoice(invoice);
  }

  /**
   * Preview an invoice for a new plan.
   */
  async previewInvoice(
    request: AuthRequest
  ): Promise<invoiceDTO.firstInvoicePreviewSchema> {
    this.log.begin('subscriptions.previewInvoice', request);

    const { promotionCode, priceId } = request.payload as Record<
      string,
      string
    >;

    let customer: Stripe.Customer | void = undefined;
    if (request.auth.credentials) {
      const { uid, email } = await handleAuth(this.db, request.auth, true);
      await this.customs.check(request, email, 'previewInvoice');
      try {
        customer = await this.stripeHelper.fetchCustomer(uid, [
          'subscriptions',
          'tax',
        ]);
      } catch (e: any) {
        this.log.error('previewInvoice.fetchCustomer', { error: e, uid });
      }
    } else {
      await this.customs.checkIpOnly(request, 'previewInvoice');
    }

    const taxAddress = this.buildTaxAddress(
      request.app.clientAddress,
      request.app.geo.location
    );

    try {
      let isUpgrade = false,
        sourcePlan;
      if (customer) {
        const result = await this.capabilityService.getPlanEligibility(
          customer.metadata.userid,
          priceId
        );

        isUpgrade =
          result.subscriptionEligibilityResult ===
          SubscriptionUpdateEligibility.UPGRADE;
        sourcePlan = result.eligibleSourcePlan;
      }

      const previewInvoice = await this.stripeHelper.previewInvoice({
        customer: customer || undefined,
        promotionCode,
        priceId,
        taxAddress,
        isUpgrade,
        sourcePlan,
      });

      return stripeInvoiceToFirstInvoicePreviewDTO(previewInvoice);
    } catch (err: any) {
      //TODO - this is part of FXA-7664, we can remove this one we uncover the underlying error
      Sentry.withScope((scope) => {
        scope.setContext('previewInvoice', {
          error: err,
          msg: err.message,
        });
        Sentry.captureMessage(
          `Invoice Preview Error.`,
          'error' as SeverityLevel
        );
      });
      this.log.error('subscriptions.previewInvoice', err);

      if (err.type === 'StripeInvalidRequestError') {
        throw error.invalidInvoicePreviewRequest(
          err,
          err.message,
          priceId,
          customer?.id
        );
      } else {
        throw err;
      }
    }
  }

  /**
   * Preview invoices for an array of subscriptionIds
   */
  async subsequentInvoicePreviews(
    request: AuthRequest
  ): Promise<invoiceDTO.subsequentInvoicePreviewsSchema> {
    this.log.begin('subscriptions.subsequentInvoicePreview', request);
    const { uid, email } = await handleAuth(this.db, request.auth, true);
    await this.customs.check(request, email, 'subsequentInvoicePreviews');

    const customer = await this.stripeHelper.fetchCustomer(uid, [
      'subscriptions',
    ]);

    if (!customer || !customer.subscriptions?.data.length) {
      return [];
    }

    const subsequentInvoicePreviews = await Promise.all(
      customer.subscriptions.data.map((sub) => {
        return this.stripeHelper.previewInvoiceBySubscriptionId({
          subscriptionId: sub.id,
          includeCanceled: !!sub.canceled_at,
        });
      })
    );

    return stripeInvoicesToSubsequentInvoicePreviewsDTO(
      subsequentInvoicePreviews
    );
  }

  async retrieveCouponDetails(
    request: AuthRequest
  ): Promise<couponDTO.couponDetailsSchema> {
    this.log.begin('subscriptions.retrieveCouponDetails', request);

    const { promotionCode, priceId } = request.payload as Record<
      string,
      string
    >;

    if (request.auth.credentials) {
      const { email } = await handleAuth(this.db, request.auth, true);
      await this.customs.check(request, email, 'retrieveCouponDetails');
    } else {
      await this.customs.checkIpOnly(request, 'retrieveCouponDetails');
    }

    const taxAddress = this.buildTaxAddress(
      request.app.clientAddress,
      request.app.geo.location
    );

    const couponDetails = this.stripeHelper.retrieveCouponDetails({
      priceId,
      promotionCode,
      taxAddress,
    });

    return couponDetails;
  }

  /**
   * Updates customer subscription with promotion code
   */
  async applyPromotionCodeToSubscription(request: AuthRequest) {
    this.log.begin('subscriptions.applyPromotionCodeToSubscription', request);

    const { uid, email } = await handleAuth(this.db, request.auth, true);
    await this.customs.check(
      request,
      email,
      'applyPromotionCodeToSubscription'
    );

    const customer = await this.stripeHelper.fetchCustomer(uid);
    if (!customer) {
      throw error.unknownCustomer(uid);
    }

    const { promotionId, subscriptionId } = request.payload as Record<
      string,
      string
    >;

    try {
      const updatedSubscription =
        await this.promotionCodeManager.applyPromoCodeToSubscription(
          customer.id,
          subscriptionId,
          promotionId
        );
      return updatedSubscription;
    } catch (err) {
      this.log.error('subscriptions.applyPromotionCodeToSubscription', {
        err,
        uid,
      });

      if (err instanceof PaymentsCustomerError) {
        throw error.subscriptionPromotionCodeNotApplied(err, err.message);
      } else {
        throw err;
      }
    }
  }

  /**
   * Create a subscription for a user.
   */
  async createSubscriptionWithPMI(request: AuthRequest): Promise<{
    sourceCountry: string | null;
    subscription: DeepPartial<Stripe.Subscription>;
  }> {
    this.log.begin('subscriptions.createSubscriptionWithPMI', request);
    const { uid, email, account } = await handleAuth(
      this.db,
      request.auth,
      true
    );
    await this.customs.check(request, email, 'createSubscriptionWithPMI');

    try {
      const customer = await this.stripeHelper.fetchCustomer(uid, ['tax']);
      if (!customer) {
        throw error.unknownCustomer(uid);
      }

      const automaticTax =
        this.stripeHelper.isCustomerStripeTaxEligible(customer);

      const {
        priceId,
        paymentMethodId,
        promotionCode: promotionCodeFromRequest,
        metricsContext,
      } = request.payload as Record<string, string>;

      // Make sure to clean up any subscriptions that may be hanging with no payment
      const existingSubscription =
        this.stripeHelper.findCustomerSubscriptionByPlanId(customer, priceId);
      if (existingSubscription?.status === 'incomplete') {
        await this.stripeHelper.cancelSubscription(existingSubscription.id);
      }

      // Validate that the user doesn't have conflicting subscriptions, for instance via IAP
      const { subscriptionEligibilityResult } =
        await this.capabilityService.getPlanEligibility(
          customer.metadata.userid,
          priceId
        );
      if (
        subscriptionEligibilityResult !== SubscriptionEligibilityResult.CREATE
      ) {
        throw error.userAlreadySubscribedToProduct();
      }

      const promotionCode: Stripe.PromotionCode | undefined =
        await this.extractPromotionCode(promotionCodeFromRequest, priceId);

      let paymentMethod: Stripe.PaymentMethod | undefined;

      // Skip the payment source check if there's no payment method id.
      if (paymentMethodId) {
        const planCurrency = (
          await this.stripeHelper.findAbbrevPlanById(priceId)
        ).currency;
        paymentMethod = await this.stripeHelper.getPaymentMethod(
          paymentMethodId
        );
        const paymentMethodCountry = paymentMethod.card?.country;
        if (
          !this.stripeHelper.currencyHelper.isCurrencyCompatibleWithCountry(
            planCurrency,
            paymentMethodCountry
          )
        ) {
          throw error.currencyCountryMismatch(
            planCurrency,
            paymentMethodCountry
          );
        }
        if (!this.stripeHelper.customerTaxId(customer)) {
          await this.stripeHelper.addTaxIdToCustomer(customer, planCurrency);
        }
      }

      const subscription: any =
        await this.stripeHelper.createSubscriptionWithPMI({
          customerId: customer.id,
          priceId,
          paymentMethodId,
          promotionCode: promotionCode,
          automaticTax,
        });

      if (!automaticTax) {
        this.log.warn(
          'subscriptions.createSubscriptionWithPMI.automatic_tax_failed',
          {
            uid,
            automatic_tax: customer.tax?.automatic_tax,
          }
        );
      }

      const sourceCountry =
        this.stripeHelper.extractSourceCountryFromSubscription(subscription);

      await this.customerChanged(request, uid, email);

      this.log.info('subscriptions.createSubscriptionWithPMI.success', {
        uid,
        subscriptionId: subscription.id,
      });

      await sendFinishSetupEmailForStubAccount({
        uid,
        account,
        subscription,
        stripeHelper: this.stripeHelper,
        mailer: this.mailer,
        subscriptionAccountReminders: this.subscriptionAccountReminders,
        metricsContext,
      });

      return {
        sourceCountry,
        subscription: filterSubscription(subscription),
      };
    } catch (err) {
      try {
        if (account.verifierSetAt <= 0) {
          await deleteAccountIfUnverified(
            this.db,
            this.stripeHelper,
            this.log,
            request,
            email
          );
        }
      } catch (deleteAccountError) {
        if (
          deleteAccountError.errno !== error.ERRNO.ACCOUNT_EXISTS &&
          deleteAccountError.errno !==
            error.ERRNO.VERIFIED_SECONDARY_EMAIL_EXISTS
        ) {
          throw deleteAccountError;
        }
      }
      throw err;
    }
  }

  /**
   * Create a new SetupIntent that will be attached to the current customer
   * after it succeeds.
   */
  async createSetupIntent(request: AuthRequest) {
    this.log.begin('subscriptions.createSetupIntent', request);
    const { uid, email } = await handleAuth(this.db, request.auth, true);
    await this.customs.check(request, email, 'createSetupIntent');

    const { stripeCustomerId } = (await getAccountCustomerByUid(uid)) || {};
    if (!stripeCustomerId) {
      throw error.unknownCustomer(uid);
    }
    const setupIntent = await this.stripeHelper.createSetupIntent(
      stripeCustomerId
    );
    return filterIntent(setupIntent);
  }

  /**
   * Updates what payment method is used by default on new invoices for the
   * customer.
   */
  async updateDefaultPaymentMethod(request: AuthRequest) {
    this.log.begin('subscriptions.updateDefaultPaymentMethod', request);
    const { uid, email } = await handleAuth(this.db, request.auth, true);
    await this.customs.check(request, email, 'updateDefaultPaymentMethod');

    let customer = await this.stripeHelper.fetchCustomer(uid);
    if (!customer) {
      throw error.unknownCustomer(uid);
    }

    const { paymentMethodId } = request.payload as Record<string, string>;

    const paymentMethod = await this.stripeHelper.getPaymentMethod(
      paymentMethodId
    );
    const paymentMethodCountry = paymentMethod.card?.country;
    if (
      !this.stripeHelper.currencyHelper.isCurrencyCompatibleWithCountry(
        customer.currency,
        paymentMethodCountry
      )
    ) {
      throw error.currencyCountryMismatch(
        customer.currency,
        paymentMethodCountry
      );
    }

    customer = await this.stripeHelper.updateDefaultPaymentMethod(
      customer.id,
      paymentMethodId
    );

    if (
      paymentMethodCountry &&
      addressLookupCountries.includes(paymentMethodCountry)
    ) {
      if (paymentMethod?.billing_details?.address?.postal_code) {
        this.stripeHelper.setCustomerLocation({
          customerId: customer.id,
          postalCode: paymentMethod.billing_details.address.postal_code,
          country: paymentMethodCountry,
        });
      } else {
        Sentry.withScope((scope) => {
          scope.setContext('updateDefaultPaymentMethod', {
            customerId: customer?.id,
            paymentMethodId: paymentMethod?.id,
          });
          Sentry.captureMessage(
            `Cannot find a postal code or country for customer.`,
            'error' as SeverityLevel
          );
        });
      }
    }

    await this.stripeHelper.removeSources(customer.id);
    return filterCustomer(customer);
  }

  /**
   * Detach a payment method from a customer _without_ any subscriptions.
   * This prevents a potentially problematic card for being used for the
   * customer's _first_ subscription.
   */
  async detachFailedPaymentMethod(request: AuthRequest) {
    this.log.begin('subscriptions.detachFailedPaymentMethod', request);
    const { uid, email } = await handleAuth(this.db, request.auth, true);
    await this.customs.check(request, email, 'detachFailedPaymentMethod');

    const customer = await this.stripeHelper.fetchCustomer(uid, [
      'subscriptions',
    ]);
    if (!customer) {
      throw error.unknownCustomer(uid);
    }

    const { paymentMethodId } = request.payload as Record<string, string>;

    // We are handling a very specific scenario here, one in which the customer
    // has not been ever able to successfully subscribe with the attempted
    // payment method.
    if (
      customer.subscriptions?.data.length &&
      customer.subscriptions.data.every((s) => s.status === 'incomplete')
    ) {
      return await this.stripeHelper.detachPaymentMethod(paymentMethodId);
    }

    // Do nothing.  There's no course correction action to take.
    return { id: paymentMethodId };
  }

  /**
   * Get a list of subscriptions for support agents
   */
  async getSubscriptionsForSupport(request: AuthRequest) {
    this.log.begin('subscriptions.getSubscriptionsForSupport', request);
    const { uid } = request.query as Record<string, string>;

    // We know that a user has to be a customer to create a support ticket
    const customer = await this.stripeHelper.fetchCustomer(uid, [
      'subscriptions',
    ]);
    if (!customer || !customer.subscriptions) {
      throw error.internalValidationError(
        'getSubscriptionsForSupport',
        {
          customerId: customer?.id,
          uid,
        },
        'No customer object or no subscriptions object present for customer.'
      );
    }
    const response = await this.stripeHelper.formatSubscriptionsForSupport(
      customer.subscriptions
    );

    return response;
  }

  /**
   * Builds a TaxAddress from request geolocation or customer
   * A tax address is only considered complete if it has both countryCode and postalCode
   * @param ipAddress Used for logging purposes
   * @param location Used to determine tax location if customer does not have/not provided
   * @param customer Used to determine tax location first if shipping address present
   */
  buildTaxAddress(
    ipAddress: string,
    location?: {
      countryCode?: string;
      postalCode?: string;
    }
  ): TaxAddress | undefined {
    if (location?.countryCode && location?.postalCode) {
      return {
        countryCode: location.countryCode,
        postalCode: location.postalCode,
      };
    }

    this.log.warn('stripe.buildTaxAddress', {
      ipAddress,
      location,
    });

    return;
  }
}

export const stripeRoutes = (
  log: AuthLogger,
  db: any,
  config: ConfigType,
  customs: any,
  push: any,
  mailer: any,
  profile: any,
  stripeHelper: StripeHelper
): ServerRoute[] => {
  const stripeHandler = new StripeHandler(
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
  return [
    {
      method: 'GET',
      path: '/oauth/subscriptions/clients',
      options: {
        ...SUBSCRIPTIONS_DOCS.OAUTH_SUBSCRIPTIONS_CLIENTS_GET,
        auth: {
          payload: false,
          strategy: 'subscriptionsSecret',
        },
        response: {
          schema: isA.array().items(
            isA.object().keys({
              clientId: isA.string().description(DESCRIPTIONS.clientId),
              capabilities: isA
                .array()
                .items(isA.string())
                .description(DESCRIPTIONS.capabilities),
            })
          ) as any,
        },
      },
      handler: (request: AuthRequest) => stripeHandler.getClients(request),
    },
    {
      method: 'GET',
      path: '/oauth/subscriptions/plans',
      options: {
        ...SUBSCRIPTIONS_DOCS.OAUTH_SUBSCRIPTIONS_PLANS_GET,
        response: {
          schema: isA
            .array()
            .items(
              validators.subscriptionsPlanWithProductConfigValidator,
              validators.subscriptionsPlanWithMetaDataValidator
            ) as any,
        },
      },
      handler: (request: AuthRequest) => stripeHandler.listPlans(request),
    },
    {
      method: 'GET',
      path: '/oauth/subscriptions/active',
      options: {
        ...SUBSCRIPTIONS_DOCS.OAUTH_SUBSCRIPTIONS_ACTIVE_GET,
        auth: {
          payload: false,
          strategy: 'oauthToken',
        },
        response: {
          schema: isA
            .array()
            .items(validators.activeSubscriptionValidator) as any,
        },
      },
      handler: (request: AuthRequest) => stripeHandler.listActive(request),
    },
    {
      method: 'POST',
      path: '/oauth/subscriptions/customer',
      options: {
        ...SUBSCRIPTIONS_DOCS.OAUTH_SUBSCRIPTIONS_CUSTOMER_POST,
        auth: {
          payload: false,
          strategy: 'oauthToken',
        },
        response: {
          schema: validators.subscriptionsStripeCustomerValidator as any,
        },
        validate: {
          payload: {
            displayName: isA.string().optional(),
          },
        },
      },
      handler: (request: AuthRequest) => stripeHandler.createCustomer(request),
    },
    {
      method: 'POST',
      // Avoid conflict with existing, this can be updated to remove `/new` at the
      // same time the old routes are removed when the client is updated.
      path: '/oauth/subscriptions/active/new',
      options: {
        ...SUBSCRIPTIONS_DOCS.OAUTH_SUBSCRIPTIONS_ACTIVE_NEW_POST,
        auth: {
          payload: false,
          strategy: 'oauthToken',
        },
        response: {
          schema: isA.object().keys({
            subscription: validators.subscriptionsStripeSubscriptionValidator,
            sourceCountry: validators.subscriptionPaymentCountryCode.required(),
          }) as any,
        },
        validate: {
          payload: {
            priceId: isA.string().required().description(DESCRIPTIONS.priceId),
            paymentMethodId: validators.stripePaymentMethodId
              .optional()
              .description(DESCRIPTIONS.paymentMethodId),
            promotionCode: isA
              .string()
              .optional()
              .description(DESCRIPTIONS.promotionCode),
            metricsContext: METRICS_CONTEXT_SCHEMA,
          },
        },
      },
      handler: (request: AuthRequest) =>
        stripeHandler.createSubscriptionWithPMI(request),
    },
    {
      method: 'POST',
      path: '/oauth/subscriptions/invoice/retry',
      options: {
        ...SUBSCRIPTIONS_DOCS.OAUTH_SUBSCRIPTIONS_INVOICE_RETRY_POST,
        auth: {
          payload: false,
          strategy: 'oauthToken',
        },
        response: {
          schema: validators.subscriptionsStripeInvoiceValidator as any,
        },
        validate: {
          payload: {
            invoiceId: isA
              .string()
              .required()
              .description(DESCRIPTIONS.invoiceId),
            paymentMethodId: validators.stripePaymentMethodId
              .required()
              .description(DESCRIPTIONS.paymentMethodId),
            idempotencyKey: isA
              .string()
              .required()
              .description(DESCRIPTIONS.idempotencyKey),
          },
        },
      },
      handler: (request: AuthRequest) => stripeHandler.retryInvoice(request),
    },
    {
      method: 'POST',
      path: '/oauth/subscriptions/invoice/preview',
      options: {
        ...SUBSCRIPTIONS_DOCS.OAUTH_SUBSCRIPTIONS_INVOICE_PREVIEW_POST,
        auth: {
          payload: false,
          strategy: 'oauthToken',
          mode: 'try',
        },
        response: {
          schema: invoiceDTO.firstInvoicePreviewSchema as any,
        },
        validate: {
          payload: {
            priceId: validators.subscriptionsPlanId
              .required()
              .description(DESCRIPTIONS.priceId),
            promotionCode: isA
              .string()
              .optional()
              .description(DESCRIPTIONS.promotionCode),
          },
        },
      },
      handler: (request: AuthRequest) => stripeHandler.previewInvoice(request),
    },
    {
      method: 'GET',
      path: '/oauth/subscriptions/invoice/preview-subsequent',
      options: {
        ...SUBSCRIPTIONS_DOCS.OAUTH_SUBSCRIPTIONS_INVOICE_PREVIEW_SUBSEQUENT_GET,
        auth: {
          payload: false,
          strategy: 'oauthToken',
        },
        response: {
          schema: invoiceDTO.subsequentInvoicePreviewsSchema as any,
        },
      },
      handler: (request: AuthRequest) =>
        stripeHandler.subsequentInvoicePreviews(request),
    },
    {
      method: 'POST',
      path: '/oauth/subscriptions/coupon',
      options: {
        ...SUBSCRIPTIONS_DOCS.OAUTH_SUBSCRIPTIONS_COUPON_POST,
        auth: {
          payload: false,
          strategy: 'oauthToken',
          mode: 'try',
        },
        response: {
          schema: couponDTO.couponDetailsSchema as any,
        },
        validate: {
          payload: {
            priceId: validators.subscriptionsPlanId
              .required()
              .description(DESCRIPTIONS.priceId),
            promotionCode: isA
              .string()
              .required()
              .description(DESCRIPTIONS.promotionCode),
          },
        },
      },
      handler: (request: AuthRequest) =>
        stripeHandler.retrieveCouponDetails(request),
    },
    {
      method: 'PUT',
      path: '/oauth/subscriptions/coupon/apply',
      options: {
        ...SUBSCRIPTIONS_DOCS.OAUTH_SUBSCRIPTIONS_COUPON_APPLY_PUT,
        auth: {
          payload: false,
          strategy: 'oauthToken',
        },
        validate: {
          payload: {
            promotionId: isA
              .string()
              .required()
              .description(DESCRIPTIONS.promotionId),
            subscriptionId: validators.subscriptionsSubscriptionId
              .required()
              .description(DESCRIPTIONS.subscriptionId),
          },
        },
      },
      handler: (request: AuthRequest) =>
        stripeHandler.applyPromotionCodeToSubscription(request),
    },
    {
      method: 'POST',
      path: '/oauth/subscriptions/setupintent/create',
      options: {
        ...SUBSCRIPTIONS_DOCS.OAUTH_SUBSCRIPTIONS_SETUPINTENT_CREATE_POST,
        auth: {
          payload: false,
          strategy: 'oauthToken',
        },
        response: {
          schema: validators.subscriptionsStripeIntentValidator as any,
        },
      },
      handler: (request: AuthRequest) =>
        stripeHandler.createSetupIntent(request),
    },
    {
      method: 'POST',
      path: '/oauth/subscriptions/paymentmethod/default',
      options: {
        ...SUBSCRIPTIONS_DOCS.OAUTH_SUBSCRIPTIONS_PAYMENTMETHOD_DEFAULT_POST,
        auth: {
          payload: false,
          strategy: 'oauthToken',
        },
        response: {
          schema: validators.subscriptionsStripeCustomerValidator as any,
        },
        validate: {
          payload: {
            paymentMethodId: validators.stripePaymentMethodId
              .required()
              .description(DESCRIPTIONS.paymentMethodId),
          },
        },
      },
      handler: (request: AuthRequest) =>
        stripeHandler.updateDefaultPaymentMethod(request),
    },
    {
      method: 'POST',
      path: '/oauth/subscriptions/paymentmethod/failed/detach',
      options: {
        ...SUBSCRIPTIONS_DOCS.OAUTH_SUBSCRIPTIONS_PAYMENTMETHOD_FAILED_DETACH_POST,
        auth: {
          payload: false,
          strategy: 'oauthToken',
        },
        response: {
          schema: isA
            .object({
              id: validators.stripePaymentMethodId
                .required()
                .description(DESCRIPTIONS.paymentMethodId),
            })
            .unknown(true) as any,
        },
        validate: {
          payload: {
            paymentMethodId: validators.stripePaymentMethodId
              .required()
              .description(DESCRIPTIONS.paymentMethodId),
          },
        },
      },
      handler: (request: AuthRequest) =>
        stripeHandler.detachFailedPaymentMethod(request),
    },
    {
      method: 'GET',
      path: '/oauth/subscriptions/productname',
      options: {
        ...SUBSCRIPTIONS_DOCS.OAUTH_SUBSCRIPTIONS_PRODUCTNAME_GET,
        response: {
          schema: isA.object({
            product_name: isA
              .string()
              .required()
              .description(DESCRIPTIONS.productName),
          }) as any,
        },
        validate: {
          query: {
            productId: isA
              .string()
              .required()
              .description(DESCRIPTIONS.productId),
          },
        },
      },
      handler: (request: AuthRequest) => stripeHandler.getProductName(request),
    },
    {
      method: 'PUT',
      path: '/oauth/subscriptions/active/{subscriptionId}',
      options: {
        ...SUBSCRIPTIONS_DOCS.OAUTH_SUBSCRIPTIONS_ACTIVE_SUBSCRIPTIONID_PUT,
        auth: {
          payload: false,
          strategy: 'oauthToken',
        },
        response: {
          schema: isA.object().keys({
            subscriptionId: isA.string(),
          }) as any,
        },
        validate: {
          params: {
            subscriptionId: validators.subscriptionsSubscriptionId
              .required()
              .description(DESCRIPTIONS.subscriptionId),
          },
          payload: {
            planId: validators.subscriptionsPlanId
              .required()
              .description(DESCRIPTIONS.planId),
          },
        },
      },
      handler: (request: AuthRequest) =>
        stripeHandler.updateSubscription(request),
    },
    {
      method: 'DELETE',
      path: '/oauth/subscriptions/active/{subscriptionId}',
      options: {
        ...SUBSCRIPTIONS_DOCS.OAUTH_SUBSCRIPTIONS_ACTIVE_SUBSCRIPTIONID_DELETE,
        auth: {
          payload: false,
          strategy: 'oauthToken',
        },
        validate: {
          params: {
            subscriptionId: validators.subscriptionsSubscriptionId
              .required()
              .description(DESCRIPTIONS.subscriptionId),
          },
        },
      },
      handler: (request: AuthRequest) =>
        stripeHandler.deleteSubscription(request),
    },
    {
      method: 'POST',
      path: '/oauth/subscriptions/reactivate',
      options: {
        ...SUBSCRIPTIONS_DOCS.OAUTH_SUBSCRIPTIONS_REACTIVATE_POST,
        auth: {
          payload: false,
          strategy: 'oauthToken',
        },
        validate: {
          payload: {
            subscriptionId: validators.subscriptionsSubscriptionId
              .required()
              .description(DESCRIPTIONS.subscriptionId),
          },
        },
      },
      handler: (request: AuthRequest) =>
        stripeHandler.reactivateSubscription(request),
    },
  ];
};
