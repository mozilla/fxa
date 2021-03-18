import React from 'react';
import { storiesOf } from '@storybook/react';
import MockApp from '../../../../.storybook/components/MockApp';
import { defaultAppContext, AppContextType } from '../../../lib/AppContext';

import { SignInLayout } from '../../../components/AppLayout';

import { SELECTED_PLAN, PROFILE } from '../../../lib/mock-data';

import SubscriptionUpgradeRoadblock, {
  SubscriptionUpgradeRoadblockProps,
} from './index';

const MOCK_PROPS: SubscriptionUpgradeRoadblockProps = {
  isMobile: false,
  profile: PROFILE,
  selectedPlan: SELECTED_PLAN,
};

const SubscriptionUpgradeRoadlbockView = ({
  props = MOCK_PROPS,
  appContextValue = defaultAppContext,
}: {
  props?: SubscriptionUpgradeRoadblockProps;
  appContextValue?: AppContextType;
}) => (
  <MockApp appContextValue={appContextValue}>
    <SignInLayout>
      <SubscriptionUpgradeRoadblock {...props} />
    </SignInLayout>
  </MockApp>
);

function init() {
  storiesOf('routes/Product/SubscriptionUpgradeRoadblock', module).add(
    'blocks subscription upgrade',
    () => (
      <SubscriptionUpgradeRoadlbockView
        props={{
          ...MOCK_PROPS,
        }}
      />
    )
  );
}

init();
