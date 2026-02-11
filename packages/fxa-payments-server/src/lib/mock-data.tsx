import { PaymentIntent, PaymentMethod } from '@stripe/stripe-js';
import { CouponDetails } from 'fxa-shared/dto/auth/payments/coupon';
import { AppStoreSubscription } from 'fxa-shared/dto/auth/payments/iap-subscription';
import {
  FirstInvoicePreview,
  LatestInvoiceItems,
} from 'fxa-shared/dto/auth/payments/invoice';
import {
  AbbrevPlan,
  IapSubscription,
  MozillaSubscriptionTypes,
  WebSubscription,
} from 'fxa-shared/subscriptions/types';

import { FilteredSetupIntent } from '../lib/apiClient';
import { Customer, Plan, Profile } from '../store/types';
import { GAEvent, GAPaymentType, GAPurchaseType } from '../lib/reactga-event';

const invoice: LatestInvoiceItems = {
  line_items: [
    {
      id: '123doneProMonthly',
      name: 'Pro level',
      currency: 'USD',
      amount: 735,
      period: {
        start: Date.now() / 1000 - 86400 * 31,
        end: Date.now() / 1000 + 86400 * 31,
      },
    },
  ],
  subtotal: 735,
  subtotal_excluding_tax: null,
  total: 735,
  total_excluding_tax: null,
};

const invoicePayPal: LatestInvoiceItems = {
  ...invoice,
  line_items: [
    {
      ...invoice.line_items[0],
      id: 'plan_123',
    },
  ],
};

export const PROFILE: Profile = {
  amrValues: [],
  avatar: 'http://placekitten.com/256/256?image=11',
  avatarDefault: false,
  displayName: 'Foo Barson',
  email: 'foo@example.com',
  locale: 'en',
  twoFactorAuthentication: true,
  uid: '8675309asdf',
  metricsEnabled: true,
};

export const NEW_CUSTOMER: Customer = {
  subscriptions: [],
};

export const CUSTOMER: Customer = {
  customerId: 'cus_123xyz',
  billing_name: 'Foo Barson',
  billing_agreement_id: 'ba-131243',
  payment_provider: 'stripe',
  payment_type: 'credit',
  last4: '5309',
  exp_month: '02',
  exp_year: '2099',
  brand: 'Visa',
  subscriptions: [
    {
      _subscription_type: MozillaSubscriptionTypes.WEB,
      subscription_id: 'sub0.28964929339372136',
      plan_id: '123doneProMonthly',
      product_id: 'prod_123',
      product_name: '123done Pro',
      latest_invoice: '628031D-0002',
      latest_invoice_items: invoice,
      status: 'active',
      created: Date.now(),
      cancel_at_period_end: false,
      current_period_end: Date.now() / 1000 + 86400 * 31,
      current_period_start: Date.now() / 1000 - 86400 * 31,
      end_at: null,
      promotion_duration: null,
      promotion_end: null,
    },
  ],
};

export const PRODUCT_ID = 'product_8675309';

export const SELECTED_PLAN: Plan = {
  plan_id: 'plan_123',
  product_id: PRODUCT_ID,
  product_name: 'Better Upgrade Product',
  currency: 'USD',
  amount: 2999,
  interval: 'month' as const,
  interval_count: 1,
  active: true,
  plan_metadata: null,
  product_metadata: {
    webIconURL: 'http://placekitten.com/49/49?image=2',
    webIconBackground: 'purple',
    'product:subtitle': 'Even more keen product',
    'product:details:1': 'Quis autem vel eum iure reprehenderit',
    'product:details:2': 'Sed ut perspiciatis unde omnis iste natus',
    'product:details:3': 'Nemo enim ipsam voluptatem',
    'product:subtitle:xx-pirate': 'VPN fer land lubbers',
    'product:details:1:xx-pirate': 'Device-level encryption arr',
    'product:details:2:xx-pirate': 'Servers is 30+ countries matey',
    'product:details:3:xx-pirate': "Connects 5 devices wit' one subscription",
    'product:termsOfServiceURL':
      'https://www.mozilla.org/en-US/about/legal/terms/services/',
    'product:termsOfServiceURL:fr':
      'https://www.mozilla.org/fr/about/legal/terms/services/',
    'product:termsOfServiceDownloadURL':
      'https://www.mozilla.org/en-US/about/legal/terms/services/download.pdf',
    'product:termsOfServiceDownloadURL:fr':
      'https://www.mozilla.org/fr/about/legal/terms/services/download.pdf',
    'product:privacyNoticeURL':
      'https://www.mozilla.org/en-US/privacy/websites/',
    'product:privacyNoticeURL:fr':
      'https://www.mozilla.org/fr/privacy/websites/',
  },
};

