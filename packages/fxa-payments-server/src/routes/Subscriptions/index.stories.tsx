/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import MockApp, {
  defaultAppContextValue,
} from '../../../.storybook/components/MockApp';
import { SettingsLayout } from '../../components/AppLayout';
import { Subscriptions, SubscriptionsProps } from './index';
import { PaymentUpdateStripeAPIs } from './PaymentUpdateForm';
import { QueryParams } from '../../lib/types';
import { APIError } from '../../lib/apiClient';
import { FetchState, Profile } from '../../store/types';
import { linkTo } from '@storybook/addon-links';
import { CUSTOMER, FILTERED_SETUP_INTENT } from '../../lib/mock-data';
import {
  IapSubscription,
  MozillaSubscriptionTypes,
  Plan,
  WebSubscription,
} from 'fxa-shared/subscriptions/types';
import { LatestInvoiceItems } from 'fxa-shared/dto/auth/payments/invoice';

// TODO: Move to some shared lib?
const wait = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));

const defaultPaymentUpdateApiClientOverrides = () => ({
  apiCreateSetupIntent: async () => FILTERED_SETUP_INTENT,
  apiUpdateDefaultPaymentMethod: async () => {
    await wait(1000);
    return CUSTOMER;
  },
});

const CONFIRM_CARD_SETUP_RESULT = {
  setupIntent: {
    payment_method: 'pm_test',
  },
  error: null,
};

// HACK: Not a complete confirmCardSetup return type, but good enough for stories.
const defaultPaymentUpdateStripeOverride = () =>
  ({
    confirmCardSetup: async () => CONFIRM_CARD_SETUP_RESULT,
  }) as unknown as PaymentUpdateStripeAPIs;

export default {
  title: 'routes/Subscriptions',
  component: Subscriptions,
} as Meta;

const baseRouteProps = {
  paymentUpdateApiClientOverrides: defaultPaymentUpdateApiClientOverrides(),
  paymentUpdateStripeOverride: defaultPaymentUpdateStripeOverride(),
};

const storyWithContext = ({
  routeProps = baseProps,
  queryParams = defaultAppContextValue.queryParams,
  applyStubsToStripe,
}: SubscriptionsRouteProps) => {
  return () => (
    <MockApp
      applyStubsToStripe={applyStubsToStripe}
      appContextValue={{
        ...defaultAppContextValue,
        queryParams,
      }}
    >
      <SettingsLayout>
        <Subscriptions {...routeProps} {...baseRouteProps} />
      </SettingsLayout>
    </MockApp>
  );
};

const linkToReactivationConfirmation = () =>
  linkTo('routes/Subscriptions', 'reactivation confirmation');

const errorFetchState = (): FetchState<any> => ({
  loading: false,
  result: null,
  error: new APIError({
    statusCode: 500,
    message: 'Internal Server Error',
  }),
});

type SubscriptionsRouteProps = {
  routeProps?: SubscriptionsProps;
  queryParams?: QueryParams;
  applyStubsToStripe?: (orig: stripe.Stripe) => stripe.Stripe;
};

const PRODUCT_ID = 'product_8675309';
const PLAN_ID = 'plan_123';

const PROFILE: Profile = {
  amrValues: [],
  avatar: 'http://placekitten.com/256/256',
  avatarDefault: false,
  displayName: 'Foo Barson',
  email: 'foo@example.com',
  locale: 'en',
  twoFactorAuthentication: true,
  uid: '8675309asdf',
  metricsEnabled: true,
};

const PLANS: Plan[] = [
  {
    plan_id: PLAN_ID,
    product_id: PRODUCT_ID,
    product_name: 'Example Product',
    currency: 'USD',
    amount: 1099,
    interval: 'month' as const,
    interval_count: 1,
    active: true,
    plan_metadata: null,
    product_metadata: {
      webIconURL: 'http://placekitten.com/512/512',
      'product:subtitle': 'Really keen product',
      'product:details:1':
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
      'product:details:2': 'Sed ut perspiciatis unde omnis iste natus',
      'product:details:3': 'Nemo enim ipsam voluptatem',
      'product:details:4':
        'Ut enim ad minima veniam, quis nostrum exercitationem',
    },
  },
];

const baseProps: SubscriptionsProps = {
  profile: {
    error: null,
    loading: false,
    result: PROFILE,
  },
  plans: {
    error: null,
    loading: false,
    result: PLANS,
  },
  customer: {
    error: null,
    loading: false,
    result: null,
  },
  customerSubscriptions: [],
  fetchSubscriptionsRouteResources: action('fetchSubscriptionsRouteResources'),
  cancelSubscription: () => linkTo('routes/Subscriptions', 'cancelled')(),
  reactivateSubscription: action('reactivateSubscription'),
  resetCancelSubscription: action('resetCancelSubscription'),
  resetReactivateSubscription: action('resetReactivateSubscription'),
  cancelSubscriptionStatus: {
    error: null,
    loading: false,
    result: null,
  },
  reactivateSubscriptionStatus: {
    error: null,
    loading: false,
    result: null,
  },
  subsequentInvoices: {
    error: null,
    loading: false,
    result: null,
  },
};

