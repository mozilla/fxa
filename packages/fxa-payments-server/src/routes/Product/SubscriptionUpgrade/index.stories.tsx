import React from 'react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';
import { storiesOf } from '@storybook/react';
import { APIError } from '../../../lib/apiClient';
import MockApp from '../../../../.storybook/components/MockApp';
import { defaultAppContext, AppContextType } from '../../../lib/AppContext';

import { SignInLayout } from '../../../components/AppLayout';

import { CUSTOMER, SELECTED_PLAN, UPGRADE_FROM_PLAN, PROFILE } from './mocks';

import SubscriptionUpgrade, { SubscriptionUpgradeProps } from './index';

function init() {
  storiesOf('routes/Product/SubscriptionUpgrade', module)
    .add('upgrade offer', () => (
      <SubscriptionUpgradeView
        props={{
          ...MOCK_PROPS,
          updateSubscriptionPlanAndRefresh: (subscriptionId, plan) =>
            linkToUpgradeSuccess(),
        }}
      />
    ))
    .add('upgrade offer localized to xx-pirate', () => (
      <SubscriptionUpgradeView
        appContextValue={{
          ...defaultAppContext,
          navigatorLanguages: ['xx-pirate'],
        }}
        props={{
          ...MOCK_PROPS,
          updateSubscriptionPlanAndRefresh: (subscriptionId, plan) =>
            linkToUpgradeSuccess(),
        }}
      />
    ))
    .add('submitting', () => (
      <SubscriptionUpgradeView
        props={{
          ...MOCK_PROPS,
          updateSubscriptionPlanStatus: {
            loading: true,
            result: null,
            error: null,
          },
        }}
      />
    ));

  storiesOf('routes/Product/SubscriptionUpgrade/failures', module).add(
    'internal server error',
    () => (
      <SubscriptionUpgradeView
        props={{
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
        }}
      />
    )
  );
}

const SubscriptionUpgradeView = ({
  props = MOCK_PROPS,
  appContextValue = defaultAppContext,
}: {
  props?: SubscriptionUpgradeProps;
  appContextValue?: AppContextType;
}) => (
  <MockApp appContextValue={appContextValue}>
    <SignInLayout>
      <SubscriptionUpgrade {...props} />
    </SignInLayout>
  </MockApp>
);

const linkToUpgradeSuccess = linkTo('routes/Product', 'success');

const linkToUpgradeOffer = linkTo(
  'routes/Product/SubscriptionUpgrade',
  'upgrade offer'
);

const MOCK_PROPS: SubscriptionUpgradeProps = {
  isMobile: false,
  profile: PROFILE,
  customer: CUSTOMER,
  selectedPlan: SELECTED_PLAN,
  upgradeFromPlan: UPGRADE_FROM_PLAN,
  upgradeFromSubscription: CUSTOMER.subscriptions[0],
  updateSubscriptionPlanStatus: {
    error: null,
    loading: false,
    result: null,
  },
  updateSubscriptionPlanAndRefresh: action('updateSubscriptionPlanAndRefresh'),
  resetUpdateSubscriptionPlan: action('resetUpdateSubscriptionPlan'),
};

init();