export const UPGRADE_FROM_PLAN: AbbrevPlan = {
  plan_id: 'plan_abc',
  product_id: PRODUCT_ID,
  product_name: 'Example Product',
  currency: 'USD',
  amount: 999,
  interval: 'month' as const,
  interval_count: 1,
  active: true,
  plan_metadata: null,
  plan_name: 'Example Product Monthly',
  product_metadata: {
    webIconURL: 'http://placekitten.com/49/49?image=9',
    webIconBackground: 'lime',
    'product:subtitle': 'Nifty product',
    'product:details:1':
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    'product:details:2': 'Sed ut perspiciatis unde omnis iste natus',
    'product:details:3': 'Nemo enim ipsam voluptatem',
    'product:details:4':
      'Ut enim ad minima veniam, quis nostrum exercitationem',
    'product:subtitle:xx-pirate': 'VPN fer yer full-device',
    'product:details:1:xx-pirate': 'Device-level encryption arr',
    'product:details:2:xx-pirate': 'Servers is 30+ countries matey',
    'product:details:3:xx-pirate': "Connects 5 devices wit' one subscription",
  },
};

export const UPGRADE_FROM_PLAN_ARCHIVED: AbbrevPlan = {
  ...UPGRADE_FROM_PLAN,
  product_metadata: {
    ...UPGRADE_FROM_PLAN.product_metadata,
  },
  plan_id: 'plan_cba_archived',
  product_name: 'Example archived product',
  active: false,
};

export const PAYPAL_CUSTOMER: Customer = {
  billing_name: 'Foo Barson - Pays with PayPal',
  payment_provider: 'paypal',
  payment_type: '',
  last4: '',
  exp_month: '',
  exp_year: '',
  brand: '',
  subscriptions: [
    {
      _subscription_type: MozillaSubscriptionTypes.WEB,
      subscription_id: 'sub0.28964929339372136',
      plan_id: 'plan_123',
      product_id: 'prod_123',
      product_name: '123done Pro',
      latest_invoice: '628031D-0002',
      latest_invoice_items: invoicePayPal,
      status: 'active',
      cancel_at_period_end: false,
      created: Date.now(),
      current_period_end: Date.now() / 1000 + 86400 * 31,
      current_period_start: Date.now() / 1000 - 86400 * 31,
      end_at: null,
      promotion_duration: null,
      promotion_end: null,
    },
  ],
};

export const PLAN: Plan = {
  plan_id: 'plan_456',
  product_id: PRODUCT_ID,
  product_name: 'Example Product',
  currency: 'USD',
  amount: 1050,
  interval: 'month' as const,
  interval_count: 1,
  active: true,
  plan_metadata: null,
  product_metadata: {
    webIconURL: 'http://placekitten.com/512/512',
    webIconBackground: '#00ffff',
    'product:subtitle': 'Really keen product',
    'product:details:1':
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    'product:details:2': 'Sed ut perspiciatis unde omnis iste natus',
    'product:details:3': 'Nemo enim ipsam voluptatem',
    'product:details:4':
      'Ut enim ad minima veniam, quis nostrum exercitationem',
  },
};

export const INACTIVE_PLAN = {
  ...PLAN,
  product_metadata: { ...PLAN.product_metadata },
  plan_id: 'plan_inactive',
  active: false,
};

export const PLANS: Plan[] = [
  PLAN,
  UPGRADE_FROM_PLAN,
  SELECTED_PLAN,
  INACTIVE_PLAN,
];

export const INACTIVE_PLAN_ID = INACTIVE_PLAN.plan_id;

export const FILTERED_SETUP_INTENT: FilteredSetupIntent = {
  client_secret:
    'seti_1GnXR2Kb9q6OnNsLFV0IWItK_secret_HMFwCT3daxuB29hhx4j7eJQ0IFtqEB5',
  created: 1590617356,
  next_action: null,
  payment_method: 'card_1GnXR2Kb9q6OnNsLuymjpC5P',
  status: 'succeeded',
};

export const STUB_ACCOUNT_RESULT = {
  uid: 'newquux',
  access_token: 'keytothecity',
};

