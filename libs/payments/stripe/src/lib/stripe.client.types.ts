/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Stripe } from 'stripe';

/**
 * Replaces types with expanded/unexpanded variants given the base Stripe type passed in.
 */
type NegotiateExpanded<
  ExpandedProperties extends keyof StripeObj | never,
  StripeObj,
  UnexpandedProperties extends keyof StripeObj,
> = {
  // For specified unexpanded properties
  [key in keyof Pick<
    StripeObj,
    UnexpandedProperties
  >]: StripeObj[key] extends Array<any> // Stripe types can be in the form of Array<Stripe.XYZ | string | null>
    ? // Extract and return type Array<string | null> out of Array<Stripe.XYZ | string | null>
      Array<Extract<StripeObj[key][0], string | null | undefined>>
    : // Stripe types can be in the form of (Array<Stripe.XYZ | string | null> | null)
      StripeObj[key] extends Array<any> | null
      ? // Extract and return type (Array<string | null> | null) out of (Array<Stripe.XYZ | string | null> | null)
        Array<
          Extract<NonNullable<StripeObj[key]>[0], string | null | undefined>
        > | null
      : // Extract and return type (string | null) out of (Stripe.XYZ | string | null)
        Extract<StripeObj[key], string | null | undefined>;
} & {
  // For specified unexpanded properties
  [key in keyof Pick<
    StripeObj,
    ExpandedProperties
  >]-?: StripeObj[key] extends Array<any> // Stripe types can be in the form of Array<Stripe.XYZ | string | null>
    ? // Extract and return type Array<Stripe.XYZ | null> out of Array<Stripe.XYZ | string | null>
      Array<Exclude<StripeObj[key][0], string>>
    : // Stripe types can be in the form of (Array<Stripe.XYZ | string | null> | null)
      StripeObj[key] extends Array<any> | null
      ? // Extract and return type (Array<Stripe.XYZ | null> | null) out of (Array<Stripe.XYZ | string | null> | null)
        Array<Exclude<NonNullable<StripeObj[key]>[0], string>> | null
      : // Extract and return type (Stripe.XYZ | null) out of (Stripe.XYZ | string | null)
        Exclude<StripeObj[key], string>;
} & {
  // All other unspecified properties return their original typing
  [key in keyof Omit<
    StripeObj,
    UnexpandedProperties | ExpandedProperties
  >]: StripeObj[key];
};

/**
 * Replaces some properties nested inside of an object, overriding anything in the first argument with values from the second, if provided.
 */
type DeepOverride<BaseType, OverrideMap extends Partial<BaseType>> = {
  // Use types from OverrideMap where present
  [key in keyof OverrideMap]: OverrideMap[key];
} & {
  // Use types from BaseType only when not present in OverrideMap
  [key in keyof Omit<BaseType, keyof OverrideMap>]: BaseType[key];
};

/**
 * Stripe.Customer with expanded fields removed except:
 *   - tax is always expanded
 */
export type StripeCustomer = NegotiateExpanded<
  'tax',
  DeepOverride<
    Stripe.Customer,
    {
      discount?: StripeDiscount | null;
      invoice_settings: StripeCustomerInvoiceSettings;
    }
  >,
  | 'cash_balance'
  | 'default_source'
  | 'invoice_credit_balance'
  | 'sources'
  | 'subscriptions'
  | 'tax_ids'
  | 'test_clock'
>;

export type StripeCustomerSession = NegotiateExpanded<
  never,
  Stripe.CustomerSession,
  'customer'
>;

export type StripeCustomerInvoiceSettings = NegotiateExpanded<
  never,
  Stripe.Customer.InvoiceSettings,
  'default_payment_method'
>;

/**
 * Stripe.DeletedCustomer with expanded fields removed
 */
export type StripeDeletedCustomer = Stripe.DeletedCustomer;

/**
 * Stripe.Discount with expanded fields removed
 */
