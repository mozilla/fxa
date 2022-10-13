import React from 'react';
import { Meta } from '@storybook/react';
import MockApp from '../../../../.storybook/components/MockApp';
import { defaultAppContext } from '../../../lib/AppContext';
import { SignInLayout } from '../../../components/AppLayout';
import { SELECTED_PLAN, PROFILE } from '../../../lib/mock-data';

import SubscriptionChangeRoadblock, {
  SubscriptionDowngradeRoadblockProps,
} from './index';

export default {
  title: 'routes/Product/SubscriptionChangeRoadblock',
  component: SubscriptionChangeRoadblock,
} as Meta;

const props: SubscriptionDowngradeRoadblockProps = {
  isMobile: false,
  profile: PROFILE,
  selectedPlan: SELECTED_PLAN,
};

export const Default = () => {
  return (
    <MockApp appContextValue={defaultAppContext}>
      <SignInLayout>
        <SubscriptionChangeRoadblock {...props} />
      </SignInLayout>
    </MockApp>
  );
};