export const SUBSCRIPTION_RESULT = {
  id: 'sub_1234',
  latest_invoice: {
    id: 'invoice_5678',
    payment_intent: {
      id: 'pi_7890',
      client_secret: 'cs_abcd',
      status: 'succeeded',
    },
  },
};

export const RETRY_INVOICE_RESULT = {
  id: 'invoice_5678',
  payment_intent: {
    id: 'pi_9876',
    client_secret: 'cs_erty',
    status: 'succeeded',
  },
};

export const DETACH_PAYMENT_METHOD_RESULT = {
  id: 'pm_80808',
  foo: 'quux',
};

export const PAYMENT_METHOD_RESULT = {
  paymentMethod: { id: 'pm_4567' } as PaymentMethod,
  error: undefined,
};

export const CONFIRM_CARD_RESULT = {
  paymentIntent: { status: 'succeeded' } as PaymentIntent,
  error: undefined,
};

export const MOCK_STRIPE_CARD_ERROR = {
  code: 'card_declined',
};

export const MOCK_FXA_POST_PASSWORDLESS_SUB_ERROR = {
  code: 'fxa_fetch_profile_customer_error',
};
export const MOCK_GENERAL_PAYPAL_ERROR = {
  code: 'general_paypal_error',
};

export const MOCK_CURRENCY_ERROR = {
  code: '400',
  errno: 130,
  error: 'Bad Request',
  message: 'Funding source country does not match plan currency.',
  info: 'https://mozilla.github.io/ecosystem-platform/api#section/Response-format',
  currency: 'usd',
  country: 'RO',
};

export const MOCK_UNSUPPORTED_LOCATION_ERROR = {
  code: 'location_unsupported',
  errno: 213,
  error: 'Bad Request',
  message: 'Location not supported according to Terms of Service.',
  info: 'https://mozilla.github.io/ecosystem-platform/api#section/Response-format',
  currency: 'usd',
  country: 'CN',
};

export const IAP_GOOGLE_SUBSCRIPTION: IapSubscription = {
  _subscription_type: MozillaSubscriptionTypes.IAP_GOOGLE,
  product_id: 'prod_123',
  auto_renewing: true,
  expiry_time_millis: Date.now(),
  package_name: 'org.mozilla.cooking.with.foxkeh',
  sku: 'org.mozilla.foxkeh.yearly',
  product_name: 'Cooking with Foxkeh',
  price_id: 'plan_123',
};

export const IAP_APPLE_SUBSCRIPTION: AppStoreSubscription = {
  _subscription_type: MozillaSubscriptionTypes.IAP_APPLE,
  app_store_product_id: 'wow',
  auto_renewing: true,
  bundle_id: 'hmm',
  price_id: 'price_123',
  product_id: 'prod_123',
  product_name: 'Cooking with Foxkeh',
};

export const IAP_CUSTOMER: Customer = {
  subscriptions: [IAP_GOOGLE_SUBSCRIPTION],
};

const invoicePreviewLinePeriod = {
  end: (CUSTOMER.subscriptions[0] as WebSubscription).current_period_end,
  start: (CUSTOMER.subscriptions[0] as WebSubscription).current_period_start,
};

export const INVOICE_PREVIEW_WITHOUT_DISCOUNT: FirstInvoicePreview = {
  line_items: [
    {
      amount: 500,
      currency: 'usd',
      id: 'plan_GqM9N64ksvxaVk',
      name: '1 x 123Done Pro (at $5.00 / month)',
      period: invoicePreviewLinePeriod,
    },
  ],
  subtotal: 500,
  subtotal_excluding_tax: null,
  total: 500,
  total_excluding_tax: null,
};

export const INVOICE_PREVIEW_WITH_VALID_DISCOUNT: FirstInvoicePreview = {
  line_items: [
    {
      amount: 500,
      currency: 'usd',
      id: 'plan_GqM9N64ksvxaVk',
      name: '1 x 123Done Pro (at $5.00 / month)',
      period: invoicePreviewLinePeriod,
    },
  ],
  subtotal: 500,
  subtotal_excluding_tax: null,
  total: 450,
  total_excluding_tax: null,
  discount: {
    amount: 50,
    amount_off: null,
    percent_off: 10,
  },
};

export const COUPON_DETAILS_VALID: CouponDetails = {
  promotionCode: 'VALID',
  type: '',
  durationInMonths: 1,
  valid: true,
  discountAmount: 50,
  expired: false,
  maximallyRedeemed: false,
};

