import React from 'react';

import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';
import { Meta } from '@storybook/react';

import MockApp from '../../../../.storybook/components/MockApp';
import { SignInLayout } from '../../../components/AppLayout';
import { SubscriptionUpgrade, SubscriptionUpgradeProps } from './index';
import { WebSubscription } from 'fxa-shared/subscriptions/types';

import { APIError } from '../../../lib/apiClient';
import { defaultAppContext, AppContextType } from '../../../lib/AppContext';
import {
  CUSTOMER,
  SELECTED_PLAN,
  UPGRADE_FROM_PLAN,
  PROFILE,
} from '../../../lib/mock-data';

import { FirstInvoicePreview } from 'fxa-shared/dto/auth/payments/invoice';

export default {
  title: 'routes/Product/SubscriptionUpgrade',
  component: SubscriptionUpgrade,
} as Meta;

const linkToUpgradeSuccess = linkTo('routes/Product', 'success');

const linkToUpgradeOffer = linkTo(
  'routes/Product/SubscriptionUpgrade',
  'upgrade offer'
);

const invoicePreviewNoTax: FirstInvoicePreview = {
  total: 2000,
  total_excluding_tax: null,
  subtotal: 2000,
  subtotal_excluding_tax: null,
  line_items: [
    {
      amount: 2000,
      currency: 'USD',
      id: SELECTED_PLAN.plan_id,
      name: 'first invoice',
      period: {
        end: (CUSTOMER.subscriptions[0] as WebSubscription).current_period_end,
        start: (CUSTOMER.subscriptions[0] as WebSubscription)
          .current_period_start,
      },
    },
  ],
  prorated_amount: -833,
  one_time_charge: 1337,
};

const invoicePreviewInclusiveTax: FirstInvoicePreview = {
  line_items: [],
  subtotal: 2999,
  subtotal_excluding_tax: 2804,
  total: 2999,
  total_excluding_tax: 2804,
  tax: [
    {
      amount: 195,
      inclusive: true,
      display_name: 'Sales Tax',
    },
  ],
  prorated_amount: -833,
  one_time_charge: 1337,
};

const invoicePreviewExclusiveTax: FirstInvoicePreview = {
  line_items: [],
  subtotal: 2999,
  subtotal_excluding_tax: 2999,
  total: 3194,
  total_excluding_tax: 2999,
  tax: [
    {
      amount: 195,
      inclusive: false,
      display_name: 'Sales Tax',
    },
  ],
  prorated_amount: -833,
  one_time_charge: 1337,
};

const invoicePreviewExclusiveTaxMulti: FirstInvoicePreview = {
  ...invoicePreviewExclusiveTax,
  tax: [
    {
      ...invoicePreviewExclusiveTax.tax![0],
      amount: 100,
    },
    {
      ...invoicePreviewExclusiveTax.tax![0],
      amount: 95,
    },
  ],
};

const MOCK_PROPS: SubscriptionUpgradeProps = {
  isMobile: false,
  profile: PROFILE,
  customer: CUSTOMER,
  selectedPlan: SELECTED_PLAN,
  upgradeFromPlan: UPGRADE_FROM_PLAN,
  upgradeFromSubscription: CUSTOMER.subscriptions[0] as WebSubscription,
  updateSubscriptionPlanStatus: {
    error: null,
    loading: false,
    result: null,
  },
  invoicePreview: invoicePreviewNoTax,
  updateSubscriptionPlanAndRefresh: action('updateSubscriptionPlanAndRefresh'),
  resetUpdateSubscriptionPlan: action('resetUpdateSubscriptionPlan'),
};

const storyWithContext = ({
  props = MOCK_PROPS,
  appContextValue = defaultAppContext,
}: {
  props?: SubscriptionUpgradeProps;
  appContextValue?: AppContextType;
}) => {
  const story = () => (
    <MockApp appContextValue={appContextValue}>
      <SignInLayout>
        <SubscriptionUpgrade {...props} />
      </SignInLayout>
    </MockApp>
  );

  return story;
};

export const Default = storyWithContext({
  props: {
    ...MOCK_PROPS,
    updateSubscriptionPlanAndRefresh: () => linkToUpgradeSuccess(),
  },
  appContextValue: {
    ...defaultAppContext,
    config: {
      ...defaultAppContext.config,
      featureFlags: {
        useStripeAutomaticTax: true,
      },
    },
  },
});

export const DefaultWithInclusiveTax = storyWithContext({
  props: {
    ...MOCK_PROPS,
    invoicePreview: invoicePreviewInclusiveTax,
    updateSubscriptionPlanAndRefresh: () => linkToUpgradeSuccess(),
  },
  appContextValue: {
    ...defaultAppContext,
    navigatorLanguages: ['xx-pirate'],
    config: {
      ...defaultAppContext.config,
      featureFlags: {
        useStripeAutomaticTax: true,
      },
    },
  },
});

export const DefaultWithExclusiveTax = storyWithContext({
  props: {
    ...MOCK_PROPS,
    invoicePreview: invoicePreviewExclusiveTax,
    updateSubscriptionPlanAndRefresh: () => linkToUpgradeSuccess(),
  },
  appContextValue: {
    ...defaultAppContext,
    navigatorLanguages: ['xx-pirate'],
    config: {
      ...defaultAppContext.config,
      featureFlags: {
        useStripeAutomaticTax: true,
      },
    },
  },
});

export const MultipleWithExclusiveTax = storyWithContext({
  props: {
    ...MOCK_PROPS,
    invoicePreview: invoicePreviewExclusiveTaxMulti,
    updateSubscriptionPlanAndRefresh: () => linkToUpgradeSuccess(),
  },
  appContextValue: {
    ...defaultAppContext,
    navigatorLanguages: ['xx-pirate'],
    config: {
      ...defaultAppContext.config,
      featureFlags: {
        useStripeAutomaticTax: true,
      },
    },
  },
});

export const LocalizedToPirate = storyWithContext({
  props: {
    ...MOCK_PROPS,
    updateSubscriptionPlanAndRefresh: () => linkToUpgradeSuccess(),
  },
  appContextValue: {
    ...defaultAppContext,
    navigatorLanguages: ['xx-pirate'],
    config: {
      ...defaultAppContext.config,
    },
  },
});

export const Submitting = storyWithContext({
  props: {
    ...MOCK_PROPS,
    updateSubscriptionPlanStatus: {
      loading: true,
      result: null,
      error: null,
    },
  },
  appContextValue: {
    ...defaultAppContext,
    config: {
      ...defaultAppContext.config,
    },
  },
});

export const InternalServerError = storyWithContext({
  props: {
    ...MOCK_PROPS,
    updateSubscriptionPlanStatus: {
      loading: false,
      result: null,
      error: new APIError({
        statusCode: 500,
        message: 'Internal Server Error',
      }),
    },
    resetUpdateSubscriptionPlan: linkToUpgradeOffer,
  },
  appContextValue: {
    ...defaultAppContext,
    config: {
      ...defaultAppContext.config,
    },
  },
});