export type StripeDiscount = NegotiateExpanded<
  never,
  DeepOverride<
    Stripe.Discount,
    {
      source: DeepOverride<Stripe.Discount.Source, { coupon: StripeCoupon }>;
    }
  >,
  'customer' | 'promotion_code'
>;

/**
 * Stripe.StripeTaxRate with expanded fields removed
 */
export type StripeTaxRate = Stripe.TaxRate;

/**
 * Stripe.InvoiceLineItem.Tax with tax_rate_details.tax_rate expanded.
 */
export type StripeInvoiceLineItemTax = Omit<
  Stripe.InvoiceLineItem.Tax,
  'tax_rate_details'
> & {
  tax_rate_details:
    | (Omit<
        NonNullable<Stripe.InvoiceLineItem.Tax['tax_rate_details']>,
        'tax_rate'
      > & { tax_rate: StripeTaxRate })
    | null;
};

/**
 * Stripe.InvoiceLineItem.Pricing with expanded fields removed
 */
export type StripeInvoiceLineItemPricing = DeepOverride<
  Stripe.InvoiceLineItem.Pricing,
  {
    price_details?: NegotiateExpanded<
      never,
      Stripe.InvoiceLineItem.Pricing.PriceDetails,
      'price'
    >;
  }
>;

/**
 * Stripe.InvoiceLineItem with expanded fields removed
 */
export type StripeInvoiceLineItem = Omit<
  NegotiateExpanded<
    never,
    DeepOverride<
      Stripe.InvoiceLineItem,
      {
        discount_amounts: Array<
          NegotiateExpanded<
            never,
            Stripe.InvoiceLineItem.DiscountAmount,
            'discount'
          >
        > | null;
        pricing: StripeInvoiceLineItemPricing | null;
      }
    >,
    'discounts' | 'subscription'
  >,
  'taxes'
> & {
  taxes: Array<StripeInvoiceLineItemTax> | null;
};

/**
 * Stripe.Event with expanded fields removed
 */
export type StripeEvent = NegotiateExpanded<never, Stripe.Event, never>;

/**
 * Stripe.Invoice.Parent with the subscription reference left unexpanded
 */
export type StripeInvoiceParent = DeepOverride<
  Stripe.Invoice.Parent,
  {
    subscription_details: NegotiateExpanded<
      never,
      Stripe.Invoice.Parent.SubscriptionDetails,
      'subscription'
    > | null;
  }
>;

/**
 * Stripe.InvoicePayment with the payment references left unexpanded
 */
export type StripeInvoicePayment = DeepOverride<
  Stripe.InvoicePayment,
  {
    payment: NegotiateExpanded<
      never,
      Stripe.InvoicePayment.Payment,
      'charge' | 'payment_intent' | 'payment_record'
    >;
  }
>;

/**
 * Stripe.Invoice with expanded fields removed
 */
export type StripeInvoice = Omit<
  NegotiateExpanded<
    never,
    DeepOverride<
      Stripe.Invoice,
      {
        discounts: Array<StripeDiscount>;
        parent: StripeInvoiceParent | null;
        payments: Stripe.ApiList<StripeInvoicePayment>;
      }
    >,
    | 'customer'
    | 'account_tax_ids'
    | 'application'
    | 'default_payment_method'
    | 'default_source'
    | 'latest_revision'
    | 'on_behalf_of'
    | 'test_clock'
  >,
  'lines' | 'total_taxes'
> & {
  lines: Stripe.ApiList<StripeInvoiceLineItem>;
  total_taxes: Array<StripeInvoiceLineItemTax> | null;
};

/**
 * Stripe.PaymentIntent with expanded fields removed
 */
export type StripePaymentIntent = NegotiateExpanded<
  never,
  Stripe.PaymentIntent,
  | 'application'
  | 'customer'
  | 'latest_charge'
  | 'on_behalf_of'
  | 'payment_method'
  | 'review'
>;

/**
 * The Create Preview Invoice API returns a Stripe.Invoice; preview invoices
 * share the same shape as a finalized invoice.
 */