export const COUPON_DETAILS_INVALID: CouponDetails = {
  promotionCode: 'INVALID',
  type: '',
  durationInMonths: 1,
  valid: false,
  expired: false,
  maximallyRedeemed: false,
};

export const COUPON_DETAILS_EXPIRED: CouponDetails = {
  promotionCode: 'EXPIRED',
  type: '',
  durationInMonths: 1,
  valid: false,
  expired: true,
  maximallyRedeemed: false,
};

export const COUPON_DETAILS_MAX_REDEEMED: CouponDetails = {
  promotionCode: 'EXPIRED',
  type: '',
  durationInMonths: 1,
  valid: false,
  maximallyRedeemed: true,
  expired: false,
};

export const INVOICE_PREVIEW_WITH_100_VALID_DISCOUNT: FirstInvoicePreview = {
  line_items: [
    {
      amount: 500,
      currency: 'usd',
      id: 'plan_GqM9N64ksvxaVk',
      name: '1 x 123Done Pro (at $5.00 / month)',
      period: invoicePreviewLinePeriod,
    },
  ],
  subtotal: 500,
  subtotal_excluding_tax: null,
  total: 0,
  total_excluding_tax: null,
  discount: {
    amount: 500,
    amount_off: null,
    percent_off: 100,
  },
};

export const INVOICE_PREVIEW_WITH_INVALID_DISCOUNT: FirstInvoicePreview = {
  line_items: [
    {
      amount: 500,
      currency: 'usd',
      id: 'plan_GqM9N64ksvxaVk',
      name: '1 x 123Done Pro (at $5.00 / month)',
      period: invoicePreviewLinePeriod,
    },
  ],
  subtotal: 500,
  subtotal_excluding_tax: null,
  total: 25,
  total_excluding_tax: null,
  discount: {
    amount: 475,
    amount_off: 475,
    percent_off: null,
  },
};

export const INVOICE_PREVIEW_INCLUSIVE_TAX: FirstInvoicePreview = {
  line_items: [
    {
      amount: 500,
      currency: 'usd',
      id: 'plan_GqM9N64ksvxaVk',
      name: '1 x 123Done Pro (at $5.00 / month)',
      period: invoicePreviewLinePeriod,
    },
  ],
  subtotal: 500,
  subtotal_excluding_tax: 377,
  total: 500,
  total_excluding_tax: 377,
  tax: [
    {
      amount: 123,
      inclusive: true,
      display_name: 'Sales Tax',
    },
  ],
};

export const INVOICE_PREVIEW_EXCLUSIVE_TAX: FirstInvoicePreview = {
  line_items: [
    {
      amount: 500,
      currency: 'usd',
      id: 'plan_GqM9N64ksvxaVk',
      name: '1 x 123Done Pro (at $5.00 / month)',
      period: invoicePreviewLinePeriod,
    },
  ],
  subtotal: 500,
  subtotal_excluding_tax: 500,
  total: 623,
  total_excluding_tax: 500,
  tax: [
    {
      amount: 123,
      inclusive: false,
      display_name: 'Sales Tax',
    },
  ],
};

export const MOCK_EVENTS = {
  AddPaymentInfo: (plan: Plan) => ({
    eventName: GAEvent.AddPaymentInfo,
    paymentType: GAPaymentType.CreditCard,
    plan,
  }),
  AddPayPalPaymentInfo: (plan: Plan) => ({
    eventName: GAEvent.AddPaymentInfo,
    paymentType: GAPaymentType.PayPal,
    plan,
  }),
  PurchaseSubmitNew: (plan: Plan) => ({
    eventName: GAEvent.PurchaseSubmit,
    plan,
    purchaseType: GAPurchaseType.New,
  }),
  PurchaseSubmitUpgrade: (plan: Plan) => ({
    eventName: GAEvent.PurchaseSubmit,
    plan,
    purchaseType: GAPurchaseType.Upgrade,
  }),
  PurchaseNew: (plan: Plan) => ({
    eventName: GAEvent.Purchase,
    plan,
    purchaseType: GAPurchaseType.New,
  }),
  PurchaseUpgrade: (plan: Plan) => ({
    eventName: GAEvent.Purchase,
    plan,
    purchaseType: GAPurchaseType.Upgrade,
  }),
  SignUp: {
    eventName: GAEvent.SignUp,
  },
};
