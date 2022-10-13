import React from 'react';
import { Meta } from '@storybook/react';

import MockApp from '../../../../.storybook/components/MockApp';
import { defaultAppContext } from '../../../lib/AppContext';
import { SignInLayout } from '../../../components/AppLayout';
import IapRoadblock, { IapRoadblockProps } from './index';

import {
  CUSTOMER,
  PLAN,
  SELECTED_PLAN,
  PROFILE,
  IAP_GOOGLE_SUBSCRIPTION,
  IAP_APPLE_SUBSCRIPTION,
} from '../../../lib/mock-data';

export default {
  title: 'routes/Product/IapRoadblock',
  component: IapRoadblock,
} as Meta;

const MOCK_PROPS: IapRoadblockProps = {
  customer: CUSTOMER,
  isMobile: false,
  profile: PROFILE,
  currentPlan: PLAN,
  selectedPlan: SELECTED_PLAN,
  subscription: IAP_GOOGLE_SUBSCRIPTION,
  code: 'iap_already_subscribed',
};

const storyWithProps = ({
  props = MOCK_PROPS,
  storyName,
}: {
  props?: IapRoadblockProps;
  storyName?: string;
}) => {
  const story = () => (
    <MockApp appContextValue={defaultAppContext}>
      <SignInLayout>
        <IapRoadblock {...props} />
      </SignInLayout>
    </MockApp>
  );

  if (storyName) story.storyName = storyName;
  return story;
};

export const Default = storyWithProps({
  storyName: 'With A Google Play Subscription',
});

export const WithAnAppleAppStoreSubscription = storyWithProps({
  props: {
    ...MOCK_PROPS,
    subscription: IAP_APPLE_SUBSCRIPTION,
  },
});

export const MozillaSupportNeededForUpgrade = storyWithProps({
  props: {
    ...MOCK_PROPS,
    code: 'iap_upgrade_contact_support',
  },
});
