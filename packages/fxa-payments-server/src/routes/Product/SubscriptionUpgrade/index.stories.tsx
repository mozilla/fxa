import React from 'react';
import { storiesOf } from '@storybook/react';
import { APIError } from '../../../lib/apiClient';
import MockApp, {
  defaultAppContextValue,
} from '../../../../.storybook/components/MockApp';
import { Customer, Profile } from '../../../lib/types';

import { SignInLayout } from '../../../components/AppLayout';

import { PROFILE, CUSTOMER, SELECTED_PLAN, UPGRADE_FROM_PLAN } from './mocks';

import SubscriptionUpgrade, { SubscriptionUpgradeProps } from './index';

function init() {
  storiesOf('routes/Product/SubscriptionUpgrade', module)
    .add('upgrade offer', () => <SubscriptionUpgradeView {...MOCK_PROPS} />)
    .add('submitting', () => (
      <SubscriptionUpgradeView
        {...{
          ...MOCK_PROPS,
          initialUpdateSubscriptionPlan: {
            pending: true,
            result: undefined,
            error: undefined,
          },
        }}
      />
    ));

  storiesOf('routes/Product/SubscriptionUpgrade/failures', module).add(
    'internal server error',
    () => (
      <SubscriptionUpgradeView
        {...{
          ...MOCK_PROPS,
          initialUpdateSubscriptionPlan: {
            pending: false,
            result: undefined,
            error: new APIError({
              statusCode: 500,
              message: 'Internal Server Error',
            }),
          },
        }}
      />
    )
  );
}

type SubscriptionUpgradeViewProps = SubscriptionUpgradeProps & {
  profile?: Profile;
  customer?: Customer;
};

const SubscriptionUpgradeView = ({
  profile = PROFILE,
  customer = CUSTOMER,
  ...props
}: SubscriptionUpgradeViewProps) => (
  <MockApp
    appContextValue={{
      ...defaultAppContextValue,
      profile,
      customer,
    }}
  >
    <SignInLayout>
      <SubscriptionUpgrade {...props} />
    </SignInLayout>
  </MockApp>
);

const MOCK_PROPS: SubscriptionUpgradeViewProps = {
  selectedPlan: SELECTED_PLAN,
  upgradeFromPlan: UPGRADE_FROM_PLAN,
  upgradeFromSubscription: CUSTOMER.subscriptions[0],
};

init();