const latestInvoiceLineItemPeriod = {
  end: (Date.now() + 86400) / 1000,
  start: (Date.now() + 86400) / 1000,
};

const INVOICE_NO_TAX: LatestInvoiceItems = {
  total: 2000,
  total_excluding_tax: null,
  subtotal: 2000,
  subtotal_excluding_tax: null,
  line_items: [
    {
      amount: 2000,
      currency: 'USD',
      id: PLAN_ID,
      name: 'first invoice',
      period: latestInvoiceLineItemPeriod,
    },
  ],
};

const INVOICE_WITH_TAX_EXCLUSIVE: LatestInvoiceItems = {
  total: 2300,
  total_excluding_tax: 2000,
  subtotal: 2000,
  subtotal_excluding_tax: 2000,
  line_items: [
    {
      amount: 2000,
      currency: 'USD',
      id: PLAN_ID,
      name: 'first invoice',
      period: latestInvoiceLineItemPeriod,
    },
  ],
  tax: [
    {
      amount: 300,
      inclusive: false,
      display_name: 'Sales Tax',
    },
  ],
};

const INVOICE_WITH_TAX_INCLUSIVE: LatestInvoiceItems = {
  total: 2000,
  total_excluding_tax: 1700,
  subtotal: 2000,
  subtotal_excluding_tax: 1700,
  line_items: [
    {
      amount: 2000,
      currency: 'USD',
      id: PLAN_ID,
      name: 'first invoice',
      period: latestInvoiceLineItemPeriod,
    },
  ],
  tax: [
    {
      amount: 300,
      inclusive: true,
      display_name: 'Sales Tax',
    },
  ],
};

const customerSubscriptions = [
  {
    _subscription_type: MozillaSubscriptionTypes.WEB,
    created: Date.now(),
    current_period_end: (Date.now() + 86400) / 1000,
    current_period_start: (Date.now() - 86400) / 1000,
    cancel_at_period_end: false,
    end_at: null,
    latest_invoice: '628031D-0002',
    latest_invoice_items: INVOICE_NO_TAX,
    plan_id: PLAN_ID,
    product_id: PRODUCT_ID,
    product_name: 'Example Product',
    status: 'active',
    subscription_id: 'sub_5551212',
    promotion_duration: null,
    promotion_end: null,
  },
] as WebSubscription[];

const subscribedProps: SubscriptionsProps = {
  ...baseProps,
  customer: {
    loading: false,
    error: null,
    result: {
      billing_name: 'Jane Doe',
      payment_provider: 'stripe',
      payment_type: 'card',
      last4: '8675',
      exp_month: '12',
      exp_year: '2028',
      brand: 'Visa',
      subscriptions: customerSubscriptions,
    },
  },
  customerSubscriptions: customerSubscriptions,
  subsequentInvoices: {
    error: null,
    loading: false,
    result: [
      {
        currency: 'usd',
        subscriptionId: 'sub_5551212',
        period_start: 1,
        total: 100,
        total_excluding_tax: null,
        subtotal: 100,
        subtotal_excluding_tax: null,
      },
    ],
  },
};

const cancelledProps: SubscriptionsProps = {
  ...subscribedProps,
  customerSubscriptions: subscribedProps.customerSubscriptions
    ? ([
        {
          ...subscribedProps.customerSubscriptions[0],
          cancel_at_period_end: true,
        },
      ] as WebSubscription[])
    : null,
};

const subscribedPropsWithTaxExclusive: SubscriptionsProps = {
  ...subscribedProps,
  customerSubscriptions: subscribedProps.customerSubscriptions
    ? ([
        {
          ...subscribedProps.customerSubscriptions[0],
          latest_invoice_items: INVOICE_WITH_TAX_EXCLUSIVE,
        },
      ] as WebSubscription[])
    : null,
};

const subscribedPropsWithTaxInclusive: SubscriptionsProps = {
  ...subscribedProps,
  customerSubscriptions: subscribedProps.customerSubscriptions
    ? ([
        {
          ...subscribedProps.customerSubscriptions[0],
          latest_invoice_items: INVOICE_WITH_TAX_INCLUSIVE,
        },
      ] as WebSubscription[])
    : null,
};

const reactivationErrorProps = {
  ...cancelledProps,
  reactivateSubscriptionStatus: {
    loading: false,
    result: false,
    error: new APIError({
      statusCode: 500,
      message: 'reactivateSubscription API not implemented',
    }),
  },
};

const subscribedIapProps = {
  ...subscribedProps,
  customerSubscriptions: [
    {
      ...subscribedProps.customerSubscriptions![0],
      _subscription_type: MozillaSubscriptionTypes.IAP_GOOGLE,
      expiry_time_millis: Date.now(),
      auto_renewing: true,
      sku: 'cooking.with.foxkeh',
      package_name: 'foxkeh',
    },
  ] as IapSubscription[],
};

const subscribedIapPropsAppleBase = {
  ...subscribedProps.customerSubscriptions![0],
  _subscription_type: MozillaSubscriptionTypes.IAP_APPLE,
  app_store_product_id: 'wow',
  bundle_id: 'hmm',
};