export type StripeUpcomingInvoice = StripeInvoice;

export type StripeSubscriptionItem = NegotiateExpanded<
  never,
  DeepOverride<
    Stripe.SubscriptionItem,
    { plan: StripePlan; price: StripePrice }
  >,
  never
>;

/**
 * Stripe.Subscription with expanded fields removed
 */
export type StripeSubscription = NegotiateExpanded<
  never,
  DeepOverride<
    Stripe.Subscription,
    {
      discounts: Array<StripeDiscount>;
      items: StripeApiList<StripeSubscriptionItem>;
    }
  >,
  | 'customer'
  | 'default_payment_method'
  | 'latest_invoice'
  | 'pending_setup_intent'
  | 'application'
  | 'default_source'
  | 'on_behalf_of'
  | 'schedule'
  | 'test_clock'
>;

/**
 * Stripe.Plan with expanded fields removed
 */
export type StripePlan = NegotiateExpanded<
  never,
  Stripe.Plan,
  'product' | 'tiers'
>;

/**
 * Stripe.Price with expanded fields removed
 */
export type StripePrice = NegotiateExpanded<
  'currency_options',
  Stripe.Price,
  'product' | 'tiers'
>;

/**
 * Stripe.Price with expanded fields removed
 */
export type StripeProduct = NegotiateExpanded<
  never,
  Stripe.Product,
  'default_price' | 'tax_code'
>;

/**
 * Stripe.PromotionCode with expanded fields removed
 */
export type StripePromotionCode = NegotiateExpanded<
  never,
  DeepOverride<
    Stripe.PromotionCode,
    {
      promotion: DeepOverride<
        Stripe.PromotionCode.Promotion,
        { coupon: StripeCoupon }
      >;
    }
  >,
  'customer'
>;

/**
 * Stripe.Coupon with expanded fields removed
 */
export type StripeCoupon = NegotiateExpanded<
  never,
  Stripe.Coupon,
  'applies_to' | 'currency_options'
>;

/**
 * Stripe.CreditNote with expanded fields removed
 */
export type StripeCreditNote = NegotiateExpanded<
  never,
  DeepOverride<
    Stripe.CreditNote,
    {
      lines: Stripe.ApiList<StripeCreditNoteLineItem>;
    }
  >,
  'invoice' | 'customer' | 'customer_balance_transaction'
>;

/**
 * Stripe.CreditNoteLineItem with expanded fields removed
 */
export type StripeCreditNoteLineItem = NegotiateExpanded<
  never,
  DeepOverride<
    Stripe.CreditNoteLineItem,
    {
      discount_amounts: Array<
        NegotiateExpanded<
          never,
          Stripe.CreditNoteLineItem.DiscountAmount,
          'discount'
        >
      >;
    }
  >,
  never
>;

/**
 * Stripe.Card with expanded fields removed
 */
export type StripeCard = NegotiateExpanded<
  never,
  Stripe.Card,
  'customer' | 'account'
>;

export type StripePaymentMethod = NegotiateExpanded<
  never,
  Stripe.PaymentMethod,
  'customer'
>;

export type StripeWalletType = 'apple_pay' | 'google_pay';

/**
 * Stripe.PaymentIntent with expanded fields removed
 */
export type StripeSetupIntent = NegotiateExpanded<
  never,
  Stripe.SetupIntent,
  | 'application'
  | 'customer'
  | 'latest_attempt'
  | 'mandate'
  | 'on_behalf_of'
  | 'payment_method'
  | 'single_use_mandate'
>;

export type StripeConfirmationToken = NegotiateExpanded<
  never,
  Stripe.ConfirmationToken,
  'payment_intent' | 'setup_intent'
>;

export type StripeAddress = Stripe.Address;
export type StripeApiList<T> = Stripe.ApiList<T>;
export type StripeApiListPromise<T> = Stripe.ApiListPromise<T>;
export type StripeResponse<T> = Stripe.Response<T>;
