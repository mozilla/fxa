/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import MockApp from '../../../.storybook/components/MockApp';
import PlanDetails from './index';
import { Profile } from '../../store/types';

const userProfile: Profile = {
  avatar: 'http://placekitten.com/256/256',
  displayName: 'Foxy77',
  email: 'foxy@firefox.com',
  amrValues: ['amrval'],
  avatarDefault: true,
  locale: 'en-US',
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
  .add('localized to xx-pirate', () => (
    <MockApp languages={['xx-pirate']}>
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
