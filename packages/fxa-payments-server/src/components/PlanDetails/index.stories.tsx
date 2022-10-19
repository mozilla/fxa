/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import MockApp from '../../../.storybook/components/MockApp';
import PlanDetails, { PlanDetailsProps } from './index';
import { Profile } from '../../store/types';
import { COUPON_DETAILS_VALID } from '../../lib/mock-data';
import { Meta } from '@storybook/react';
import { FirstInvoicePreview } from 'fxa-shared/dto/auth/payments/invoice';

export default {
  title: 'components/PlanDetails',
  component: PlanDetails,
} as Meta;

const userProfile: Profile = {
  avatar: 'http://placekitten.com/256/256',
  displayName: 'Foxy77',
  email: 'foxy@firefox.com',
  amrValues: ['amrval'],
  avatarDefault: true,
  locale: 'en',
  twoFactorAuthentication: false,
  uid: 'UIDSTRINGHERE',
  metricsEnabled: true,
};

const selectedPlan = {
  plan_id: 'planId',
  plan_name: 'Pro level',
  product_id: 'fpnID',
  product_name: 'Firefox Private Network Pro',
  currency: 'usd',
  amount: 935,
  interval: 'month' as const,
  interval_count: 1,
  active: true,
  product_metadata: null,
  plan_metadata: {
    'product:subtitle': 'Really keen product',
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
    'product:details:4:xx-pirate': "Available fer Windows, iOS an' Android",
  },
};

const invoicePreviewNoTax: FirstInvoicePreview = {
  subtotal: 935,
  total: 935,
  line_items: [],
};

const invoicePreviewInclusiveTax: FirstInvoicePreview = {
  line_items: [],
  subtotal: 885,
  total: 935,
  tax: {
    amount: 50,
    inclusive: true,
  },
};
const invoicePreviewExclusiveTax: FirstInvoicePreview = {
  line_items: [],
  subtotal: 935,
  total: 985,
  tax: {
    amount: 50,
    inclusive: false,
  },
};

const storyWithProps = (
  plan: PlanDetailsProps,
  languages?: readonly string[],
  invoicePreview?: FirstInvoicePreview
) => {
  const story = () => (
    <MockApp languages={languages}>
      <PlanDetails
        {...{
          ...plan,
          profile: userProfile,
          invoicePreview: invoicePreview || invoicePreviewNoTax,
        }}
      />
    </MockApp>
  );
  return story;
};

export const Default = storyWithProps({
  selectedPlan,
  isMobile: false,
  showExpandButton: false,
});

export const DefaulWithInclusiveTax = storyWithProps({
  selectedPlan,
  isMobile: false,
  showExpandButton: false,
  invoicePreview: invoicePreviewInclusiveTax,
});

export const DefaulWithExclusiveTax = storyWithProps({
  selectedPlan,
  isMobile: false,
  showExpandButton: false,
  invoicePreview: invoicePreviewExclusiveTax,
});

export const LocalizedToPirate = storyWithProps(
  {
    selectedPlan,
    isMobile: false,
    showExpandButton: false,
  },
  ['xx-pirate']
);

export const WithExpandedButton = storyWithProps({
  selectedPlan,
  isMobile: false,
  showExpandButton: true,
});

export const WithCouponTypeForever = storyWithProps({
  selectedPlan,
  isMobile: false,
  showExpandButton: false,
  coupon: { ...COUPON_DETAILS_VALID, type: 'forever' },
});

export const WithCouponTypeOnce = storyWithProps({
  selectedPlan,
  isMobile: false,
  showExpandButton: false,
  coupon: { ...COUPON_DETAILS_VALID, type: 'once' },
});

export const WithCouponTypeRepeatingPlanIntervalGreaterThanCouponDuration =
  storyWithProps({
    selectedPlan: { ...selectedPlan, interval_count: 6 },
    isMobile: false,
    showExpandButton: false,
    coupon: { ...COUPON_DETAILS_VALID, type: 'repeating' },
  });

export const WithCouponTypeRepeating = storyWithProps({
  selectedPlan,
  isMobile: false,
  showExpandButton: false,
  coupon: {
    ...COUPON_DETAILS_VALID,
    durationInMonths: 3,
    type: 'repeating',
  },
});
