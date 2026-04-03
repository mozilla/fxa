import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import MockApp from '../../../../.storybook/components/MockApp';
import { defaultAppContext, AppContextType } from '../../../lib/AppContext';
import { SignInLayout } from '../../../components/AppLayout';

import {
  CUSTOMER,
  PLAN,
  SELECTED_PLAN,
  PROFILE,
  IAP_GOOGLE_SUBSCRIPTION,
  IAP_APPLE_SUBSCRIPTION,
} from '../../../lib/mock-data';

import IapRoadblock, { IapRoadblockProps } from './index';

const MOCK_PROPS: IapRoadblockProps = {
  customer: CUSTOMER,
  isMobile: false,
  profile: PROFILE,
  currentPlan: PLAN,
  selectedPlan: SELECTED_PLAN,
  subscription: IAP_GOOGLE_SUBSCRIPTION,
  code: 'iap_already_subscribed',
};

const IapRoadblockView = ({
  props = MOCK_PROPS,
  appContextValue = defaultAppContext,
}: {
  props?: IapRoadblockProps;
  appContextValue?: AppContextType;
}) => (
  <MockApp appContextValue={appContextValue}>
    <SignInLayout>
      <IapRoadblock {...props} />
    </SignInLayout>
  </MockApp>
);

const meta: Meta = {
  title: 'routes/Product/IapRoadblock',
};
export default meta;

type Story = StoryObj;

export const WithAGooglePlaySubscription: Story = {
  name: 'with a Google Play subscription',
  render: () => (
    <IapRoadblockView
      props={{
        ...MOCK_PROPS,
      }}
    />
  ),
};

export const WithAnAppleAppStoreSubscription: Story = {
  name: 'with an Apple App Store subscription',
  render: () => (
    <IapRoadblockView
      props={{
        ...MOCK_PROPS,
        subscription: IAP_APPLE_SUBSCRIPTION,
      }}
    />
  ),
};

export const MozillaSupportNeededForUpgrade: Story = {
  name: 'Mozilla support needed for upgrade',
  render: () => (
    <IapRoadblockView
      props={{
        ...MOCK_PROPS,
        code: 'iap_upgrade_contact_support',
      }}
    />
  ),
};