const subscribedIapPropsAppleExpiry = {
  ...subscribedProps,
  customerSubscriptions: [
    {
      ...subscribedIapPropsAppleBase,
      auto_renewing: true,
      expiry_time_millis: 1656759852811,
    },
  ] as IapSubscription[],
};

const subscribedIapPropsAppleNoRenew = {
  ...subscribedProps,
  customerSubscriptions: [
    {
      ...subscribedIapPropsAppleBase,
      auto_renewing: false,
      expiry_time_millis: Date.now(),
    },
  ] as IapSubscription[],
};

const subscribedIapPropsAppleNoExpiry = {
  ...subscribedProps,
  customerSubscriptions: [
    {
      ...subscribedIapPropsAppleBase,
      auto_renewing: true,
    },
  ] as IapSubscription[],
};

export const Loading = storyWithContext({});

export const NoSubscription = storyWithContext({});

export const SubscribedWithWebSubscription = storyWithContext({
  routeProps: subscribedProps,
});

export const SubscribedWithWebSubscriptionWithCoupon = storyWithContext({
  routeProps: subscribedProps,
});

export const SubscribedWithWebSubscriptionWithExclusiveTax = storyWithContext({
  routeProps: {
    ...subscribedPropsWithTaxExclusive,
    subsequentInvoices: {
      error: null,
      loading: false,
      result: [
        {
          currency: 'usd',
          subscriptionId: 'sub_5551212',
          period_start: 1,
          subtotal: 2000,
          subtotal_excluding_tax: 2000,
          total: 2300,
          total_excluding_tax: 2000,
          tax: [
            {
              amount: 300,
              inclusive: false,
              display_name: 'Sales Tax',
            },
          ],
        },
      ],
    },
  },
});

export const SubscribedWithWebSubscriptionWithInclusiveTax = storyWithContext({
  routeProps: {
    ...subscribedPropsWithTaxInclusive,
    subsequentInvoices: {
      error: null,
      loading: false,
      result: [
        {
          currency: 'usd',
          subscriptionId: 'sub_5551212',
          period_start: 1,
          subtotal: 2000,
          subtotal_excluding_tax: 1700,
          total: 2000,
          total_excluding_tax: 1700,
          tax: [
            {
              amount: 300,
              inclusive: true,
              display_name: 'Sales Tax',
            },
          ],
        },
      ],
    },
  },
});

export const SubscribedWithGoogleIAP = storyWithContext({
  routeProps: subscribedIapProps,
});

export const SubscribedWithAppleIAPAutoRenewWithExpiration = storyWithContext({
  routeProps: subscribedIapPropsAppleExpiry,
});

export const SubscribedWithAppleIAPNoAutoRenewWithExpiration = storyWithContext(
  {
    routeProps: subscribedIapPropsAppleNoRenew,
  }
);

export const SubscribedWithAppleIAPNoExpiration = storyWithContext({
  routeProps: subscribedIapPropsAppleNoExpiry,
});

export const SubscribedWithGoogleIAPAndWebSubscription = storyWithContext({
  routeProps: {
    ...subscribedIapProps,
    customerSubscriptions: [
      ...customerSubscriptions,
      ...subscribedIapProps.customerSubscriptions,
    ],
  },
});

export const SubscribedWithUpgradeOffer = storyWithContext({
  routeProps: {
    ...subscribedProps,
    plans: {
      error: null,
      loading: false,
      result: [
        {
          ...PLANS[0],
          product_name: 'Upgradable Product',
          plan_metadata: null,
          product_metadata: {
            upgradeCTA: `
            Interested in better features?
            Upgrade to <a href="http://mozilla.org">the Upgrade Product</a>!
          `,
          },
        },
      ],
    },
  },
});

export const Cancelled = storyWithContext({
  routeProps: {
    ...cancelledProps,
    resetCancelSubscription: linkTo('routes/Subscriptions', 'reactivation'),
    cancelSubscriptionStatus: {
      loading: false,
      error: null,
      result: {
        subscriptionId: 'sub_5551212',
      },
    },
  },
});

export const Reactivation = storyWithContext({
  routeProps: {
    ...cancelledProps,
    reactivateSubscription: linkToReactivationConfirmation,
  },
});

export const ReactivationConfirmation = storyWithContext({
  routeProps: {
    ...subscribedProps,
    reactivateSubscriptionStatus: {
      loading: false,
      error: null,
      result: {
        subscriptionId: 'sub_5551212',
        plan: PLANS[0],
      },
    },
    resetReactivateSubscription: linkTo('routes/Subscriptions', 'subscribed'),
  },
});

export const ErrorOnProfile = storyWithContext({
  routeProps: {
    ...baseProps,
    profile: errorFetchState(),
  },
});

export const ErrorOnPlans = storyWithContext({
  routeProps: {
    ...baseProps,
    plans: errorFetchState(),
  },
});

export const ErrorOnReactivation = storyWithContext({
  routeProps: {
    ...reactivationErrorProps,
    reactivateSubscriptionStatus: errorFetchState(),
    resetReactivateSubscription: linkTo('routes/Subscriptions', 'reactivation'),
  },
});
