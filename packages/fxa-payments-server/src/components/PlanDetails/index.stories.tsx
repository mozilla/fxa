import React from 'react';
import { storiesOf } from '@storybook/react';
import MockApp from '../../../.storybook/components/MockApp';
import PlanDetails from './index';

const userProfile = {
  avatar: 'http://placekitten.com/256/256',
  displayName: 'Foxy77',
  email: 'foxy@firefox.com',
  amrValues: ['amrval'],
  avatarDefault: true,
  locale: 'en-US',
  twoFactorAuthentication: false,
  uid: 'UIDSTRINGHERE',
};

const selectedPlan = {
  plan_id: 'planId',
  plan_name: 'Pro level',
  product_id: 'fpnID',
  product_name: 'Firefox Private Network Pro',
  currency: 'usd',
  amount: 935,
  interval: 'month',
  interval_count: 1,
};

storiesOf('components/PlanDetail', module)
  .add('default', () => (
    <MockApp>
      <PlanDetails
        {...{
          profile: userProfile,
          showExpandButton: false,
          selectedPlan,
          isMobile: false,
        }}
      />
    </MockApp>
  ))
  .add('with expand button', () => (
    <MockApp>
      <PlanDetails
        {...{
          profile: userProfile,
          showExpandButton: true,
          selectedPlan,
          isMobile: false,
        }}
      />
    </MockApp>
  ));
